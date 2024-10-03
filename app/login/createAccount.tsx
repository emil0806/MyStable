import { StyleSheet } from 'react-native';

import SignUp from '../../components/signUp';
import { Text, View } from '@/components/Themed';

import { useTheme } from '@react-navigation/native';


export default function CreateAccount() {

    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SignUp />
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