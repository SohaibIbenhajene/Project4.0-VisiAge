import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@rneui/themed';

export default function LoadingComponent() {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={theme.primary} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
});
