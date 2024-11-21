import { getAuth, signOut } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { auth, db } from "../firebaseConfig"; // Import your Firestore configuration

// Defining interface for ProfileCardProps
interface ProfileCardProps {
  email: string;
  name: string;
  phone: string;
  horsesCount: number;
}

// Defining ProfileCard
const ProfileCard: React.FC<ProfileCardProps> = ({
  email,
  name,
  phone,
  horsesCount,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedEmail, setEditedEmail] = useState(email);
  const [editedPhone, setEditedPhone] = useState(phone);

  // Saves info about user and store in Firebase
  const handleSave = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Reference to the user's document in Firestore
      const userDocRef = doc(db, "users", userId);

      // Update the user's profile information in Firestore
      await updateDoc(userDocRef, {
        name: editedName,
        email: editedEmail,
        phone: editedPhone,
      });

      Alert.alert("Gemt", "Profiloplysningerne er opdateret.");
      setIsEditing(false);
    } catch (error) {
      Alert.alert("Fejl", "Der opstod en fejl under opdateringen.");
      console.error("Error updating profile:", error);
    }
  };

  return (
    <View style={styles.card}>
      <View>
        {isEditing ? (
          <TextInput
            style={[styles.text, styles.input]}
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Navn"
          />
        ) : (
          <Text style={styles.title}>{editedName}</Text>
        )}

        {isEditing ? (
          <TextInput
            style={[styles.text, styles.input]}
            value={editedEmail}
            onChangeText={setEditedEmail}
            placeholder="Email"
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.text}>Email: {editedEmail}</Text>
        )}

        {isEditing ? (
          <TextInput
            style={[styles.text, styles.input]}
            value={editedPhone}
            onChangeText={setEditedPhone}
            placeholder="Telefon"
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.text}>Telefon: {editedPhone}</Text>
        )}

        <Text style={styles.text}>Antal heste: {horsesCount}</Text>

        {/* Edit and Save Buttons */}
        <View style={styles.buttonContainer}>
          {isEditing ? (
            <TouchableOpacity style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Gem</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Rediger</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FCF7F2",
    width: "100%",
    padding: 15,
    marginBottom: 8,
    alignItems: "center",
    textAlign: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  text: {
    textAlign: "center",
  },
  input: {
    backgroundColor: "#FFF",
    padding: 5,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 8,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: '#000000',
    fontSize: 12,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ProfileCard;
