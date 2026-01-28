import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, EmergencyColors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { Language, languageNames } from "@/lib/i18n";

interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
}

const languages: Language[] = ["en", "hi", "mr"];

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {languages.map((lang) => {
        const isSelected = lang === value;
        return (
          <Pressable
            key={lang}
            onPress={() => onChange(lang)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected ? EmergencyColors.sos : theme.backgroundDefault,
                borderColor: isSelected ? EmergencyColors.sos : theme.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.label,
                { color: isSelected ? "#FFFFFF" : theme.text },
              ]}
            >
              {languageNames[lang]}
            </ThemedText>
            {isSelected ? (
              <Feather name="check" size={18} color="#FFFFFF" />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  option: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
