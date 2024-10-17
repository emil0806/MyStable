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
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleEdit}>
          <Text style={styles.buttonText}>Opdater oplysninger</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FCF7F2",
    borderRadius: 10,
    padding: 10,
    marginLeft: 30,
    marginRight: 30,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: "center",
    width: 330,
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
  buttonContainer: {
    alignItems: "center"
  },
  button: {
    marginTop: 10,
    width: 200,
    padding: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
    backgroundColor: "#fcf7f2",
  },
  buttonText: {
    color: "#000", // Black text
    fontSize: 16,
    textAlign: "center"
  },
  feed: {

  },
});

export default HorseCard;
