import React, { useState, useRef, useCallback } from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { EmergencyColors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

interface SOSButtonProps {
  onActivate: () => void;
  disabled?: boolean;
}

const HOLD_DURATION = 1000;
const BUTTON_SIZE = Spacing.sosButtonSize;

export function SOSButton({ onActivate, disabled = false }: SOSButtonProps) {
  const { t, settings } = useApp();
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const progressValue = useSharedValue(0);

  const startHold = useCallback(() => {
    if (disabled) return;

    setIsHolding(true);
    setProgress(0);
    progressValue.value = 0;

    if (!settings.silentSOS) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 200 }),
        withTiming(1, { duration: 200 })
      ),
      -1,
      true
    );

    progressValue.value = withTiming(1, { duration: HOLD_DURATION });

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 50 / HOLD_DURATION;
        return Math.min(next, 1);
      });
    }, 50);

    holdTimer.current = setTimeout(() => {
      if (!settings.silentSOS) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      endHold();
      onActivate();
    }, HOLD_DURATION);
  }, [disabled, settings.silentSOS, onActivate]);

  const endHold = useCallback(() => {
    setIsHolding(false);
    setProgress(0);

    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    pulseScale.value = 1;
    progressValue.value = withTiming(0, { duration: 200 });
  }, []);

  const longPressGesture = Gesture.LongPress()
    .minDuration(0)
    .onStart(() => {
      runOnJS(startHold)();
    })
    .onEnd(() => {
      runOnJS(endHold)();
    })
    .onFinalize(() => {
      runOnJS(endHold)();
    });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + progressValue.value * 0.15 }],
    opacity: progressValue.value * 0.5,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.progressRing, animatedProgressStyle]} />
      <GestureDetector gesture={longPressGesture}>
        <Animated.View
          style={[
            styles.button,
            { opacity: disabled ? 0.5 : 1 },
            animatedButtonStyle,
          ]}
        >
          <View style={styles.innerButton}>
            <ThemedText
              style={styles.sosText}
              lightColor="#FFFFFF"
              darkColor="#FFFFFF"
            >
              {t.sos}
            </ThemedText>
            <ThemedText
              style={styles.holdText}
              lightColor="rgba(255,255,255,0.8)"
              darkColor="rgba(255,255,255,0.8)"
            >
              {isHolding ? `${Math.round(progress * 100)}%` : t.holdForSOS}
            </ThemedText>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: BUTTON_SIZE + 40,
    height: BUTTON_SIZE + 40,
  },
  progressRing: {
    position: "absolute",
    width: BUTTON_SIZE + 20,
    height: BUTTON_SIZE + 20,
    borderRadius: (BUTTON_SIZE + 20) / 2,
    backgroundColor: EmergencyColors.sos,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: EmergencyColors.sos,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.sos,
  },
  innerButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  sosText: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: 4,
  },
  holdText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: Spacing.xs,
  },
});
