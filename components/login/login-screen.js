import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable, TextInput, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '@rneui/themed';
import { useRecoilState } from 'recoil';
import { currentUserState } from '../../store';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ScaledSheet } from 'react-native-size-matters';

// import the api
import { fetchData } from '../../api/api';

export default function LoginScreen({ handleLogin }) {
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // Added loading state
    const { theme } = useTheme();

    const styles = ScaledSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        block: {
            alignItems: 'center',
            padding: '8@ms0.3',
            marginBottom: '20@ms0.3',
        },
        h1: {
            fontSize: '24@ms0.3',
            fontWeight: 'bold',
            marginBottom: '15@ms0.3',
            textAlign: 'center',
        },
        p: {
            fontSize: '16@ms0.3',
            fontWeight: 'normal',
            textAlign: 'center',
        },
        input: {
            width: '250@ms',
            height: '50@vs',
            padding: '8@ms0.3',
            borderWidth: 1,
            borderRadius: 5,
            marginBottom: '30@ms0.3',
            borderColor: 'silver',
        },
        button: {
            marginTop: '16@ms0.3',
            width: '250@ms',
            height: '50@vs',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 5,
            backgroundColor: '#50CFF9',
            marginBottom: '20@ms0.3',
        },
        buttonText: {
            color: 'white',
            fontSize: '16@ms0.3',
        },
        image: {
            width: '300@ms',
            height: '300@vs',
            marginBottom: '40@ms0.3',
        },
        loadingContainer: {
            marginTop: '10@ms0.3',
        },
    });

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // set the email to lowercase
        email = email.toLowerCase();
        return emailRegex.test(email);
    };

    function handleTextChange(value) {
        setCurrentUser(value);
        setError(null); // Clear previous error when the user starts typing
    }

    function handleLoginPress() {
        if (isValidEmail(currentUser)) {
            setLoading(true); // Set loading to true when the login process starts
            checkIfUser(currentUser);
        } else {
            setError('Invalid email address');
        }
    }

    function checkIfUser(user) {
        // check if the given email is in the database, with error handling
        fetchData('user')
            .then((response) => {
                const userExists = response.find((item) => item.email === user);

                if (userExists) {
                    handleLogin(userExists);
                    setCurrentUser(userExists);
                } else {
                    setError('User does not exist');
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setLoading(false); // Set loading back to false when the login process completes
            });
    }

    return (
        <KeyboardAwareScrollView
            contentContainerStyle={styles.container}
            extraHeight={100} // Adjust as needed
            enableOnAndroid={true}
            keyboardShouldPersistTaps="handled"
        >
            <View style={styles.block}>
                <Image style={styles.image} source={require('../../assets/images/welcomeScreen.png')} />
                <Text style={styles.h1}>Let's sign you in.</Text>
                <Text style={styles.p}>Welcome back.</Text>
            </View>
            <TextInput
                style={styles.input}
                placeholder="Enter E-mail"
                onChangeText={handleTextChange}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            {loading && <ActivityIndicator size="small" color={theme.colors.primary} style={styles.loadingContainer} />}
            {error && <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>}
            <Pressable style={styles.button} onPress={handleLoginPress}>
                <Text style={styles.buttonText}>Login</Text>
            </Pressable>
        </KeyboardAwareScrollView>
    );
}
