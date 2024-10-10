import { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Text, View } from "@/components/Themed";
import CreateStableLink from "../stables/CreateStableLink";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";

export default function TabOneScreen() {
  const [stable, setStable] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const fetchUserStable = async () => {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const stablesRef = collection(db, "stables");
        const q = query(stablesRef, where("admin", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const stableData = querySnapshot.docs[0].data();
          setStable(stableData);
        } else {
          setStable(null);
        }
      }
      setLoading(false);
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
    <ScrollView style={styles.container}>
      {stable ? (
        <View style={styles.stableCard}>
          <Text style={styles.stableTitle}>{stable.name}</Text>
          <Text style={styles.stableInfo}>E-mail: {stable.email}</Text>
          <Text style={styles.stableInfo}>tlf. nummer: {stable.phone}</Text>
          <TouchableOpacity
            style={styles.createStableButton}
            onPress={() => router.push("../stables/AddMember")}
          >
            <Text style={styles.buttonText}>Tilføj medlem</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.createStableButton}
            onPress={() => router.push("../stables/CreateStableScreen")}
          >
            <Text style={styles.buttonText}>Opret stald</Text>
          </TouchableOpacity>

          {/* Knap til at se alle stalde */}
        </View>
      )}
      <TouchableOpacity
        style={styles.createStableButton}
        onPress={() => router.push("../stables/ViewAllStables")}
      >
        <Text style={styles.buttonText}>Se alle stalde</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#6e8e8a",
  },
  title: {
    fontSize: 36,
    marginBottom: 20,
    textAlign: "center",
  },
  createStableButton: {
    marginTop: 30,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#fcf7f2",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  stableCard: {
    backgroundColor: "#FCF7F2",
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#6e8e8a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#6e8e8a",
  },
  stableTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000", // Sikre tekstfarven er synlig
  },
  stableInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: "#000", // Sikre tekstfarven er synlig
  },
  noStableText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 20,
  },
});
