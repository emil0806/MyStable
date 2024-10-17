import { router } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
  Alert,
} from "react-native";

interface ProfileCardProps {
  email: string;
  name: string;
  phone: string;
  horsesCount: number;
}

// ProfileCard component
const ProfileCard: React.FC<ProfileCardProps> = ({
  email,
  name,
  phone,
  horsesCount,
}) => {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.text}>Email: {email}</Text>
        <Text style={styles.text}>Telefon: {phone}</Text>
        <Text style={styles.text}>Antal heste: {horsesCount}</Text>
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
  button: {
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {},
});

export default ProfileCard;
