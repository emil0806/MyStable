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
  const [stableId, setStableId] = useState<string | null>(null); // Holder staldens ID
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    // Hent stald ID baseret på den nuværende bruger
    const fetchUserStableId = async () => {
      try {
        const db = getFirestore();
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert("Fejl", "Brugeren er ikke logget ind.");
          return;
        }

        // Søg i stables, hvor admin matcher user.uid
        const stablesRef = collection(db, "stables");
        const q = query(stablesRef, where("admin", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          Alert.alert("Fejl", "Ingen stald fundet for denne bruger.");
          return;
        }

        // Hent stald ID (vi tager det første resultat, hvis flere findes)
        const stableDoc = querySnapshot.docs[0];
        setStableId(stableDoc.id);
      } catch (error) {
        console.error("Fejl ved hentning af stableId: ", error);
        Alert.alert("Fejl", "Der skete en fejl ved hentning af stableId.");
      }
    };

    fetchUserStableId();
  }, []);

  interface UserData {
    stableId?: String;
  }

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

      // Hent brugerens UID
      const memberDoc = querySnapshot.docs[0];
      const memberData = memberDoc.data() as UserData;
      const memberId = memberDoc.id;

      if(memberData.stableId) {
        Alert.alert("Fejl, denne bruger er allerede medlem af en anden stald.")
        return;
      }
      await addInvitation(memberId, stableId);

      Alert.alert("Succes", "Invitation sendt!");
      router.push("/(tabs)/"); // Navigerer tilbage til oversigtssiden
    } catch (error) {
      console.error("Fejl ved tilføjelse af medlem: ", error);
      Alert.alert("Fejl", "Der skete en fejl under tilføjelsen af medlemmet.");
    }
  };

  const addInvitation = async (invitedUserId: String, stableId: String) {

    try{
      const db = getFirestore();
      await addDoc(collection(db, "invitations"), {
        invitedUserId,
        stableId,
        status: "pending",
        Timestamp: new Date(),
      });
      console.log("Invitation sendt!");
    } catch(error) {
      console.error("Fejl med at sende invitation! ", error)
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
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={addMember}
      >
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
    backgroundColor: "#6e8e8a",
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
  },
  buttonText: {
    color: "#000000",
    textAlign: "center",
  },
});
