import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useRouter } from "expo-router";

export default function CreateStableScreen() {
  const [stableName, setStableName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [members, setMembers] = useState("");
  const router = useRouter();

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
      await addDoc(collection(db, "stables"), {
        name: stableName,
        phone: phone,
        email: email,
        members: Number(0),
        admin: user.uid, // Brugeren bliver admin af stalden
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
    <View>
      <TextInput
        placeholder="Staldenavn"
        value={stableName}
        onChangeText={setStableName}
      />
      <TextInput placeholder="Telefon" value={phone} onChangeText={setPhone} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput
        placeholder="Antal medlemmer"
        value={members}
        onChangeText={setMembers}
      />
      <Button title="Opret stald" onPress={createStable} />
    </View>
  );
}
