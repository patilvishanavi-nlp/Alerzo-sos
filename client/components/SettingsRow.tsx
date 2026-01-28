import React from "react";
import { StyleSheet, View, Pressable, Switch, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, EmergencyColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface SettingsRowProps {
  icon?: keyof typeof Feather.glyphMap;
  label: string;
  description?: string;
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}

export function SettingsRow({
  icon,
  label,
  description,
  value,
  onToggle,
  onPress,
  rightElement,
  showChevron = false,
}: SettingsRowProps) {
  const { theme } = useTheme();

  const handleToggle = (newValue: boolean) => {
    Haptics.selectionAsync();
    onToggle?.(newValue);
  };

  const content = (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      {icon ? (
        <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name={icon} size={20} color={theme.text} />
        </View>
      ) : null}
      <View style={styles.textContainer}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        {description ? (
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {onToggle !== undefined && value !== undefined ? (
        <Switch
          value={value}
          onValueChange={handleToggle}
          trackColor={{ false: theme.backgroundTertiary, true: EmergencyColors.sos + "80" }}
          thumbColor={value ? EmergencyColors.sos : theme.backgroundSecondary}
          ios_backgroundColor={theme.backgroundTertiary}
        />
      ) : null}
      {rightElement}
      {showChevron ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: Spacing.touchTargetMin,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
});
