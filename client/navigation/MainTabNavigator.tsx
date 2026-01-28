import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import ContactsStackNavigator from "@/navigation/ContactsStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { useApp } from "@/context/AppContext";
import { EmergencyColors, Spacing } from "@/constants/theme";

export type MainTabParamList = {
  HomeTab: undefined;
  ContactsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { t } = useApp();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: EmergencyColors.sos,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: 90,
          paddingTop: Spacing.sm,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: t.home,
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Feather name="home" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ContactsTab"
        component={ContactsStackNavigator}
        options={{
          title: t.contacts,
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Feather name="users" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: t.profile,
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Feather name="user" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 28,
  },
});
