import React from "react";
import { View, Text, TouchableOpacity, ViewStyle, StyleSheet } from "react-native";

interface Feeding {
  food: string;
  quantity: string;
}

interface HorseCardProps {
  name: string;
  breed: string;
  dob: string;
  color: string;
  feedings: Feeding[];
  style?: ViewStyle;
}

const HorseCard: React.FC<HorseCardProps> = ({
  name,
  breed,
  dob,
  color,
  feedings,
  style,
}) => {

  return (
    <View style={[styles.card, style]}>
      {/* Horse details */}
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{name}</Text>
          <Text>{breed}</Text>
          <Text>{dob}</Text>
          <Text>{color}</Text>
        </View>
      </View>

      {/* Feed section */}
      <View style={styles.feed}>
        {feedings.map((feeding, index) => (
          <View key={index} style={styles.feed}>
            <Text>{feeding.food}</Text>
            <Text>{feeding.quantity}</Text>
          </View>
        ))}
      </View>

      {/* Edit button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Edit details</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FCF7F2",
    borderRadius: 10,
    padding: 10,
    margin: 10,
    elevation: 3, // for Android shadow
    shadowColor: "#000", // for iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    width: "100%", // Adjust card width
    alignSelf: "center", // Center the card horizontally on the screen
  },
  header: {
    flexDirection: "row", // Align text and image in a row
    justifyContent: "space-between", // Space between title and image
    marginBottom: 10,
  },
  textContainer: {
    flex: 1, // Allow text to take up remaining space
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Bold", // Apply Inter Bold font to the title
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10, // Adds space between text and image
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  placeholder: {
    width: 100,
    height: 100,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  feed: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  button: {
    borderColor: "#000", // Black border
    borderWidth: 1, // Thin border
    borderRadius: 20, // Rounded corners
    paddingVertical: 5, // Vertical padding inside the button
    paddingHorizontal: 15, // Horizontal padding inside the button
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000", // Black text
    fontSize: 16, // Font size similar to the image
    fontFamily: "Inter-Regular", // Apply Inter Regular font to button text
  },
});

export default HorseCard;
