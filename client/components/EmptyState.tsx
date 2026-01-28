import React from "react";
import { StyleSheet, View, Image, ImageSourcePropType } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface EmptyStateProps {
  image: ImageSourcePropType;
  title: string;
  description?: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
}

export function EmptyState({
  image,
  title,
  description,
  buttonLabel,
  onButtonPress,
}: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <ThemedText style={styles.title}>{title}</ThemedText>
      {description ? (
        <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
          {description}
        </ThemedText>
      ) : null}
      {buttonLabel && onButtonPress ? (
        <Button onPress={onButtonPress} style={styles.button}>
          {buttonLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  image: {
    width: 180,
    height: 180,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  button: {
    minWidth: 200,
  },
});
