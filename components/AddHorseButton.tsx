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
    marginTop: 10,
    width: 200,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#fcf7f2",
    textAlign: "center"
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    textAlign: "center"
  },
});

export default AddHorseButton;
