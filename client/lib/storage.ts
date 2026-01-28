import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "./i18n";

const STORAGE_KEYS = {
  LAST_LOCATION: "@rakshasos:last_location",
};

export interface StoredLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export type EmergencyType = "medical" | "fire" | "police" | "threat" | "disaster";

export async function getLastLocation(): Promise<StoredLocation | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_LOCATION);
    if (data) {
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error("Error getting last location:", error);
    return null;
  }
}

export async function saveLastLocation(location: StoredLocation): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify(location));
  } catch (error) {
    console.error("Error saving last location:", error);
  }
}

export function generateMapsLink(location: StoredLocation): string {
  return `https://maps.google.com/maps?q=${location.latitude},${location.longitude}`;
}

export function generateSOSMessage(
  emergencyType: EmergencyType,
  location: StoredLocation | null,
  language: Language = "en"
): string {
  const typeLabels: Record<Language, Record<EmergencyType, string>> = {
    en: {
      medical: "MEDICAL EMERGENCY",
      fire: "FIRE EMERGENCY",
      police: "POLICE HELP NEEDED",
      threat: "KIDNAPPING/THREAT",
      disaster: "NATURAL DISASTER",
    },
    hi: {
      medical: "चिकित्सा आपातकाल",
      fire: "आग आपातकाल",
      police: "पुलिस सहायता चाहिए",
      threat: "अपहरण/धमकी",
      disaster: "प्राकृतिक आपदा",
    },
    mr: {
      medical: "वैद्यकीय आणीबाणी",
      fire: "आग आणीबाणी",
      police: "पोलीस मदत हवी",
      threat: "अपहरण/धमकी",
      disaster: "नैसर्गिक आपत्ती",
    },
  };

  const messages: Record<Language, (type: string, link: string) => string> = {
    en: (type, link) => `SOS ALERT! ${type}. I need immediate help! My location: ${link}`,
    hi: (type, link) => `SOS अलर्ट! ${type}। मुझे तुरंत मदद चाहिए! मेरा स्थान: ${link}`,
    mr: (type, link) => `SOS अलर्ट! ${type}। मला तातडीने मदत हवी! माझे स्थान: ${link}`,
  };

  const typeLabel = typeLabels[language][emergencyType];
  const locationLink = location ? generateMapsLink(location) : "Location unavailable";
  
  return messages[language](typeLabel, locationLink);
}
