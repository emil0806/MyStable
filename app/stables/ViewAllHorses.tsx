import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { Text, View } from "@/components/Themed";
import { auth } from "@/firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

type Horse = {
  name: string;
  age: number;
  breed: string;
  ownerId: string;
};

export default function ViewAllHorsesScreen() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchHorses = async () => {
        const db = getFirestore();
        const user = auth.currentUser;

        if (!user) {
          console.log("No user logged in");
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.log("User not found");
          setLoading(false);
          return;
        }

        const userData = userSnap.data();
        const stableId = userData?.stableId;

        if (!stableId) {
          console.log("No stableId found for this user");
          setLoading(false);
          return;
        }

        const stableRef = doc(db, "stables", stableId);
        const stableSnap = await getDoc(stableRef);

        if (!stableSnap.exists()) {
          console.log("Stable not found");
          setLoading(false);
          return;
        }

        const stableData = stableSnap.data();
        const members = stableData?.members || [];

        if (members.length === 0) {
          console.log("No members in the stable");
          setLoading(false);
          return;
        }

        const horsesQuery = query(
          collection(db, "horses"),
          where("ownerId", "in", members)
        );
        const querySnapshot = await getDocs(horsesQuery);

        const fetchedHorses: Horse[] = [];
        querySnapshot.forEach((doc) => {
          const horseData = doc.data() as Horse;
          fetchedHorses.push(horseData);
        });

        setHorses(fetchedHorses);
        setLoading(false);
      };

      fetchHorses();
    }, [])
  );

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
            <Text style={styles.horseInfo}>
              Alder: {horse.age || "Unknown"}
            </Text>
            <Text style={styles.horseInfo}>
              Race: {horse.breed || "Unknown"}
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.noHorseText}>Der er ingen heste i stalden.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 30,
    paddingRight: 30,
    backgroundColor: "#fcf7f2",
  },
  horseCard: {
    backgroundColor: "#fcf7f2",
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
    shadowRadius: 5,
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
    fontSize: 16,
    marginBottom: 5,
    color: "#000",
    marginTop: 20,
  },
});
