import { View, Text, Button, StyleSheet, Pressable } from 'react-native';
import { useRecoilState } from 'recoil';
import { styleState } from '../../store';
import { useTheme } from '@rneui/themed';
import React, { useState } from 'react';
import { putData } from '../../api/api';
import { Input } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default function AlertMessage({ route, navigation }) {
    const { statusId, alert } = route.params;
    const [style, setStyle] = useRecoilState(styleState);
    const [message, setMessage] = useState('');
    const { theme } = useTheme();

    async function handleUpdateAlertStatus() {
        try {
            const timestamp = new Date();
            // add 1 hour to the timestamp
            timestamp.setHours(timestamp.getHours() + 1);
            // stringify the timestamp
            timestamp.toISOString();

            const updatedAlertStatus = {
                Message: message,
                AlertStatusTypeId: statusId,
                AlertId: alert.id,
                TimeStamp: timestamp,
            };

            // update the alert status in the database
            await putData('alertstatus/' + alert.alertStatus.id, updatedAlertStatus);

            // navigate to the alert screen
            navigation.navigate('Alertspage');
        } catch (error) {
            console.log(error);
        }
    }

    function handleChangeText(text) {
        setMessage(text);
    }

    const styles = StyleSheet.create({
        custom: {
            height: 200, 
            textAlignVertical: 'top',
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
        },
        center: {
            alignItems: 'center',
        },
        buttonPrimary: {
            backgroundColor: theme.primary,
        },
        buttonTextColor: {
            color: 'white',
        },
    });

    return (
        <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled">
            <View style={[style.containerColumn, style.height, styles.center]}>
                <Input
                    placeholder={
                        statusId === 1
                            ? 'Enter a reason for closing the alert'
                            : statusId === 3
                            ? 'Enter a reason for escalating the alert'
                            : 'Enter a reason'
                    }
                    multiline={true}
                    numberOfLines={10}
                    onChangeText={(message) => handleChangeText(message)}
                    style={styles.custom}
                />
                <Pressable style={[style.button, styles.buttonPrimary]} onPress={handleUpdateAlertStatus}>
                    <Text style={styles.buttonTextColor}>
                        {statusId === 1 ? 'Resolve alert' : statusId === 3 ? 'Escalate alert' : 'Create Alert'}
                    </Text>
                </Pressable>
            </View>
        </KeyboardAwareScrollView>
    );
}