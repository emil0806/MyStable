import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useTheme } from '@react-navigation/native';
import { useRouter, Link } from 'expo-router';

const SignIn: React.FC = () => {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { colors } = useTheme();

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                router.push('/(tabs)');
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <TextInput
                style={styles.input}
                placeholder="Adgangskode"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.text}>Ikke bruger endnu?</Text>
            <Link style={styles.create} push href="/login/createAccount">Opret konto</Link>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 36,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        width: 220,
        borderColor: '#000000',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#FCF7F2'
    },
    button: {
        marginTop: 30,
        backgroundColor: '#FCF7F2',
        textAlign: 'center',
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#000000',
    },
    buttonText: {
        color: "#000000",
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    successText: {
        color: 'green',
        marginBottom: 10,
        textAlign: 'center',
    },
    text: {
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    create: {
        textAlign: 'center',
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    }
});

export default SignIn;
