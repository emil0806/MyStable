import { Stack } from "expo-router";
import React from "react";

export default function StableLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="CreateStableScreen"
        options={{ headerShown: false, title: "Opret Stald" }}
      />
      <Stack.Screen
        name="ViewAllStables"
        options={{ headerShown: false, title: "Alle Stalde" }}
      />
    </Stack>
  );
}
