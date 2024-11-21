import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Link, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useContext, useEffect, useState } from "react";
import "react-native-reanimated";
import { onAuthStateChanged, User } from "firebase/auth";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { auth } from "@/firebaseConfig";
import { Pressable, TouchableOpacity, Text, StyleSheet } from "react-native";

export const ourTheme = {
  ...DefaultTheme, // Extend the default light theme
  colors: {
    ...DefaultTheme.colors,
    primary: "#FCF7F2", // Custom primary color for buttons, etc.
    background: "#FCF7F2", // Custom background color
    textPrimary: "#000000",
    textSecondary: "#8E8E93", // Custom text color
    placeholder: "#C7C7CD",
    card: "#ffffff", // Color for cards, headers
    border: "#cccccc", // Border color for various components
    notification: "#ff9800", // Color for notifications (like badges)
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "login",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);
  // Defining and setting uo navigation between main pages
  return (
    <NavigationContainer>
      <ThemeProvider value={ourTheme}>
        <Stack screenOptions={{ gestureEnabled: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="stables" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{
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
    </NavigationContainer>

  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 18,
    color: "#000",
  },
});
