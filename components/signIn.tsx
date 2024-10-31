import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
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
                router.replace('/(tabs)');
            })
            .catch(error => {
                console.error(error);
            });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../assets/images/minStaldLogo.png')} // Replace with your image path
                        style={styles.image}
                        resizeMode='center'
                    />
                </View>
                <View style={styles.inputContainer}>
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
                        style={styles.button}
                        onPress={handleLogin}>
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>

                    <Text style={styles.text}>Ikke bruger endnu?</Text>
                    <Link style={styles.create} push href="/login/createAccount">Opret konto</Link>
                </View>

            </View>
        </KeyboardAvoidingView>

    );
};

const styles = StyleSheet.create({
    image: {
    },
    container: {
        justifyContent: 'center',
        padding: 10,
        flex: 1,
        alignItems: "center"
    },
    input: {
        height: 50,
        width: 220,
        borderColor: '#000000',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#FCF7F2',
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
    },
    inputContainer: {
        justifyContent: 'center',
    },
    imageContainer: {
        justifyContent: 'center',
        height: 250,
    }
});

export default SignIn;
