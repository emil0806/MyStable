import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
} from "react-native";
import { Text, View } from "@/components/Themed";
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  doc,
  getDoc,
  Timestamp,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "@/firebaseConfig";

export default function ModalScreen() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [stableId, setStableId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserStable();
    fetchAnnouncements();
  }, [stableId]);

  const fetchUserStable = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const userStableId = userData.stableId;
        setStableId(userStableId);

        const stableDocRef = doc(db, "stables", userStableId);
        const stableSnapshot = await getDoc(stableDocRef);
        if (stableSnapshot.exists()) {
          const stableData = stableSnapshot.data();
          setIsAdmin(stableData.admin === user.uid);
        }
      }
    }
  };

  const fetchAnnouncements = async () => {
    deleteOldAnnouncements();
    if (stableId) {
      const announcementsQuery = query(
        collection(db, "announcements"),
        where("stableId", "==", stableId),
        orderBy("date", "desc")
      );
      const querySnapshot = await getDocs(announcementsQuery);
      const fetchedAnnouncements = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,
        };
      });
      setAnnouncements(fetchedAnnouncements);
    }
  };

  const handleAddAnnouncement = async () => {
    if (newAnnouncement.trim() === "") {
      Alert.alert("Fejl", "Indtast venligst en meddelelse.");
      return;
    }

    Keyboard.dismiss();

    try {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(
        2,
        "0"
      )}-${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}-${today.getFullYear()}`;

      await addDoc(collection(db, "announcements"), {
        text: newAnnouncement,
        stableId: stableId,
        date: formattedDate,
        createdAt: Timestamp.fromDate(today),
      });

      setNewAnnouncement("");
      fetchAnnouncements();
    } catch (error) {
      console.error("Fejl ved tilføjelse af meddelelse: ", error);
      Alert.alert("Fejl", "Kunne ikke tilføje meddelelse. Prøv igen.");
    }
  };

  const deleteOldAnnouncements = async () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oldAnnouncementsQuery = query(
      collection(db, "announcements"),
      where("createdAt", "<", Timestamp.fromDate(oneWeekAgo))
    );

    const querySnapshot = await getDocs(oldAnnouncementsQuery);
    const batch = writeBatch(db);

    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Meddelelser</Text>
        <View style={styles.separator} />
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.announcementItem}>
              <Text style={styles.announcementText}>{item.text}</Text>
              <Text style={styles.announcementMeta}>— {item.date}</Text>
            </View>
          )}
        />

        {/* Admin-only input for posting new announcements */}
        {isAdmin && (
          <View style={styles.adminContainer}>
            <TextInput
              style={styles.input}
              placeholder="Tilføj ny meddelelse"
              value={newAnnouncement}
              onChangeText={setNewAnnouncement}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAnnouncement}
            >
              <Text style={styles.addButtonText}>Tilføj</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fcf7f2",
    paddingBottom: 30,
  },
  innerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: "#fcf7f2",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
  announcementItem: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    width: "100%",
  },
  announcementText: {
    fontSize: 16,
    color: "#000",
  },
  announcementMeta: {
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  adminContainer: {
    marginTop: 20,
    width: "100%",
    backgroundColor: "#fcf7f2",
  },
  input: {
    borderColor: "#000",
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  addButton: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    alignItems: "center",
  },
  addButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
