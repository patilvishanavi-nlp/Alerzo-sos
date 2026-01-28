import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import * as Haptics from "expo-haptics";
import * as SMS from "expo-sms";

import { apiRequest, getApiUrl } from "@/lib/query-client";
import { useAuth } from "@/context/AuthContext";
import { Language, getTranslation } from "@/lib/i18n";
import {
  StoredLocation,
  EmergencyType,
  getLastLocation,
  saveLastLocation,
  generateSOSMessage,
} from "@/lib/storage";

type NetworkStatus = "online" | "offline" | "sms_only";

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  relationship: string | null;
  createdAt: string;
}

export interface AppSettings {
  language: Language;
  darkMode: boolean;
  fakeCallEnabled: boolean;
  silentSOS: boolean;
  sirenSound: boolean;
  powerSaving: boolean;
  selectedEmergencyType: EmergencyType;
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  contacts: EmergencyContact[];
  addContact: (contact: { name: string; phone: string; relationship?: string }) => Promise<EmergencyContact>;
  editContact: (id: string, contact: { name?: string; phone?: string; relationship?: string }) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  refreshContacts: () => Promise<void>;
  location: StoredLocation | null;
  locationStatus: "ready" | "using_last" | "loading" | "unavailable";
  networkStatus: NetworkStatus;
  sendSOS: () => Promise<{ success: boolean; sentTo: number }>;
  t: ReturnType<typeof getTranslation>;
  refreshLocation: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

const MAX_CONTACTS = 10;

export function AppProvider({ children }: { children: ReactNode }) {
  const { user, refreshUser } = useAuth();

  const [settings, setSettings] = useState<AppSettings>({
    language: (user?.language as Language) || "en",
    darkMode: user?.darkMode || false,
    fakeCallEnabled: user?.fakeCallEnabled || false,
    silentSOS: user?.silentSOS || false,
    sirenSound: user?.sirenSound ?? true,
    powerSaving: user?.powerSaving || false,
    selectedEmergencyType: (user?.selectedEmergencyType as EmergencyType) || "medical",
  });
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [location, setLocation] = useState<StoredLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<"ready" | "using_last" | "loading" | "unavailable">("loading");
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>("online");
  const [isLoading, setIsLoading] = useState(true);

  const t = getTranslation(settings.language);

  useEffect(() => {
    if (user) {
      setSettings({
        language: (user.language as Language) || "en",
        darkMode: user.darkMode || false,
        fakeCallEnabled: user.fakeCallEnabled || false,
        silentSOS: user.silentSOS || false,
        sirenSound: user.sirenSound ?? true,
        powerSaving: user.powerSaving || false,
        selectedEmergencyType: (user.selectedEmergencyType as EmergencyType) || "medical",
      });
      loadContacts();
    }
  }, [user]);

  useEffect(() => {
    setupNetworkListener();
    requestLocationPermission();
    loadLastLocation();
  }, []);

  const loadLastLocation = async () => {
    const lastLoc = await getLastLocation();
    if (lastLoc) {
      setLocation(lastLoc);
      setLocationStatus("using_last");
    }
    setIsLoading(false);
  };

  const loadContacts = async () => {
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/contacts", baseUrl), {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        setNetworkStatus("online");
      } else if (state.isConnected) {
        setNetworkStatus("sms_only");
      } else {
        setNetworkStatus("offline");
      }
    });
    return unsubscribe;
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        await refreshLocation();
      } else {
        setLocationStatus("unavailable");
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setLocationStatus("unavailable");
    }
  };

  const refreshLocation = useCallback(async () => {
    setLocationStatus("loading");
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const storedLocation: StoredLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        timestamp: currentLocation.timestamp,
        accuracy: currentLocation.coords.accuracy ?? undefined,
      };
      setLocation(storedLocation);
      setLocationStatus("ready");
      await saveLastLocation(storedLocation);
    } catch (error) {
      console.error("Error getting location:", error);
      const lastLocation = await getLastLocation();
      if (lastLocation) {
        setLocation(lastLocation);
        setLocationStatus("using_last");
      } else {
        setLocationStatus("unavailable");
      }
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);

      await apiRequest("PATCH", "/api/user/settings", newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  }, [settings]);

  const refreshContacts = useCallback(async () => {
    await loadContacts();
  }, []);

  const addContact = useCallback(async (contact: { name: string; phone: string; relationship?: string }) => {
    if (contacts.length >= MAX_CONTACTS) {
      throw new Error(`Maximum ${MAX_CONTACTS} contacts allowed`);
    }

    const response = await apiRequest("POST", "/api/contacts", contact);
    const newContact = await response.json();
    setContacts((prev) => [...prev, newContact]);
    return newContact;
  }, [contacts.length]);

  const editContact = useCallback(async (id: string, contact: { name?: string; phone?: string; relationship?: string }) => {
    const response = await apiRequest("PATCH", `/api/contacts/${id}`, contact);
    const updatedContact = await response.json();
    setContacts((prev) => prev.map((c) => (c.id === id ? updatedContact : c)));
  }, []);

  const removeContact = useCallback(async (id: string) => {
    await apiRequest("DELETE", `/api/contacts/${id}`, {});
    setContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const sendSOS = useCallback(async (): Promise<{ success: boolean; sentTo: number }> => {
    if (!settings.silentSOS) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }

    if (contacts.length === 0) {
      return { success: false, sentTo: 0 };
    }

    const message = generateSOSMessage(settings.selectedEmergencyType, location, settings.language);
    const phoneNumbers = contacts.map((c) => c.phone);

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        await SMS.sendSMSAsync(phoneNumbers, message);
        if (!settings.silentSOS) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        return { success: true, sentTo: contacts.length };
      } else {
        return { success: false, sentTo: 0 };
      }
    } catch (error) {
      console.error("Error sending SOS:", error);
      if (!settings.silentSOS) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return { success: false, sentTo: 0 };
    }
  }, [contacts, location, settings]);

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        contacts,
        addContact,
        editContact,
        removeContact,
        refreshContacts,
        location,
        locationStatus,
        networkStatus,
        sendSOS,
        t,
        refreshLocation,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
