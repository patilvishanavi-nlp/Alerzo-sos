import React from "react";
import { StyleSheet, View, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { EmergencyContact } from "@/context/AppContext";

interface ContactCardProps {
  contact: EmergencyContact;
  onPress: () => void;
  onDelete: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ContactCard({ contact, onPress, onDelete }: ContactCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
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
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <Image
        source={require("../../assets/images/default-avatar.png")}
        style={styles.avatar}
      />
      <View style={styles.info}>
        <ThemedText style={styles.name}>{contact.name}</ThemedText>
        <ThemedText style={[styles.detail, { color: theme.textSecondary }]}>
          {contact.phone}
        </ThemedText>
        {contact.relationship ? (
          <ThemedText style={[styles.relationship, { color: theme.textSecondary }]}>
            {contact.relationship}
          </ThemedText>
        ) : null}
      </View>
      <Pressable
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          { opacity: pressed ? 0.6 : 1 },
        ]}
        hitSlop={12}
      >
        <Feather name="trash-2" size={20} color={theme.error} />
      </Pressable>
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
    minHeight: 72,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.lg,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },
  detail: {
    fontSize: 14,
  },
  relationship: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
});
