import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import HorseCard from '@/components/HorseCard';
import AddHorseButton from '@/components/AddHorseButton';
import ProfileCard from '@/components/ProfileCard';
import AddHorseModal from '@/components/AddHorseModal';
import { auth, db } from '@/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function Profile() {
  const [horses, setHorses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility state

  const fetchUserHorses = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const horsesQuery = query(collection(db, 'horses'), where('ownerId', '==', userId));
      const querySnapshot = await getDocs(horsesQuery);

      const userHorses: any[] = [];
      querySnapshot.forEach((doc) => {
        userHorses.push({ id: doc.id, ...doc.data() });
      });

      setHorses(userHorses);
    } catch (e) {
      setError('Failed to fetch horses');
    }
  };

  const handleAddHorse = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };
  const handleSubmit = () => {
    fetchUserHorses();
    setModalVisible(false);

  }

  useEffect(() => {
    fetchUserHorses();
  }, []);

  return (
    <View style={styles.container}>
      {/* Display ProfileCard */}
      <ProfileCard />

      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HorseCard
            name={item.name}
            breed={item.breed}
            dob={item.dob}
            color={item.color}
            image={item.image}
          />
        )}
      />

      <AddHorseButton onPress={handleAddHorse} />

      <AddHorseModal visible={isModalVisible} onClose={handleModalClose} onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center', // Keep the components horizontally centered
    justifyContent: 'flex-start', // Align components to the top
    paddingTop: 30, // Add space between the top of the screen and the first component
    backgroundColor: '#6E8E8A', // Update background color as needed
  },
  horseCard: {
    marginBottom: 20, // Space between HorseCard and AddHorseButton
  },
});
