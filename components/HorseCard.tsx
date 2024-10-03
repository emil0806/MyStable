import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

// Props interface for the HorseCard component
interface HorseCardProps {
  name: string;
  breed: string;
  dob: string;
  color: string;
  image?: string; // Optional image prop
  style?: ViewStyle; // Accept custom style
}

// HorseCard functional component displaying horse details
const HorseCard: React.FC<HorseCardProps> = ({ name, breed, dob, color, image, style }) => {
  return (
    <View style={[styles.card, style]}>
      {/* Header section containing the horse's details and image */}
      <View style={styles.header}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{name}</Text>
          <Text>{breed}</Text>
          <Text>{dob}</Text>
          <Text>{color}</Text>
        </View>
        {/* Image section with placeholder if no image is provided */}
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Text>+ Add image</Text>
            </View>
          )}
        </View>
      </View>

      {/* Feed section showing horse food information */}
      <View style={styles.feed}>
        <Text>Grøn græs</Text>
        <Text>2 kg</Text>
      </View>
      <View style={styles.feed}>
        <Text>Tørfoder</Text>
        <Text>2 kg</Text>
      </View>
      <View style={styles.feed}>
        <Text>Hø</Text>
        <Text>2 kg</Text>
      </View>
      <View style={styles.feed}>
        <Text>Gulerødder</Text>
        <Text>2 kg</Text>
      </View>

      {/* Custom styled button for editing details */}
      <TouchableOpacity style={styles.button} onPress={() => console.log('Edit pressed')}>
        <Text style={styles.buttonText}>Edit details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FCF7F2',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    elevation: 3, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    width: '85%', // Adjust card width
    alignSelf: 'center', // Center the card horizontally on the screen
  },
  header: {
    flexDirection: 'row', // Align text and image in a row
    justifyContent: 'space-between', // Space between title and image
    marginBottom: 10,
  },
  textContainer: {
    flex: 1, // Allow text to take up remaining space
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter-Bold', // Apply Inter Bold font to the title
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  feed: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  button: {
    borderColor: '#000', // Black border
    borderWidth: 1, // Thin border
    borderRadius: 20, // Rounded corners
    paddingVertical: 5, // Vertical padding inside the button
    paddingHorizontal: 15, // Horizontal padding inside the button
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000', // Black text
    fontSize: 16, // Font size similar to the image
    fontFamily: 'Inter-Regular', // Apply Inter Regular font to button text
  },
});

export default HorseCard;
