import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity, Text } from "react-native";
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
  const [currentHorseData, setCurrentHorseData] = useState<any>(null); // Track horse being edited

  //fetch user profile
  const fetchUserProfile = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Fetch the user profile document
      const userDoc = doc(db, "users", userId);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        setUserProfile({
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          horsesCount: 0, // Set initial placeholder, will update in fetchUserHorses
        });
      } else {
        console.log("No such document");
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
      setError("Failed to fetch user profile");
    }
  };

  //fetch user horses
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
        horsesCount: userHorses.length, // Update with the actual count
      }));
    } catch (e) {
      setError("Failed to fetch horses");
    }
  };

  const handleEditHorse = (horseData: any) => {
    setCurrentHorseData(horseData);
    setModalVisible(true);
  };

  const handleAddHorse = () => {
    setCurrentHorseData(null); // Clear form for new horse
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleSubmit = () => {
    fetchUserHorses();
    setModalVisible(false);
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserHorses();
  }, []);

  return (
    <View style={styles.container}>

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
        <FlatList
          style={styles.flat}
          data={horses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HorseCard
              id={item.id}
              name={item.name}
              breed={item.breed}
              age={item.age}
              color={item.color}
              feedings={item.feedings}
              onEdit={handleEditHorse} // Pass editing function
            />
          )}
        />
      </View>

      <AddHorseModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        horseData={currentHorseData} // Pass data for pre-filling in edit mode
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    backgroundColor: "#fcf7f2",
    paddingBottom: 30,
  },
  horseCard: {
    marginBottom: 20,
  },
  flat: {
    width: "100%",
    marginBottom: 150,
  },
  listContainer: {
    paddingHorizontal: 10,
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
    flexDirection: "row", // Align the buttons horizontally
    justifyContent: "center", // Center the buttons horizontally
    alignItems: "center", // Align the buttons vertically
    marginTop: 10,
    paddingHorizontal: 10, // Add padding to ensure the buttons don't stretch fully
    backgroundColor: "#fcf7f2",
  },
});
