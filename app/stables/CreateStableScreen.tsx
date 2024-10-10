import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  Alert,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { getFirestore, collection, addDoc, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";


export default function CreateStableScreen() {
  const [stableName, setStableName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [numOfMembers, setNumOfMembers] = useState("");
  const [members, setMembers] = useState([]);
  const router = useRouter();
  const { colors } = useTheme();

  const createStable = async () => {
    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Fejl", "Brugeren er ikke logget ind.");
        return;
      }

      // Tilføj stald til databasen
      const stableRef = await addDoc(collection(db, "stables"), {
        name: stableName,
        phone: phone,
        email: email,
        numOfMembers: 0, // Start med 0 medlemmer, da de tilføjes senere
        admin: user.uid, // Brugeren bliver admin af stalden
        members: arrayUnion(user.uid),
      });

      const stableId = stableRef.id; // Get the ID of the new stable

      // Step 2: Update the user's document with the stableId
      const userRef = doc(db, "users", user.uid); // Assuming user data is stored in a 'users' collection
      await updateDoc(userRef, {
        stableId: stableId, // Set the stableId to the user's document
      });

      Alert.alert("Succes", "Stald oprettet succesfuldt!");

      // Naviger til skærmen der viser stalden
      router.push("/(tabs)/"); // Navigerer tilbage til oversigtssiden
    } catch (error) {
      console.error("Fejl ved oprettelse af stald: ", error);
      Alert.alert("Fejl", "Der skete en fejl under oprettelsen af stalden.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opret din stald</Text>

      <TextInput
        style={styles.input}
        placeholder="Staldnavn"
        value={stableName}
        onChangeText={setStableName}
      />
      <TextInput
        style={styles.input}
        placeholder="Telefon"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={createStable}
      >
        <Text style={styles.buttonText}>Opret stald</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#6e8e8a", // Match baggrundsfarven fra login-siden
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
    backgroundColor: "#FFFFFF", // Baggrundsfarve for inputfelter
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
