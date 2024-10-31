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
import { FontAwesome } from "@expo/vector-icons";

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
  const [feedings, setFeedings] = useState([
    { food: "", quantity: "", measurement: "" },
  ]);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(null);

  const measurementOptions = ["kg", "tbs", "g", "ml"];

  useEffect(() => {
    if (horseData) {
      setName(horseData.name || "");
      setBreed(horseData.breed || "");
      setAge(horseData.age ? String(horseData.age) : "");
      setColor(horseData.color || "");
      setFeedings(
        horseData.feedings || [{ food: "", quantity: "", measurement: "" }]
      );
    } else {
      setName("");
      setBreed("");
      setAge("");
      setColor("");
      setFeedings([{ food: "", quantity: "", measurement: "" }]);
    }
  }, [horseData]);

  const handleSaveHorse = async () => {
    if (!auth.currentUser?.uid) {
      console.log("No user is authenticated");
      return;
    }

    if (!name || !breed || !age || !color) {
      setError("All fields are required");
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
      } else {
        const horsesCollectionRef = collection(db, "horses");
        await addDoc(horsesCollectionRef, horseDetails);
      }

      onSubmit();
      onClose();
    } catch (e) {
      setError("Error saving horse data: " + e);
    }
  };

  const handleAddFeedingRow = () => {
    setFeedings([...feedings, { food: "", quantity: "", measurement: "" }]);
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
          <Text style={styles.informationTitle}>🐴 Beskriv din hest</Text>
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
            onChangeText={(text) => setAge(text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Farve"
            value={color}
            onChangeText={setColor}
          />

          <Text style={styles.feedTitle}>🥕Hvad spiser din hest dagligt?</Text>
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
                placeholder="Vægt (fx 2)"
                value={feeding.quantity}
                onChangeText={(value) =>
                  handleFeedingChange(index, "quantity", value)
                }
              />
              {/* Dropdown til measurement */}
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => {
                  setCurrentIndex(index);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.dropdownText}>
                  {feeding.measurement || "Vælg enhed"}
                </Text>
                <FontAwesome name="chevron-down" size={16} color="black" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddFeedingRow}
          >
            <Text style={styles.addButtonText}>+ Tilføj mere foder</Text>
          </TouchableOpacity>

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

      {/* Modal for Measurement Valgmuligheder */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            {measurementOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.option}
                onPress={() => {
                  handleFeedingChange(currentIndex, "measurement", option);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
};

export default AddHorseModal;

const styles = StyleSheet.create({
  modalContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 350, // Increase the width of the modal
    backgroundColor: "#FCF7F2",
    borderRadius: 10,
    padding: 15, // Add padding for better spacing
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: "100%",
  },
  feedTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold", // Gør teksten fed
    paddingTop: 15,
    paddingBottom: 5,
  },
  informationTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold", // Gør teksten fed
    paddingBottom: 5,
  },
  feedingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  feedInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: "30%",
    marginHorizontal: "2%", // Tilføjer plads mellem boksene
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    width: "30%",
    marginHorizontal: "1.5%", // Tilføjer plads mellem boksene
  },
  dropdownText: {
    fontSize: 14,
    color: "#333",
  },
  addButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  addButtonText: {
    color: "#000000",
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginHorizontal: 5, // Tilføjer mellemrum mellem knapperne
  },
  buttonText: {
    color: "#000000",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  option: {
    paddingVertical: 12, // Increase padding for better tap area
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: "100%", // Ensure full width for options
    alignItems: "center",
  },
  optionText: {
    fontSize: 16, // Larger font for readability
    color: "#333",
  },
});
