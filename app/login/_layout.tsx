// app/sign-up/_layout.tsx
import { FontAwesome } from '@expo/vector-icons';
import { Link, Stack } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';

// Navigation used when logging in
export default function LoginLayout() {
    return (
        <Stack screenOptions={{ gestureEnabled: false }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="createAccount" options={{
                headerTitle: "",
                headerStyle: {
                    backgroundColor: "#fcf7f2",
                },
                headerLeft: () => (
                    <Link href="/login" asChild>
                        <Pressable
                            style={{ flexDirection: "row", alignItems: "center" }}
                        >
                            <FontAwesome
                                name="arrow-left"
                                size={16}
                                style={{ marginRight: 5 }}
                            />
                        </Pressable>
                    </Link>
                ),
            }} />
        </Stack>
    );
}
