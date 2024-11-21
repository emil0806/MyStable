import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Text, View } from "@/components/Themed";

// Stable information
type Stable = {
  name: string;
  phone: string;
  email: string;
};

// Displaying all stables and relevant info
export default function ViewAllStablesScreen() {
  const [stables, setStables] = useState<Stable[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all stables from Firebase
  useEffect(() => {
    const fetchStables = async () => {
      const db = getFirestore();
      const stablesRef = collection(db, "stables");
      const querySnapshot = await getDocs(stablesRef);

      const fetchedStables: Stable[] = [];
      querySnapshot.forEach((doc) => {
        const stableData = doc.data() as Stable;
        fetchedStables.push(stableData);
      });

      setStables(fetchedStables);
      setLoading(false);
    };

    fetchStables();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {stables.length > 0 ? (
        stables.map((stable, index) => (
          <View key={index} style={styles.stableCard}>
            <Text style={styles.stableTitle}>{stable.name || "No Name"}</Text>
            <Text style={styles.stableInfo}>
              Telefon: {stable.phone || "No Phone"}
            </Text>
            <Text style={styles.stableInfo}>
              Email: {stable.email || "No Email"}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noStableText}>Ingen stalde fundet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fcf7f2",
  },
  stableCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#000000",
  },
  stableTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  stableInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: "#000",
  },
  noStableText: {
    fontSize: 18,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: 20,
  },
});
