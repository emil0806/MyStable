import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import HorseCard from '@/components/HorseCard';  // Import HorseCard
import AddHorseButton from '@/components/AddHorseButton'; // Import AddHorseButton
import ProfileCard from '@/components/ProfileCard'; // Import ProfileCard
import AddHorseModal from '@/components/AddHorseModal'; // Import AddHorseModal

export default function TabThreeScreen() {
  const [hasHorse, setHasHorse] = useState(false); // To track if a horse is added
  const [isModalVisible, setModalVisible] = useState(false); // Modal visibility state

  // State to store horse details entered by the user
  const [horseDetails, setHorseDetails] = useState({
    name: '',
    breed: '',
    dob: '',
    color: '',
  });

  // Function to handle showing the modal
  const handleAddHorse = () => {
    setModalVisible(true); // Open the modal when the button is pressed
  };

  // Function to handle closing the modal
  const handleModalClose = () => {
    setModalVisible(false); // Close the modal
  };

  // Function to handle form submission and save user input
  const handleHorseSubmit = (details) => {
    setHorseDetails(details); // Update state with the user's input
    setHasHorse(true); // Indicate that a horse has been added
    setModalVisible(false); // Close the modal after submitting
  };

  return (
    <View style={styles.container}>
      {/* Display ProfileCard */}
      <ProfileCard />

      {/* Conditionally render HorseCard if a horse has been added */}
      {hasHorse && (
        <HorseCard
          name={horseDetails.name} // Use dynamic user input
          breed={horseDetails.breed} // Use dynamic user input
          dob={horseDetails.dob} // Use dynamic user input
          color={horseDetails.color} // Use dynamic user input
          image="" // You can add image handling later
          style={styles.horseCard} // Add style for spacing
        />
      )}

      {/* Display the Add Horse Button */}
      <AddHorseButton onPress={handleAddHorse} />

      {/* Modal for adding horse details */}
      <AddHorseModal visible={isModalVisible} onClose={handleModalClose} onSubmit={handleHorseSubmit} />
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
