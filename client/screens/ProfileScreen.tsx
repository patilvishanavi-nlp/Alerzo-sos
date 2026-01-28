import React, { useState } from "react";
import { StyleSheet, View, Image, Pressable, TextInput, ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { SettingsRow } from "@/components/SettingsRow";
import { LanguageSelector } from "@/components/LanguageSelector";
import { FakeCallScreen } from "@/components/FakeCallScreen";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, EmergencyColors } from "@/constants/theme";
import { Language } from "@/lib/i18n";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, settings, updateSettings } = useApp();
  const { user, logout } = useAuth();

  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [showFakeCall, setShowFakeCall] = useState(false);

  const handleLanguageChange = async (language: Language) => {
    await updateSettings({ language });
  };

  const handleToggleFakeCall = async (value: boolean) => {
    await updateSettings({ fakeCallEnabled: value });
  };

  const handleToggleSilentSOS = async (value: boolean) => {
    await updateSettings({ silentSOS: value });
  };

  const handleToggleSiren = async (value: boolean) => {
    await updateSettings({ sirenSound: value });
  };

  const handleTogglePowerSaving = async (value: boolean) => {
    await updateSettings({ powerSaving: value });
  };

  const handleSaveName = async () => {
    await updateSettings({ name: nameInput.trim() } as any);
    setIsEditingName(false);
  };

  const handleStartFakeCall = () => {
    setShowFakeCall(true);
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: logout },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={styles.profileSection}>
          <Image
            source={require("../../assets/images/default-avatar.png")}
            style={styles.avatar}
          />
          {isEditingName ? (
            <View style={styles.nameInputContainer}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                placeholder={t.name}
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.nameInput,
                  {
                    backgroundColor: theme.backgroundDefault,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                autoFocus
                onBlur={handleSaveName}
                onSubmitEditing={handleSaveName}
              />
            </View>
          ) : (
            <Pressable
              onPress={() => {
                setNameInput(user?.name || "");
                setIsEditingName(true);
              }}
              style={styles.nameContainer}
            >
              <ThemedText style={styles.userName}>
                {user?.name || user?.username || t.name}
              </ThemedText>
              <Feather name="edit-2" size={16} color={theme.textSecondary} />
            </Pressable>
          )}
          <ThemedText style={[styles.usernameText, { color: theme.textSecondary }]}>
            @{user?.username}
          </ThemedText>
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t.language}
          </ThemedText>
          <LanguageSelector value={settings.language} onChange={handleLanguageChange} />
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t.safetyFeatures}
          </ThemedText>
          <SettingsRow
            icon="phone-incoming"
            label={t.fakeCall}
            description={t.fakeCallDesc}
            value={settings.fakeCallEnabled}
            onToggle={handleToggleFakeCall}
          />
          {settings.fakeCallEnabled ? (
            <Pressable
              onPress={handleStartFakeCall}
              style={[styles.fakeCallButton, { backgroundColor: theme.link }]}
            >
              <Feather name="phone" size={18} color="#FFFFFF" />
              <ThemedText style={styles.fakeCallButtonText}>{t.startFakeCall}</ThemedText>
            </Pressable>
          ) : null}
          <SettingsRow
            icon="volume-x"
            label={t.silentSOS}
            description={t.silentSOSDesc}
            value={settings.silentSOS}
            onToggle={handleToggleSilentSOS}
          />
          <SettingsRow
            icon="volume-2"
            label={t.sirenSound}
            description={t.sirenSoundDesc}
            value={settings.sirenSound}
            onToggle={handleToggleSiren}
          />
          <SettingsRow
            icon="battery-charging"
            label={t.powerSaving}
            description={t.powerSavingDesc}
            value={settings.powerSaving}
            onToggle={handleTogglePowerSaving}
          />
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t.about}
          </ThemedText>
          <SettingsRow
            icon="shield"
            label={t.privacy}
            description="Your data is securely synced"
            showChevron
          />
          <SettingsRow
            icon="info"
            label={t.version}
            rightElement={
              <ThemedText style={{ color: theme.textSecondary }}>1.0.0</ThemedText>
            }
          />
        </View>

        <Pressable
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="log-out" size={20} color={EmergencyColors.medical} />
          <ThemedText style={[styles.logoutText, { color: EmergencyColors.medical }]}>
            Logout
          </ThemedText>
        </Pressable>
      </ScrollView>

      <FakeCallScreen visible={showFakeCall} onEnd={() => setShowFakeCall(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.lg,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
  },
  usernameText: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  nameInputContainer: {
    width: "80%",
  },
  nameInput: {
    height: 44,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 18,
    textAlign: "center",
    borderWidth: 1,
  },
  section: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  fakeCallButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  fakeCallButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
