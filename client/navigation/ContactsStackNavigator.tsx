import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ContactsScreen from "@/screens/ContactsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useApp } from "@/context/AppContext";

export type ContactsStackParamList = {
  Contacts: undefined;
};

const Stack = createNativeStackNavigator<ContactsStackParamList>();

export default function ContactsStackNavigator() {
  const screenOptions = useScreenOptions();
  const { t } = useApp();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{
          headerTitle: t.trustedContacts,
        }}
      />
    </Stack.Navigator>
  );
}
