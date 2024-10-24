import { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
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
import React from "react";
import AddHorseModal from "@/components/AddHorseModal"; // Import the modal
import HorseCard from "@/components/HorseCard";

type Horse = {
  id: string; // Add an id field for horses
  name: string;
  age: number;
  breed: string;
  ownerId: string;
};

export default function ViewAllHorsesScreen() {
  const [stable, setStable] = useState<any | null>(null);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null); // State to track selected horse

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
          fetchedHorses.push({ ...horseData, id: doc.id }); // Include horse id
        });

        setHorses(fetchedHorses);
        setLoading(false);
      };

      fetchHorses();
    }, [])
  );

  const handleEditHorse = (horse: Horse) => {
    setSelectedHorse(horse); // Set the selected horse data
    setModalVisible(true); // Open the modal
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedHorse(null); // Clear selected horse after closing the modal
  };

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
        <View style={styles.horseContainer}>
          {horses.map((horse, index) => (
            <View key={index} style={styles.horseCard}>
              <Text style={styles.horseTitle}>{horse.name || "No Name"}</Text>
              <Text style={styles.horseInfo}>
                Alder: {horse.age || "Unknown"}
              </Text>
              <Text style={styles.horseInfo}>
                Race: {horse.breed || "Unknown"}
              </Text>

              {/* Display feedings if available */}
              {horse.feedings && horse.feedings.length > 0 ? (
                <View style={styles.horseInfo}>
                  {horse.feedings.map((feeding, feedIndex) => (
                    <View key={feedIndex} style={styles.feedRow}>
                      <Text style={styles.foodText}>
                        Foder: {feeding.food || "Ingen data"}
                      </Text>
                      <Text style={styles.quantityText}>
                        Mængde: {feeding.quantity} kg
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.noFeedingText}>
                  Ingen foder oplysninger
                </Text>
              )}

              {stable?.isAdmin && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleEditHorse(horse)} // Trigger modal with horse data
                  >
                    <Text style={styles.buttonText}>Opdater oplysninger</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noHorseText}>Der er ingen heste i stalden.</Text>
      )}

      {/* Modal for editing horse details */}
      <AddHorseModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onSubmit={() => {
          handleModalClose();
          // Fetch the updated horses here if necessary
        }}
        horseData={selectedHorse} // Pass the selected horse to the modal
      />
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
    color: "#000",
  },
  horseInfo: {
    fontSize: 16,
    marginBottom: 5,
    color: "#000",
    backgroundColor: "#fcf7f2", // Ensure this is the background color
  },
  feedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    backgroundColor: "#fcf7f2", // Add background color to the feed rows as well
  },
  foodText: {
    fontSize: 16,
    flex: 1,
    color: "#000",
  },
  quantityText: {
    fontSize: 16,
    color: "#000",
  },
  buttonContainer: {
    alignItems: "center",
    backgroundColor: "#fcf7f2",
  },
  button: {
    marginTop: 10,
    width: 200,
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#fcf7f2",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },
  noFeedingText: {
    fontSize: 16,
    marginTop: 5,
    color: "#000",
  },
  horseContainer: {
    backgroundColor: "#fcf7f2",
  },
  noHorseText: {
    fontSize: 16,
    marginTop: 20,
    color: "#000",
  },
});
