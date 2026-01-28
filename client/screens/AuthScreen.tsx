import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, BorderRadius, EmergencyColors } from "@/constants/theme";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      const result = isLogin
        ? await login(username.trim(), password)
        : await register(username.trim(), password);

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.error || "An error occurred");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setConfirmPassword("");
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing["4xl"] }]}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={styles.title}>Alerzo</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isLogin ? "Welcome back" : "Create your account"}
        </ThemedText>
      </View>

      <View style={styles.form}>
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: EmergencyColors.medical + "20" }]}>
            <ThemedText style={[styles.errorText, { color: EmergencyColors.medical }]}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Username</ThemedText>
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="none"
            autoCorrect={false}
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.inputLabel}>Password</ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
          />
        </View>

        {!isLogin ? (
          <View style={styles.inputGroup}>
            <ThemedText style={styles.inputLabel}>Confirm Password</ThemedText>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
              style={[
                styles.input,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
            />
          </View>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: EmergencyColors.sos, opacity: pressed || isLoading ? 0.7 : 1 },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ThemedText style={styles.submitButtonText}>
              {isLogin ? "Login" : "Create Account"}
            </ThemedText>
          )}
        </Pressable>

        <View style={styles.toggleContainer}>
          <ThemedText style={{ color: theme.textSecondary }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </ThemedText>
          <Pressable onPress={toggleMode}>
            <ThemedText style={[styles.toggleLink, { color: theme.link }]}>
              {isLogin ? " Sign up" : " Login"}
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
          Your contacts will be synced across devices
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  submitButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  toggleLink: {
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
  },
});
