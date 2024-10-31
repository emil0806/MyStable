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
  const colorScheme = useColorScheme();

  const handleSignOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        Alert.alert("Du er logget ud.");
        router.replace("/login");
      })
      .catch((error) => {
        Alert.alert("Error", error.message);
      });
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#000000", // Black when active (hovered)
        tabBarInactiveTintColor: "#405553", // Greyish color when inactive
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
      <Tabs.Screen
        name="index"
        options={{
          title: "Stald",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="warehouse" color={color} size={30} />
          ),
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
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
      {/* Profile tab with a black icon when active and grey when inactive */}
      <Tabs.Screen
        name="three"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          // Adding sign-out button in the header for the profile page
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
