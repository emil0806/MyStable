import { Stack } from "expo-router";
import React from "react";

export default function StableLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, title: "", headerTitle: "" }}>
      <Stack.Screen
        name="CreateStableScreen"
        options={{ headerShown: false, title: "", headerTitle: "" }}
      />
      <Stack.Screen
        name="ViewAllStables"
        options={{ headerShown: false, title: "", headerTitle: "" }}
      />
      <Stack.Screen
        name="AddMember"
        options={{ headerShown: false, title: "", headerTitle: "" }}
      />
    </Stack>
  );
}
