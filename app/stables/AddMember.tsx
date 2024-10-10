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
      const memberData = querySnapshot.docs[0].data();
      const memberId = querySnapshot.docs[0].id;

      // Opdater stalden med brugerens UID som medlem
      const stableRef = doc(db, "stables", stableId);
      const stableSnapshot = await getDoc(stableRef);
      const currentNumOfMembers = stableSnapshot.data()?.numOfMembers || 0;

      await updateDoc(stableRef, {
        members: memberId, // Tilføj memberId til members-feltet
        numOfMembers: currentNumOfMembers + 1,
      });

      Alert.alert("Succes", "Medlem tilføjet til stalden!");
      router.push("/(tabs)/"); // Navigerer tilbage til oversigtssiden
    } catch (error) {
      console.error("Fejl ved tilføjelse af medlem: ", error);
      Alert.alert("Fejl", "Der skete en fejl under tilføjelsen af medlemmet.");
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
