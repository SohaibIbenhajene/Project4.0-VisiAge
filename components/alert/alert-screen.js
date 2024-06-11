import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { useRecoilState } from 'recoil';
import { alertsState, styleState, currentUserState, alertStatusUserState } from '../../store';
import { useFocusEffect } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';

import AlertCard from './alert-card';
import { fetchData } from '../../api/api';
import LoadingComponent from '../misc/loading-component'; // Import the LoadingComponent

export default function AlertScreen({ navigation }) {
    const [alerts, setAlerts] = useRecoilState(alertsState);
    const [style, setStyle] = useRecoilState(styleState);
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
    const [alertStatusUser, setAlertStatusUser] = useRecoilState(alertStatusUserState);
    const [loading, setLoading] = useState(true); // Add loading state

    const fetchAlerts = async () => {
        try {
            const data = await fetchData('alert');
            const sortedAlerts = data.sort((a, b) => {
                const timestampA = new Date(a.timeStamp).getTime();
                const timestampB = new Date(b.timeStamp).getTime();
                return timestampB - timestampA;
            });
            setAlerts(sortedAlerts);
        } catch (error) {
            console.error('Error fetching and sorting alerts:', error);
        } finally {
            setLoading(false); // Set loading to false after fetching data
        }
    };

    const fetchAlertStatusUsers = async () => {
        try {
            const data = await fetchData('alertstatususer');
            setAlertStatusUser(data);
        } catch (error) {
            console.log(error);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            setLoading(true); // Set loading to true when component is focused
            fetchAlerts();
            fetchAlertStatusUsers();
        }, [])
    );

    let filteredAlerts = [];

    if (currentUser.roleId === 1) {
        filteredAlerts = alerts.filter((alert) => alert.dependentId === currentUser.id);
    } else if (currentUser.roleId === 2) {
        filteredAlerts = alerts.filter((alert) => alert.dependentId === currentUser.dependentId);
    } else {
        filteredAlerts = alerts;
    }

    function onPress(alert) {
        navigation.navigate('AlertDetails', { alert: alert });
    }

    function handleInsert() {
        navigation.navigate('AlertInsert');
    }

    const styles = ScaledSheet.create({
        container: {
            flex: 1,
        },
        contentContainer: {
            flexGrow: 1,
        },
        buttonContainer: {
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: '30@ms'
        },
    });

    return (
        <View style={[style.containerColumn, styles.container]}>
            {loading ? (
                <LoadingComponent /> // Use the LoadingComponent here
            ) : (
                <>
                    <FlatList
                        data={filteredAlerts}
                        renderItem={({ item }) => <AlertCard alert={item} onPress={onPress} />}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.contentContainer}
                    />
                    {currentUser.roleId === 1 && (
                        <View style={styles.buttonContainer}>
                            <Pressable style={style.button} onPress={() => handleInsert()}>
                                <Text style={style.buttonText}>Create Manual Alert</Text>
                            </Pressable>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}
