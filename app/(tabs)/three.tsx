import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList } from "react-native";
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
      setUserProfile((prevProfile) => ({
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

      <FlatList
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

      <AddHorseButton onPress={handleAddHorse} />

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
    justifyContent: "flex-start",
    paddingTop: 10,
    backgroundColor: "#fcf7f2",
    paddingBottom: 30,
  },
  horseCard: {
    marginBottom: 20,
  },
  flat: {
    width: "100%",
  },
});
