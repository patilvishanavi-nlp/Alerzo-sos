import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Modal,
  TextInput,
  Pressable,
  Alert,
  Platform,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ContactCard } from "@/components/ContactCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useApp, EmergencyContact } from "@/context/AppContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const MAX_CONTACTS = 10;

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { t, contacts, addContact, editContact, removeContact, refreshContacts } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resetForm = () => {
    setName("");
    setPhone("");
    setRelationship("");
    setEditingContact(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setRelationship(contact.relationship || "");
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshContacts();
    setIsRefreshing(false);
  };

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      if (editingContact) {
        await editContact(editingContact.id, {
          name: name.trim(),
          phone: phone.trim(),
          relationship: relationship.trim() || undefined,
        });
      } else {
        if (contacts.length >= MAX_CONTACTS) {
          Alert.alert(t.maxContactsReached);
          return;
        }
        await addContact({
          name: name.trim(),
          phone: phone.trim(),
          relationship: relationship.trim() || undefined,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeModal();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", error.message || "Failed to save contact");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeContact(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      });

      if (data.length > 0) {
        const contact = data[0];
        if (contact.name) {
          setName(contact.name);
        }
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          setPhone(contact.phoneNumbers[0].number || "");
        }
      }
    } catch (error) {
      console.error("Error picking contact:", error);
    }
  };

  const renderContact = ({ item }: { item: EmergencyContact }) => (
    <ContactCard
      contact={item}
      onPress={() => openEditModal(item)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  const renderEmptyState = () => (
    <EmptyState
      image={require("../../assets/images/empty-contacts.png")}
      title={t.noContacts}
      description={t.addContactsDesc.replace("5", "10")}
      buttonLabel={t.addContact}
      onButtonPress={openAddModal}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={contacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
            flexGrow: 1,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      />

      {contacts.length > 0 && contacts.length < MAX_CONTACTS ? (
        <View style={[styles.fabContainer, { bottom: tabBarHeight + Spacing.xl }]}>
          <Pressable
            onPress={openAddModal}
            style={({ pressed }) => [
              styles.fab,
              { backgroundColor: theme.link, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Feather name="plus" size={28} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : null}

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={closeModal} style={styles.modalAction}>
              <ThemedText style={{ color: theme.link }}>{t.cancel}</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingContact ? t.editContact : t.addContact}
            </ThemedText>
            <Pressable
              onPress={handleSave}
              disabled={isLoading}
              style={[styles.modalAction, { opacity: isLoading ? 0.5 : 1 }]}
            >
              <ThemedText style={{ color: theme.link, fontWeight: "600" }}>{t.save}</ThemedText>
            </Pressable>
          </View>

          <View style={styles.modalContent}>
            {!editingContact && Platform.OS !== "web" ? (
              <Button onPress={handlePickContact} style={styles.pickButton}>
                {t.pickFromContacts}
              </Button>
            ) : null}

            <View style={styles.inputGroup}>
              <ThemedText style={styles.inputLabel}>{t.name}</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t.name}
                placeholderTextColor={theme.textSecondary}
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
              <ThemedText style={styles.inputLabel}>{t.phone}</ThemedText>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder={t.phone}
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
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
              <ThemedText style={styles.inputLabel}>{t.relationship}</ThemedText>
              <TextInput
                value={relationship}
                onChangeText={setRelationship}
                placeholder={t.relationship}
                placeholderTextColor={theme.textSecondary}
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

            <ThemedText style={[styles.contactCount, { color: theme.textSecondary }]}>
              {contacts.length} / {MAX_CONTACTS} contacts
            </ThemedText>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  fabContainer: {
    position: "absolute",
    right: Spacing.xl,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  modalAction: {
    minWidth: 60,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  pickButton: {
    marginBottom: Spacing.xl,
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
  contactCount: {
    textAlign: "center",
    marginTop: Spacing.xl,
    fontSize: 14,
  },
});
