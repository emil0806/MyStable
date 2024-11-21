import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text, ScrollView } from "react-native";
import HorseCard from "@/components/HorseCard";
import AddHorseButton from "@/components/AddHorseButton";
import ProfileCard from "@/components/ProfileCard";
import AddHorseModal from "@/components/AddHorseModal";
import { auth, db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

export default function Profile() {
  const [horses, setHorses] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentHorseData, setCurrentHorseData] = useState<any>(null);

  // Fetch user profile and their information
  const fetchUserProfile = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUserProfile({
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          horsesCount: 0,
        });
      } else {
        console.log("No such document");
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
      setError("Failed to fetch user profile");
    }
  };

  // Fetch all horses owned by the user
  const fetchUserHorses = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const horsesQuery = query(
        collection(db, "horses"),
        where("ownerId", "==", userId)
      );
      const querySnapshot = await getDocs(horsesQuery);

      const userHorses: any[] = [];
      querySnapshot.forEach((doc) => {
        userHorses.push({ id: doc.id, ...doc.data() });
      });

      setHorses(userHorses);
      setUserProfile((prevProfile: any) => ({
        ...prevProfile,
        horsesCount: userHorses.length,
      }));
    } catch (e) {
      setError("Failed to fetch horses");
    }
  };

  // Setting horse data when wanting to edit and displaying modal
  const handleEditHorse = (horseData: any) => {
    setCurrentHorseData(horseData);
    setModalVisible(true);
  };

  // Showing modal and being ready for horse data
  const handleAddHorse = () => {
    setCurrentHorseData(null);
    setModalVisible(true);
  };

  // Closing modal
  const handleModalClose = () => {
    setModalVisible(false);
  };

  // Fetching horses after submitting a new horse
  const handleSubmit = () => {
    fetchUserHorses();
    setModalVisible(false);
  };

  // Fetching user info and horses
  useEffect(() => {
    fetchUserProfile();
    fetchUserHorses();
  }, []);

  return (
    <ScrollView style={styles.container}>

      {/* Display ProfileCard only if userProfile data is available */}
      {userProfile && (
        <ProfileCard
          email={userProfile.email}
          name={userProfile.name}
          phone={userProfile.phone}
          horsesCount={userProfile.horsesCount}
        />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button]} onPress={handleAddHorse}>
          <Text style={styles.buttonText}>+ Tilføj hest</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        {/* Display horses if any otherwise show text of no horses */}
        {horses.length > 0 ? (
          <View style={styles.horseContainer}>
            {horses.map((horse) => (
              // Mapping over all horses and displaying horseCard for each
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
          // If no horses already
          <Text style={styles.noHorseText}>Der er ingen heste i stalden.</Text>
        )}
      </View>
      {/* Modal for adding a horse */}
      <AddHorseModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        horseData={currentHorseData}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: "#fcf7f2",
    paddingBottom: 80,
  },
  horseCard: {
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 5,
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fcf7f2",
  },
  noHorseText: {
    fontSize: 16,
    marginTop: 20,
    color: "#000",
  },
  horseContainer: {
    backgroundColor: "#fcf7f2",
  },
});
