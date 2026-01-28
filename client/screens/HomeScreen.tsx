import React, { useState, useCallback } from "react";
import { StyleSheet, View, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { SOSButton } from "@/components/SOSButton";
import { NetworkStatusBadge } from "@/components/NetworkStatusBadge";
import { LocationStatus } from "@/components/LocationStatus";
import { EmergencyCategoryCard } from "@/components/EmergencyCategoryCard";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { Spacing, EmergencyColors, BorderRadius } from "@/constants/theme";
import { EmergencyType } from "@/lib/storage";
import { Image } from "react-native";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, settings, updateSettings, sendSOS, contacts } = useApp();

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const emergencyTypes: EmergencyType[] = ["medical", "fire", "police", "threat", "disaster"];

  const handleCategorySelect = async (type: EmergencyType) => {
    await updateSettings({ selectedEmergencyType: type });
    setShowCategoryModal(false);
  };

  const handleSOSActivate = useCallback(async () => {
    const result = await sendSOS();
    if (result.success) {
      setSentCount(result.sentTo);
      setShowSuccessModal(true);
    }
  }, [sendSOS]);

  const getCurrentTypeLabel = () => {
    const key = settings.selectedEmergencyType as keyof typeof t.emergencyTypes;
    return t.emergencyTypes[key];
  };

  const getCurrentTypeColor = () => {
    return EmergencyColors[settings.selectedEmergencyType];
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.headerLeft}>
          <NetworkStatusBadge />
        </View>
        <Pressable
          onPress={() => setShowCategoryModal(true)}
          style={({ pressed }) => [
            styles.categoryButton,
            { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Feather name="grid" size={20} color={theme.text} />
        </Pressable>
      </View>

      <View style={[styles.content, { paddingBottom: tabBarHeight + Spacing.xl }]}>
        <Pressable
          onPress={() => setShowCategoryModal(true)}
          style={[
            styles.categoryLabel,
            { backgroundColor: getCurrentTypeColor() + "20", borderColor: getCurrentTypeColor() },
          ]}
        >
          <ThemedText style={[styles.categoryText, { color: getCurrentTypeColor() }]}>
            {getCurrentTypeLabel()}
          </ThemedText>
          <Feather name="chevron-down" size={18} color={getCurrentTypeColor()} />
        </Pressable>

        <SOSButton onActivate={handleSOSActivate} disabled={contacts.length === 0} />

        <LocationStatus />

        {contacts.length === 0 ? (
          <ThemedText style={[styles.warningText, { color: theme.textSecondary }]}>
            {t.noContacts}
          </ThemedText>
        ) : null}
      </View>

      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText style={styles.modalTitle}>{t.selectEmergency}</ThemedText>
            <Pressable
              onPress={() => setShowCategoryModal(false)}
              style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            {emergencyTypes.map((type) => (
              <EmergencyCategoryCard
                key={type}
                type={type}
                label={t.emergencyTypes[type]}
                selected={settings.selectedEmergencyType === type}
                onPress={() => handleCategorySelect(type)}
              />
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccessModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successOverlay}>
          <View style={[styles.successModal, { backgroundColor: theme.backgroundRoot }]}>
            <Image
              source={require("../../assets/images/sos-success.png")}
              style={styles.successImage}
              resizeMode="contain"
            />
            <ThemedText style={styles.successTitle}>{t.alertSent}</ThemedText>
            <ThemedText style={[styles.successDescription, { color: theme.textSecondary }]}>
              {t.alertSentTo} {sentCount} {t.contacts.toLowerCase()}
            </ThemedText>
            <Pressable
              onPress={() => setShowSuccessModal(false)}
              style={[styles.successButton, { backgroundColor: theme.link }]}
            >
              <ThemedText style={styles.successButtonText}>{t.close}</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  categoryButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  categoryLabel: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "600",
  },
  warningText: {
    fontSize: 14,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: Spacing.xs,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  successModal: {
    width: "100%",
    borderRadius: BorderRadius.xl,
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  successImage: {
    width: 120,
    height: 120,
    marginBottom: Spacing.xl,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  successDescription: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  successButton: {
    paddingHorizontal: Spacing["3xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
