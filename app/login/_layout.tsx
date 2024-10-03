// app/sign-up/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function LoginLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="createAccount" options={{ headerShown: false }} />
        </Stack>
    );
}
