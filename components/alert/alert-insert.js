import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useRecoilState } from 'recoil';
import { styleState, alertsState, currentUserState } from '../../store';
import { useState } from 'react';
import { Input } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';

// import the api
import { postData } from '../../api/api';

export default function AlertInsert({ handleNotificationSendToConfidents }) {
    const [style, setStyle] = useRecoilState(styleState);
    const [alerts, setAlerts] = useRecoilState(alertsState);
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
    const navigation = useNavigation();

    // create the state variables for the new alert
    const [newAlert, setNewAlert] = useState('');

    // create an empty alert object
    const emptyAlert = {
        reason: "",
        timeStamp: null,
        incidentTypeId: 2,
        incidentType: {
            id: 2,
            name: "Manual Alert",
        },
        dependentId: currentUser.id,
    };

    // create a function to handle the insert
    async function handleAlertInsert() {
        try {
            // set the newAlert to the emptyAlert
            setNewAlert(emptyAlert);
            // set the timestamp
            const timestamp = new Date();
            // add 1 hour to the timestamp
            timestamp.setHours(timestamp.getHours() + 1);
            // stringify the timestamp
            timestamp.toISOString();
            // add the timestamp to the newAlert
            newAlert.timeStamp = timestamp;

            // add the new alert to the database
            const response = await postData('alert', newAlert);

            // set the tmpAlert to the response
            let tmpAlert = response;

            // set the incidentType of the tmpAlert
            tmpAlert.incidentType = emptyAlert.incidentType;

            // create an alertstatus object and add it to the database
            const alertStatus = {
                alertId: response.id,
                alertStatusTypeId: 2,
                alertStatusType: {
                    id: 2,
                    name: "Waiting",
                },
                timeStamp: timestamp,
                message: "",
                resolverId: null,
            };

            // add the alertstatus to the alert
            const alertStatusResponse = await postData('alertstatus', alertStatus);

            tmpAlert.alertStatus = alertStatusResponse;
            tmpAlert.alertStatusId = alertStatusResponse.id;
            tmpAlert.alertStatus.alertStatusType = alertStatus.alertStatusType;

            // insert the alert into the state
            setAlerts([...alerts, tmpAlert]);

            // send the notification to the confidents
            const message = {
                to: "", // The token will be set when the notification is sent
                sound: 'default',
                title: 'Manual Alert Triggered',
                body: 'A manual alert has been triggered by ' + currentUser.firstName + ' ' + currentUser.lastName + '!',
                data: { alertId: tmpAlert.id },
            };

            // send the notification to the confidents
            handleNotificationSendToConfidents(message, currentUser.id);

            // navigate back to the alert screen
            navigation.navigate('Alertspage');
        } catch (error) {
            console.log(error);
        }
    }

    function handleChangeText(text) {
        setNewAlert({ ...emptyAlert, reason: text });
    }

    return (
        <View style={[style.containerColumn, style.height, styles.center]}>
            <Input placeholder="Enter reason for manual alert!" multiline={true} numberOfLines={10} onChangeText={(text) => handleChangeText(text)} style={styles.custom} />
            <Pressable style={style.button} onPress={handleAlertInsert}>
                <Text style={style.buttonText}>Create Alert</Text>
            </Pressable>
        </View>
    );
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
    }
});