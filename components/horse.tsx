import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function AddHorse() {
    const [name, setName] = useState('');
    const [breed, setBreed] = useState('');
    const [age, setAge] = useState('');
    const [color, setColor] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleAddHorse = async () => {
        // Validate inputs
        if (!name || !breed || !age || !color) {
            setError('All fields are required');
            return;
        }

        try {
            // Add a new document with a generated ID
            await addDoc(collection(db, 'horses'), {
                name: name,
                breed: breed,
                age: parseInt(age),  // Convert age to number
                color: color,
            });

            // Reset fields
            setName('');
            setBreed('');
            setAge('');
            setColor('');
            setError('');
            setSuccessMessage('Horse data added successfully!');
        } catch (e) {
            setError('Error adding horse data: ' + e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Add a Horse</Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

            <TextInput
                style={styles.input}
                placeholder="Horse Name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Breed"
                value={breed}
                onChangeText={setBreed}
            />
            <TextInput
                style={styles.input}
                placeholder="Age"
                value={age}
                keyboardType="numeric"
                onChangeText={setAge}
            />
            <TextInput
                style={styles.input}
                placeholder="Color"
                value={color}
                onChangeText={setColor}
            />
            <Button title="Add Horse" onPress={handleAddHorse} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#000000',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: '#FCF7F2',
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
});
