import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Component for the Add Horse Button
const AddHorseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>+ Tilføj hest</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1, // Equal space for both buttons
    paddingVertical: 12, // Equal padding for top and bottom
    paddingHorizontal: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000", // Set border color to avoid the black background look
    backgroundColor: "#ffffff", // White background
    alignItems: "center", // Ensure text is centered horizontally
    justifyContent: "center", // Ensure text is centered vertically
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default AddHorseButton;
