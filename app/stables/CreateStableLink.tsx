import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";

export default function CreateStableLink() {
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text>Du har ikke oprettet en stald endnu.</Text>
      <Button
        title="Opret stald"
        onPress={() => router.push("/stables/CreateStableScreen")} // Naviger korrekt til stables/CreateStableScreen
      />
    </View>
  );
}
