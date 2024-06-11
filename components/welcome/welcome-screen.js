import React from 'react';
import { View, StyleSheet, Text, Pressable, Image } from 'react-native';
import { useTheme } from '@rneui/themed';
import { ScaledSheet } from 'react-native-size-matters';

export default function WelcomeScreen({ navigation }) {
  const { theme } = useTheme();

  const styles = ScaledSheet.create({
    container: {
      flexDirection: 'column',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8@ms0.3',
      height: '100%',
    },
    h1: {
      fontSize: '24@ms0.3',
      fontWeight: 'bold',
      marginBottom: 15,
    },
    p: {
      fontSize: '16@ms0.3',
      fontWeight: 'normal',
      textAlign: 'center',
    },
    block: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '8@ms0.3',
    },
    button: {
      marginTop: '16@ms0.3',
      width: '280@ms0.3',
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
      marginTop: '100@ms0.3',
      marginBottom: '40@ms0.3',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.block}>
        <Image style={styles.image} source={require('../../assets/images/welcomeScreen.png')} />
        <Text style={styles.h1}>Welcome to Visi Age</Text>
        <Text style={styles.p}>Stay connected effortlessly.</Text>
        <Text style={styles.p}>Watch over your loved ones with precision and care!</Text>
      </View>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
    </View>
  );
}
