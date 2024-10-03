import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';

const AddHorseModal: React.FC<{ visible: boolean; onClose: () => void; onSubmit: (horseDetails: any) => void }> = ({ visible, onClose, onSubmit }) => {
  const [horseName, setHorseName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('');

  // State for dynamically adding feeding options
  const [feedingOptions, setFeedingOptions] = useState([{ name: '', weight: '' }]);

  // Function to handle adding new feeding fields
  const addFeedingOption = () => {
    setFeedingOptions([...feedingOptions, { name: '', weight: '' }]); // Add a new empty field
  };

  // Function to update feeding options dynamically
  const updateFeedingOption = (index: number, field: string, value: string) => {
    const updatedFeedingOptions = [...feedingOptions];
    updatedFeedingOptions[index][field] = value;
    setFeedingOptions(updatedFeedingOptions);
  };

  const handleSubmit = () => {
    const horseDetails = { name: horseName, breed, dob: age, color, feeding: feedingOptions };
    onSubmit(horseDetails); // Pass horse details back to the parent component
    onClose(); // Close the modal after submitting
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <ScrollView contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Add Horse Details</Text>

          {/* Horse details fields */}
          <TextInput
            style={styles.input}
            placeholder="Horse Name"
            value={horseName}
            onChangeText={setHorseName}
          />
          <TextInput
            style={styles.input}
            placeholder="Breed"
            value={breed}
            onChangeText={setBreed}
          />
          <TextInput
            style={styles.input}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
          />
          <TextInput
            style={styles.input}
            placeholder="Color"
            value={color}
            onChangeText={setColor}
          />

          <Text style={styles.subTitle}>Feeding Options</Text>

          {/* Dynamic feeding inputs */}
          {feedingOptions.map((option, index) => (
            <View key={index} style={styles.feedContainer}>
              <TextInput
                style={styles.feedInput}
                placeholder="Food Name"
                value={option.name}
                onChangeText={(value) => updateFeedingOption(index, 'name', value)}
              />
              <TextInput
                style={styles.feedInput}
                placeholder="Weight (kg)"
                value={option.weight}
                onChangeText={(value) => updateFeedingOption(index, 'weight', value)}
              />
            </View>
          ))}

          {/* Button to add new feeding option */}
          <TouchableOpacity style={styles.addButton} onPress={addFeedingOption}>
            <Text style={styles.addButtonText}>+ Add another food</Text>
          </TouchableOpacity>

          {/* Submit and Cancel buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

export default AddHorseModal;

const styles = StyleSheet.create({
  modalContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  feedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  feedInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    width: '48%', // Makes sure both fields fit in the same row
  },
  addButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
