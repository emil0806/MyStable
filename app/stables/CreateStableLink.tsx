import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native"; // Importer useTheme for at få adgang til temaets farver

export default function CreateStableLink() {
  const router = useRouter();
  const { colors } = useTheme(); // Få adgang til temaets farver

  return (
    <View style={{ padding: 20 }}>
      <Text>Du har ikke oprettet en stald endnu.</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]} // Brug colors.primary fra temaet
        onPress={() => router.push("/stables/CreateStableScreen")}
      >
        <Text style={styles.buttonText}>Opret stald</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#000000",
  },
  buttonText: {
    color: "#000000",
    textAlign: "center",
  },
});
