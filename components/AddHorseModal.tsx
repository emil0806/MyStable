import { auth, db } from "../firebaseConfig";
import { addDoc, doc, setDoc, collection } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

const AddHorseModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  horseData?: any;
}> = ({ visible, onClose, onSubmit, horseData }) => {
  const [name, setName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [color, setColor] = useState("");
  const [feedings, setFeedings] = useState([{ food: "", quantity: "" }]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (horseData) {
      console.log("Horse data received in modal:", horseData);
      setName(horseData.name || "");
      setBreed(horseData.breed || "");
      setAge(horseData.age ? String(horseData.age) : "");
      setColor(horseData.color || "");
      setFeedings(horseData.feedings || [{ food: "", quantity: "" }]);
    } else {
      setName("");
      setBreed("");
      setAge("");
      setColor("");
      setFeedings([{ food: "", quantity: "" }]);
    }
  }, [horseData]);

  const handleSaveHorse = async () => {
    console.log("Save button clicked");

    if (!auth.currentUser?.uid) {
      console.log("No user is authenticated");
      return;
    }


    if (!name || !breed || !age || !color) {
      setError("All fields are required");
      console.log("Validation failed");
      return;
    }

    try {
      const horseDetails = {
        name,
        breed,
        age: parseInt(age),
        color,
        ownerId: auth.currentUser?.uid,
        feedings,
      };

      if (horseData) {
        const horseRef = doc(db, "horses", horseData.id);
        await setDoc(horseRef, horseDetails);
        console.log("Horse updated successfully");
      } else {
        const horsesCollectionRef = collection(db, "horses");
        await addDoc(horsesCollectionRef, horseDetails);
        console.log("New horse added successfully");
      }

      onSubmit();
      onClose();
    } catch (e) {
      setError("Error saving horse data: " + e);
      console.error("Error in Firestore operation:", e);
    }
  };

  // Function to add a new feeding row
  const handleAddFeedingRow = () => {
    setFeedings([...feedings, { food: "", quantity: "" }]);
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

          {/* Horse details fields */}
          <TextInput
            style={styles.input}
            placeholder="Hestens navn"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Race"
            value={breed}
            onChangeText={setBreed}
          />
          <TextInput
            style={styles.input}
            placeholder="Alder"
            value={age}
            onChangeText={(text) => {
              console.log("Age input changed:", text); // Log age input changes
              setAge(text);
            }}
            keyboardType="numeric" // Allows only numeric input
          />
          <TextInput
            style={styles.input}
            placeholder="Farve"
            value={color}
            onChangeText={setColor}
          />

          <Text style={styles.feedTitle}>Hvad spiser din hest dagligt?</Text>
          {feedings.map((feeding, index) => (
            <View key={index} style={styles.feedingRow}>
              <TextInput
                style={styles.feedInput}
                placeholder="Foder"
                value={feeding.food}
                onChangeText={(value) =>
                  handleFeedingChange(index, "food", value)
                }
              />
              <TextInput
                style={styles.feedInput}
                placeholder="Vægt (fx 2 kg)"
                value={feeding.quantity}
                onChangeText={(value) =>
                  handleFeedingChange(index, "quantity", value)
                }
              />
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddFeedingRow}
          >
            <Text style={styles.addButtonText}>
              + Tilføj mulighed
            </Text>
          </TouchableOpacity>

          {/* Submit and Cancel buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Annuller</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSaveHorse}>
              <Text style={styles.buttonText}>Gem</Text>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Transparent background
  },
  modalContent: {
    width: "90%",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  feedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  feedInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: "48%", // Makes sure both fields fit in the same row
  },
  addButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  addButtonText: {
    color: "#007bff",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  feedTitle: {
    fontSize: 18,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  feedingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
});
