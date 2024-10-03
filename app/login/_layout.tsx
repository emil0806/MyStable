// app/sign-up/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function SignUpLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
    );
}
