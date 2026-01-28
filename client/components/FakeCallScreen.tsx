import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Pressable, Modal, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { Spacing, EmergencyColors } from "@/constants/theme";
import { useApp } from "@/context/AppContext";

interface FakeCallScreenProps {
  visible: boolean;
  onEnd: () => void;
}

export function FakeCallScreen({ visible, onEnd }: FakeCallScreenProps) {
  const { t } = useApp();
  const insets = useSafeAreaInsets();
  const pulseScale = useSharedValue(1);
  const vibrationInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );

      vibrationInterval.current = setInterval(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }, 1500);
    } else {
      pulseScale.value = 1;
      if (vibrationInterval.current) {
        clearInterval(vibrationInterval.current);
        vibrationInterval.current = null;
      }
    }

    return () => {
      if (vibrationInterval.current) {
        clearInterval(vibrationInterval.current);
      }
    };
  }, [visible]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleEnd = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onEnd();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.callerInfo}>
          <ThemedText style={styles.incomingText} lightColor="#FFFFFF" darkColor="#FFFFFF">
            {t.incomingCall}
          </ThemedText>
          <Image
            source={require("../../assets/images/default-avatar.png")}
            style={styles.callerAvatar}
          />
          <ThemedText style={styles.callerName} lightColor="#FFFFFF" darkColor="#FFFFFF">
            {t.unknownCaller}
          </ThemedText>
        </View>

        <View style={styles.buttonsContainer}>
          <Animated.View style={pulseStyle}>
            <Pressable
              onPress={handleEnd}
              style={styles.endCallButton}
            >
              <Feather name="phone-off" size={32} color="#FFFFFF" />
            </Pressable>
          </Animated.View>
          <ThemedText style={styles.endLabel} lightColor="#FFFFFF" darkColor="#FFFFFF">
            {t.endCall}
          </ThemedText>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
  },
  callerInfo: {
    alignItems: "center",
    paddingTop: Spacing["5xl"],
  },
  incomingText: {
    fontSize: 18,
    marginBottom: Spacing["3xl"],
    opacity: 0.8,
  },
  callerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.xl,
  },
  callerName: {
    fontSize: 32,
    fontWeight: "600",
  },
  buttonsContainer: {
    alignItems: "center",
    paddingBottom: Spacing["4xl"],
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: EmergencyColors.medical,
    alignItems: "center",
    justifyContent: "center",
  },
  endLabel: {
    fontSize: 14,
    marginTop: Spacing.md,
    opacity: 0.8,
  },
});
