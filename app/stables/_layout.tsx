// app/stables/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function StableLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="CreateStableScreen"
        options={{ headerShown: true, title: "Opret Stald" }}
      />
      {/* Du kan tilføje flere skærme her, hvis du senere får brug for det */}
    </Stack>
  );
}
