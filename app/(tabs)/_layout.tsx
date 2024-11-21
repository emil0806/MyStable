import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, router, Tabs } from "expo-router";
import { Alert, Pressable, TouchableOpacity, Image } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { getAuth, signOut } from "firebase/auth";
import { Text } from "react-native";
import { StyleSheet } from "react-native";
import { View } from "@/components/Themed";

// TabBarIcon component for rendering the FontAwesome icon
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {

  // Sign user out when clicking on button
  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        Alert.alert("Du er logget ud.");
        router.replace("/login"); // Sends user back to login screen
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    // Defines the tabs in bottom navigation bar
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#000000",
        tabBarInactiveTintColor: "#405553",
        headerShown: useClientOnlyValue(false, true),
        headerTitle: "",

        tabBarStyle: {
          backgroundColor: "#fcf7f2",
          paddingTop: 8,
        },

        headerStyle: {
          backgroundColor: "#fcf7f2",
        },
      }}
    >
      {/* Stable tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Stald",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="warehouse" color={color} size={30} />
          ),
          // Icon in header for announcements  
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="bell"
                    size={25}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      {/* Calendar Tab */}
      <Tabs.Screen
        name="two"
        options={{
          title: "Kalender",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="calendar-month"
              color={color}
              size={30}
            />
          ),
        }}
      />
      {/* Profile tab */}
      <Tabs.Screen
        name="three"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          // Adding sign-out button in the header
          headerRight: () => (
            <TouchableOpacity style={styles.button} onPress={handleSignOut}>
              <Text style={styles.buttonText}>Log ud</Text>
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  button: {
    marginRight: 15,
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
