import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Link, Stack } from "expo-router";
import "react-native-reanimated";
import Colors from "@/constants/Colors";
import { Pressable, Text, StyleSheet } from "react-native";
import { useColorScheme } from "@/components/useColorScheme";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/firebaseConfig";

// Definer vores tema med vores egne farver
export const ourTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#FCF7F2",
    background: "#FCF7F2",
    textPrimary: "#000000",
    textSecondary: "#8E8E93",
    placeholder: "#C7C7CD",
    card: "#ffffff",
    border: "#cccccc",
    notification: "#ff9800",
  },
};

SplashScreen.preventAutoHideAsync();

export default function StableLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <StableLayoutNav />;
}

function StableLayoutNav() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider value={ourTheme}>
      <Stack screenOptions={{ headerShown: false, title: "", headerTitle: "" }}>
        <Stack.Screen
          name="CreateStableScreen"
          options={{ headerShown: false, title: "", headerTitle: "" }}
        />
        <Stack.Screen
          name="ViewAllStables"
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: "#fcf7f2",
            },
            headerTitle: "",
            headerLeft: () => (
              <Link href="/(tabs)" asChild>
                <Pressable
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <FontAwesome
                    name="arrow-left"
                    size={14}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.text}>Stald</Text>
                </Pressable>
              </Link>
            ),
          }}
        />
        <Stack.Screen
          name="AddMember"
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: "#fcf7f2",
            },
            headerTitle: "",
            headerLeft: () => (
              <Link href="/(tabs)" asChild>
                <Pressable
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <FontAwesome
                    name="arrow-left"
                    size={14}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.text}>Stald</Text>
                </Pressable>
              </Link>
            ),
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    color: "#000",
  },
});
