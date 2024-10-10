import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Text, View } from "@/components/Themed";

type Horse = {
    name: string;
    age: number;
    breed: string;
    stableId: string;
}

export default function ViewAllHorsesScreen() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHorses = async () => {
      const db = getFirestore();
      const horsesRef = collection(db, "horses");
      const querySnapshot = await getDocs(horsesRef);

      const fetchedHorses: Horse[] = [];
      querySnapshot.forEach((doc) => {
        const horseData = doc.data() as Horse;
        fetchedHorses.push(horseData);
      });

      setHorses(fetchedHorses);
      setLoading(false);
    };

    fetchHorses();
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
      {horses.length > 0 ? (
        horses.map((horse, index) => (
          <View key={index} style={styles.horseCard}>
            <Text style={styles.horseTitle}>{horse.name || "No Name"}</Text>
            <Text style={styles.horseInfo}>Alder: {horse.age || "Unknown"}</Text>
            <Text style={styles.horseInfo}>Race: {horse.breed || "Unknown"}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noHorseText}>No horses found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#6e8e8a",
    },
    horseCard: {
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
    horseTitle: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 10,
      color: "#000", // Sikre tekstfarven er synlig
    },
    horseInfo: {
      fontSize: 16,
      marginBottom: 5,
      color: "#000", // Sikre tekstfarven er synlig
    },
    noHorseText: {
      fontSize: 18,
      color: "#FFFFFF",
      textAlign: "center",
      marginTop: 20,
    },
  });
  


