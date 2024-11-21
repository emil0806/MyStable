import { StyleSheet } from 'react-native';

import SignIn from '../../components/signIn';
import { Text, View } from '@/components/Themed';

import { useTheme } from '@react-navigation/native';

// Screen for login
export default function Login() {

    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SignIn />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});