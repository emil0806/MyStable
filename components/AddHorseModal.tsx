import { auth, db } from '../firebaseConfig';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';

const AddHorseModal: React.FC<{ visible: boolean; onClose: () => void; onSubmit: () => void }> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [color, setColor] = useState('');
  const [feedings, setFeedings] = useState([{ food: '', quantity: '' }]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddHorse = async () => {

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    // Validate inputs
    if (!name || !breed || !age || !color) {
      setError('All fields are required');
      return;
    }

    try {
      // Add a new document with a generated ID
      await addDoc(collection(db, 'horses'), {
        name: name,
        breed: breed,
        age: parseInt(age),  // Convert age to number
        color: color,
        ownerId: auth.currentUser?.uid,
        feedings: feedings,
      });

      // Reset fields
      setName('');
      setBreed('');
      setAge('');
      setColor('');
      setFeedings([{ food: '', quantity: '' }]);
      setError('');
      setSuccessMessage('Horse data added successfully!');
    } catch (e) {
      setError('Error adding horse data: ' + e);
    }
    onSubmit();
    onClose();
  };

  const handleAddFeedingRow = () => {
    setFeedings([...feedings, { food: '', quantity: '' }]);
  };

  const handleFeedingChange = (index: number, key: string, value: string) => {
    const updatedFeedings = feedings.map((feeding, i) =>
      i === index ? { ...feeding, [key]: value } : feeding
    );
    setFeedings(updatedFeedings);
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
            value={name}
            onChangeText={setName}
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

          <Text style={styles.feedTitle}>Feeding Options</Text>
          {feedings.map((feeding, index) => (
            <View key={index} style={styles.feedingRow}>
              <TextInput
                style={styles.feedInput}
                placeholder="Food Type"
                value={feeding.food}
                onChangeText={(value) => handleFeedingChange(index, 'food', value)}
              />
              <TextInput
                style={styles.feedInput}
                placeholder="Quantity (e.g., 2 kg)"
                value={feeding.quantity}
                onChangeText={(value) => handleFeedingChange(index, 'quantity', value)}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={handleAddFeedingRow}>
            <Text style={styles.addButtonText}>+ Add Another Feeding Option</Text>
          </TouchableOpacity>

          {/* Submit and Cancel buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleAddHorse}>
              <Text style={styles.buttonText}>Submit</Text>
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
  feedTitle: {
    fontSize: 18,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  feedingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  }
});
