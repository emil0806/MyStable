// app/(tabs)/index.tsx
import { useEffect, useState } from "react";
import { StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Text, View } from "@/components/Themed";
import CreateStableLink from "../stables/CreateStableLink"; // Importer CreateStableLink
import { useTheme } from "@react-navigation/native";

export default function TabOneScreen() {
  const [stable, setStable] = useState<any | null>(null); // Holder staldens data
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    const fetchUserStable = async () => {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        // Tjekker for stalde, hvor admin matcher brugerens UID
        const stablesRef = collection(db, "stables");
        const q = query(stablesRef, where("admin", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const stableData = querySnapshot.docs[0].data(); // Tag første stald fundet
          setStable(stableData);
        } else {
          setStable(null); // Hvis brugeren ikke administrerer nogen stald
        }
      }
      setLoading(false); // Stop loading uanset udfaldet
    };

    fetchUserStable();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {stable ? (
        <View style={{ backgroundColor: "#6e8e8a" }}>
          <Text style={styles.title}>Din stald: {stable.name}</Text>
          <Text>Telefon: {stable.phone}</Text>
          <Text>Email: {stable.email}</Text>
          <Text>Antal medlemmer: {stable.members}</Text>

          {/* Tilføj medlem knap */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.buttonText}>Tilføj medlem</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <CreateStableLink /> // Vis link til at oprette stald hvis ingen stald er oprettet
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6e8e8a", // Match baggrundsfarven fra login-siden
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#6e8e8a",
  },
  buttonText: {
    color: "#000000",
    textAlign: "center",
  },
});
