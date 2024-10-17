import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  StyleSheet,
} from "react-native";

interface Feeding {
  food: string;
  quantity: string;
}

interface HorseCardProps {
  id: string,
  name: string;
  breed: string;
  age: string;
  color: string;
  feedings: Feeding[];
  style?: ViewStyle;
  onEdit: (horseData: any) => void;
}

const HorseCard: React.FC<HorseCardProps> = ({
  id,
  name,
  breed,
  age,
  color,
  feedings,
  style,
  onEdit,
}) => {
  const handleEdit = () => {
    onEdit({ id, name, breed, age, color, feedings });
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{name}</Text>
          <Text>{breed}</Text>
          <Text>{ }</Text>
          <Text>{color}</Text>
        </View>
      </View>
      <View style={styles.feed}>
        {feedings.map((feeding, index) => (
          <View key={index} style={styles.feedRow}>
            <Text style={styles.foodText}>{feeding.food}</Text>
            <Text style={styles.quantityText}>{feeding.quantity} kg</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleEdit}>
        <Text style={styles.buttonText}>Opdater oplysninger</Text>
      </TouchableOpacity>
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
    width: 350, // Set a fixed width
    maxWidth: 350, // Ensure max width doesn't exceed this value
    alignSelf: "center", // Center the card horizontally
  }, // <-- Add this comma here to fix the error
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
  feedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  foodText: {
    flex: 1, // Wraps within the available space
    flexWrap: "wrap",
    fontSize: 16,
    marginRight: 10,
  },
  quantityText: {
    fontSize: 16,
    flexShrink: 0,
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
  feed: {

  },
});

export default HorseCard;
