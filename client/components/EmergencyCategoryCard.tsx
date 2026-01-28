import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { EmergencyColors, Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { EmergencyType } from "@/lib/storage";

interface EmergencyCategoryCardProps {
  type: EmergencyType;
  label: string;
  selected?: boolean;
  onPress: () => void;
}

const categoryConfig: Record<EmergencyType, { icon: keyof typeof Feather.glyphMap; color: string }> = {
  medical: { icon: "heart", color: EmergencyColors.medical },
  fire: { icon: "zap", color: EmergencyColors.fire },
  police: { icon: "shield", color: EmergencyColors.police },
  threat: { icon: "alert-triangle", color: EmergencyColors.threat },
  disaster: { icon: "alert-circle", color: EmergencyColors.disaster },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EmergencyCategoryCard({
  type,
  label,
  selected = false,
  onPress,
}: EmergencyCategoryCardProps) {
  const { theme } = useTheme();
  const config = categoryConfig[type];
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: selected ? config.color : theme.backgroundDefault,
          borderColor: config.color,
          borderWidth: selected ? 0 : 2,
        },
        animatedStyle,
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: selected ? "rgba(255,255,255,0.2)" : config.color + "20" },
        ]}
      >
        <Feather
          name={config.icon}
          size={28}
          color={selected ? "#FFFFFF" : config.color}
        />
      </View>
      <ThemedText
        style={[
          styles.label,
          { color: selected ? "#FFFFFF" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
      {selected ? (
        <View style={styles.checkmark}>
          <Feather name="check" size={20} color="#FFFFFF" />
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    minHeight: Spacing.categoryCardHeight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  label: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});
