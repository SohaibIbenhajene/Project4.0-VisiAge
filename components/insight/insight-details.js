import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchData } from '../../api/api';
import { useRecoilState } from 'recoil';
import { styleState, currentUserState } from '../../store';
import { useTheme } from '@rneui/themed';
import { ScaledSheet } from 'react-native-size-matters';

import CoughView from './cough-view';
import FallView from './fall-view';

export default function InsightDetails({ navigation, route }) {
    const { dependent } = route.params;
    const [coughs, setCoughs] = useState([]);
    const [falls, setFalls] = useState([]);
    const [showCoughData, setShowCoughData] = useState(true);
    const [style, setStyle] = useRecoilState(styleState);
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState) || {};
    const { theme } = useTheme();

    // get the current month name and the current year
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    useFocusEffect(
        React.useCallback(() => {
            const fetchCoughsAndFalls = async () => {
                try {
                    const coughData = await fetchData(`cough`);
                    const filteredCoughs = coughData.filter((cough) => cough.dependentId === dependent?.id);
                    setCoughs(filteredCoughs);

                    const alertData = await fetchData(`alert`);
                    const filteredAlerts = alertData.filter((alert) => alert.dependentId === dependent?.id);
                    const filteredFalls = filteredAlerts.filter((alert) => alert.incidentTypeId === 1 && alert.dependentId === dependent?.id);
                    setFalls(filteredFalls);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchCoughsAndFalls();

            // set the navigation options with the current month and year
            navigation.setOptions({
                title: `Details ${currentMonth}, ${currentYear}`,
            });
        }, [navigation, currentUser])
    );

    const toggleSwitch = (showCough) => {
        setShowCoughData(showCough);
    };

    return (
        <View style={style.containerColumn}>
            <View style={styles.buttonContainer}>
                <Pressable
                    onPress={() => toggleSwitch(true)}
                    style={[style.button, styles.buttonLeft, !showCoughData ? styles.grey : null]}
                >
                    <Text style={style.buttonText}>Coughs</Text>
                </Pressable>
                <Pressable
                    onPress={() => toggleSwitch(false)}
                    style={[style.button, styles.buttonRight, showCoughData ? styles.grey : null]}
                >
                    <Text style={style.buttonText}>Falls</Text>
                </Pressable>
            </View>
            {showCoughData ? <CoughView coughs={coughs} /> : <FallView falls={falls} />}
        </View>
    );
}

const styles = ScaledSheet.create({
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        margin: '10@ms0.3',
    },
    buttonLeft: {
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        width: '50%',
        duration: 1000,
    },
    buttonRight: {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        width: '50%',
        duration: 1000,
    },
    grey: {
        backgroundColor: 'silver',
    },
});
