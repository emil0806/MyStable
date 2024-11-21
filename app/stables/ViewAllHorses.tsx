import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
} from "react-native";
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
import AddHorseModal from "@/components/AddHorseModal";
import HorseCard from "@/components/HorseCard";

// Horse information
type Horse = {
  id: string;
  name: string;
  age: string;
  breed: string;
  color: string;
  feedings: Feeding[];
  ownerId: string;
};
// Feeding information
type Feeding = {
  food: string;
  quantity: string;
  measurement: string;
};

export default function ViewAllHorsesScreen() {
  const [stable, setStable] = useState<any | null>(null);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null);

  // To make sure horses are fetched when screen is in view
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
        const admin = stableData?.admin === user.uid;
        setStable({ ...stableData, isAdmin: admin });

        const horsesQuery = query(
          collection(db, "horses"),
          where("ownerId", "in", members)
        );
        const querySnapshot = await getDocs(horsesQuery);

        const fetchedHorses: Horse[] = [];
        querySnapshot.forEach((doc) => {
          const horseData = doc.data() as Horse;
          fetchedHorses.push({ ...horseData, id: doc.id });
        });

        setHorses(fetchedHorses);
        setLoading(false);
      };

      fetchHorses();
    }, [])
  );

  // Showing modal for editing horse
  const handleEditHorse = (horse: Horse) => {
    setSelectedHorse(horse);
    setModalVisible(true);
  };

  // Closing modal
  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedHorse(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {horses.length > 0 ? (
        <View style={styles.horseContainer}>
          {horses.map((horse) => (
            <HorseCard
              key={horse.id}
              id={horse.id}
              name={horse.name}
              breed={horse.breed}
              age={horse.age}
              color={horse.color}
              feedings={horse.feedings}
              onEdit={() => handleEditHorse(horse)}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.noHorseText}>Der er ingen heste i stalden.</Text>
      )}

      <AddHorseModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onSubmit={handleModalClose}
        horseData={selectedHorse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 30,
    paddingRight: 30,
    backgroundColor: "#fcf7f2",
  },

  horseContainer: {
    backgroundColor: "#fcf7f2",
  },

  horseCard: {
    backgroundColor: "#FCF7F2",
    borderWidth: 0.5,
    borderColor: "lightgrey",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
    shadowRadius: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    backgroundColor: "#fcf7f2",
  },
  headerTextBox: {
    flexDirection: "column",
    backgroundColor: "#fcf7f2",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    backgroundColor: "#fcf7f2",
    color: "#000000",
  },
  detailText: {
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#fcf7f2",
  },
  imageText: {
    color: "#777",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#B0ADA9",
    marginVertical: 10,
  },
  buttonWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fcf7f2",
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },
  noFeedingText: {
    fontSize: 16,
    color: "#000",
  },
  noHorseText: {
    fontSize: 16,
    marginTop: 20,
    color: "#000",
  },
});
