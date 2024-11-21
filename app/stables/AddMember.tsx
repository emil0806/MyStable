import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Alert,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
  arrayUnion,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";

export default function AddMember() {
  const [email, setEmail] = useState("");
  const [stableId, setStableId] = useState<string | null>(null);
  const [stableName, setStableName] = useState<string | null>(null);
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    // Fetch a users stable id
    const fetchUserStableId = async () => {
      try {
        const db = getFirestore();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert("Fejl", "Brugeren er ikke logget ind.");
          return;
        }

        const stablesRef = collection(db, "stables");
        const q = query(stablesRef, where("admin", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          Alert.alert("Fejl", "Ingen stald fundet for denne bruger.");
          return;
        }

        const stableDoc = querySnapshot.docs[0];
        setStableId(stableDoc.id);
      } catch (error) {
        console.error("Fejl ved hentning af stableId: ", error);
        Alert.alert("Fejl", "Der skete en fejl ved hentning af stableId.");
      }
    };

    fetchUserStableId();
  }, []);

  useEffect(() => {
    // Fetch stable name where user is in
    const fetchUserStableName = async () => {
      try {
        const db = getFirestore();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert("Fejl", "Brugeren er ikke logget ind.");
          return;
        }
        const stablesRef = collection(db, "stables");
        const q = query(stablesRef, where("admin", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const stableDoc = querySnapshot.docs[0];
          const stableData = stableDoc.data();
          const fetchedStableName = stableData?.name;
          setStableName(fetchedStableName);
        }
      } catch (error) {
        console.error("Fejl ved hentning af stableName: ", error);
        Alert.alert("Fejl", "Der skete en fejl ved hentning af stableNavn.");
      }
    };
    fetchUserStableName();
  }, [stableId]);

  interface UserData {
    stableId?: String;
  }

  // Adding member by sending invitation
  const addMember = async () => {
    if (!stableId) {
      Alert.alert("Fejl", "Stald ID kunne ikke findes.");
      return;
    }

    try {
      const db = getFirestore();
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Fejl", "Ingen bruger fundet med denne e-mail.");
        return;
      }

      const memberDoc = querySnapshot.docs[0];
      const memberData = memberDoc.data() as UserData;
      const memberId = memberDoc.id;

      if (memberData.stableId !== "") {
        Alert.alert("Fejl, denne bruger er allerede medlem af en anden stald.");
        return;
      }
      await addInvitation(memberId, stableId);

      Alert.alert("Succes", "Invitation sendt!");
      router.push("/(tabs)");
    } catch (error) {
      console.error("Fejl ved tilføjelse af medlem: ", error);
      Alert.alert("Fejl", "Der skete en fejl under tilføjelsen af medlemmet.");
    }
  };

  // Adding invitation to Firebase
  const addInvitation = async (invitedUserId: String, stableId: String) => {
    try {
      const db = getFirestore();
      await addDoc(collection(db, "invitations"), {
        invitedUserId,
        stableId,
        status: "pending",
        Timestamp: new Date(),
        stableName,
      });
    } catch (error) {
      console.error("Fejl med at sende invitation! ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tilføj et medlem</Text>

      <TextInput
        style={styles.input}
        placeholder="Indtast e-mail på medlem"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={[styles.button]} onPress={addMember}>
        <Text style={styles.buttonText}>Tilføj medlem</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fcf7f2",
  },
  title: {
    fontSize: 36,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    width: "100%",
    borderColor: "#000000",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#FFFFFF",
  },
  button: {
    marginTop: 30,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    color: "#000000",
    textAlign: "center",
  },
});
