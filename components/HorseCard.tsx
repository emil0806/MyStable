import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  StyleSheet,
} from "react-native";

// Define the Feeding interface here
interface Feeding {
  food: string;
  quantity: string;
  measurement: string;
}

// Define HorseCardProps with the feedings array
interface HorseCardProps {
  id: string;
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
        <View style={styles.headerTextBox}>
          <Text style={styles.title}>{name}</Text>

          {/* Horse details */}
          <Text style={styles.detailText}>{breed}</Text>
          <Text style={styles.detailText}>{age}</Text>
          <Text style={styles.detailText}>{color}</Text>
        </View>

        {/* Update button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity style={styles.button} onPress={handleEdit}>
            <Text style={styles.buttonText}>Opdater</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Feeding and Button container */}
      <View style={styles.feedButtonContainer}>
        {/* Feeding details */}
        <View style={styles.feedContainer}>
          {feedings.map((feeding, index) => (
            <View key={index} style={styles.feedRow}>
              <Text style={styles.foodText}>{feeding.food}</Text>
              <Text style={styles.quantityText}>{feeding.quantity}</Text>
              <Text style={styles.measurementText}>{feeding.measurement}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FCF7F2",
    borderWidth: 0.5,
    borderColor: "lightgrey",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
    shadowRadius: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTextBox: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: "#000000",
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  imageText: {
    color: "#777",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#B0ADA9",
    marginVertical: 10,
  },
  feedButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  feedContainer: {
    flex: 2, // Occupies approximately 66% of the container
    paddingRight: 10,
  },
  feedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#B0ADA9",
  },
  foodText: {
    fontSize: 16,
    flex: 3,
    marginRight: 5,
  },
  quantityText: {
    fontSize: 16,
    flex: 1,
    textAlign: "right",
  },
  measurementText: {
    fontSize: 16,
    flex: 3,
    textAlign: "right",
  },

  buttonWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#FFFFFF",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
  },
});

export default HorseCard;
