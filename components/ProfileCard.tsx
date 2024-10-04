import React from 'react';
import { View, StyleSheet } from 'react-native';

// ProfileCard component
const ProfileCard: React.FC = () => {
  return (
    <View style={styles.card}>
      {/* Empty box for now */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FCF7F2', // Same background color as the HorseCard
    borderRadius: 10, // Rounded borders
    padding: 10, // Padding inside the card
    margin: 10, // Margin outside the card
    elevation: 3, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    width: '85%', // Adjust card width
    height: 150, // Fixed height for now, adjust as needed
    alignSelf: 'center', // Center the card horizontally on the screen
  },
});

export default ProfileCard;
