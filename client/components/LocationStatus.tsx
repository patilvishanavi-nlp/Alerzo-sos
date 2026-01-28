import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { useEffect } from "react";

export function LocationStatus() {
  const { locationStatus, t, refreshLocation } = useApp();
  const { theme, isDark } = useTheme();
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (locationStatus === "loading") {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1500 }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [locationStatus]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const getStatusConfig = () => {
    switch (locationStatus) {
      case "ready":
        return {
          icon: "check-circle" as const,
          label: t.locationReady,
          color: Colors.light.success,
        };
      case "using_last":
        return {
          icon: "clock" as const,
          label: t.usingLastKnown,
          color: "#FF9800",
        };
      case "loading":
        return {
          icon: "loader" as const,
          label: t.gettingLocation,
          color: theme.textSecondary,
        };
      case "unavailable":
        return {
          icon: "x-circle" as const,
          label: t.enableLocation,
          color: "#F44336",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Pressable
      onPress={refreshLocation}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Animated.View style={locationStatus === "loading" ? animatedStyle : undefined}>
        <Feather name={config.icon} size={18} color={config.color} />
      </Animated.View>
      <ThemedText style={[styles.label, { color: config.color }]}>
        {config.label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
});
