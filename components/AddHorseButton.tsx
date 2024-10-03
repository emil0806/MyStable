import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Component for the Add Horse Button
const AddHorseButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>+ Add horse</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FCF7F2', // Light background color as seen in the image
    borderRadius: 10, // Rounded corners
    paddingVertical: 15, // Vertical padding
    alignItems: 'center',
    justifyContent: 'center',
    width: '85%', // Same width as HorseCard
    alignSelf: 'center', // Center the button in its container
    shadowColor: '#000', // Optional: Add a subtle shadow for depth
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonText: {
    color: '#000', // Black text color
    fontSize: 16, // Font size similar to the image
    fontFamily: 'Inter-Regular', // Make sure this font is loaded in your app
  },
});

export default AddHorseButton;
