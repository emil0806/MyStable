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
        <Text style={styles.title}>Profil</Text>
        <Text>Email: {email}</Text>
        <Text>Navn: {name}</Text>
        <Text>Telefon: {phone}</Text>
        <Text>Antal heste: {horsesCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FCF7F2",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    width: "85%",
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
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
