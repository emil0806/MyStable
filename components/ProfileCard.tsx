import React from "react";
import { View, Text, StyleSheet } from "react-native";

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
      <Text style={styles.title}>Profile Information</Text>
      <Text>Email: {email}</Text>
      <Text>Name: {name}</Text>
      <Text>Phone: {phone}</Text>
      <Text>Number of Horses: {horsesCount}</Text>
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
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default ProfileCard;
