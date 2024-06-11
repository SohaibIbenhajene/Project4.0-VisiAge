import { View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useRecoilState } from 'recoil';
import { styleState, dependentsState, alertsState, currentUserState, alertStatusUserState } from '../../store';
import { useTheme } from '@rneui/themed';
import { CheckBox } from 'react-native-elements';
import { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { ScaledSheet } from 'react-native-size-matters';

// import the api
import { putData, postData, fetchData } from '../../api/api';

import DependentCard from '../misc/dependent-card';
import VideoCard from '../misc/video-card';
import LoadingComponent from '../misc/loading-component'; // Import the LoadingComponent

export default function AlertDetails({ route, navigation }) {
    const { alert } = route.params;
    const [style, setStyle] = useRecoilState(styleState);
    const [dependents, setDependents] = useRecoilState(dependentsState);
    const [alerts, setAlerts] = useRecoilState(alertsState);
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
    const [alertStatusUser, setAlertStatusUser] = useRecoilState(alertStatusUserState);

    // create the state variables for the new AlertStatusUser
    const [newAlertStatusUser, setNewAlertStatusUser] = useState('');
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true); // Add loading state

    useFocusEffect(
        React.useCallback(() => {
            // set the newAlertStatusUser to the tempAlertStatusUser
            if (currentUser.roleId == 3 || currentUser.roleId == 2) {
                const tempAlertStatusUser = {
                    alertStatusId: alert.alertStatus.id,
                    resolverId: currentUser.id,
                };
                setNewAlertStatusUser(tempAlertStatusUser);
            }
        }, [])
    );

    useEffect(() => {
        setLoading(false); // Set loading to false after initial rendering
    }, []);

    const styles = ScaledSheet.create({
        custom: {
            alignItems: 'center',
        },
        containerGap: {
            gap: 30,
        },
        buttonDangerOutline: {
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: theme.danger,
        },
        buttonPrimary: {
            backgroundColor: theme.primary,
        },
        buttonSecondary: {
            backgroundColor: theme.secondary,
        },
        buttonDangerOutlineText: {
            color: theme.danger,
        },
        buttonTextColor: {
            color: 'white',
        },
        height: {
            height: '100%',
        },
        text: {
            marginBottom: '20@ms0.3',
        },
        timeAlert: {
            fontSize: '12@ms0.3',
        },
        textUserName: {
            fontSize: '12@ms',
        },
        scrollView: {
            maxHeight: '100%',
            // can you also check if the currentUser.roleId == 1 then show 100%
            marginBottom: (currentUser.roleId === 2) ? '0@ms' : '16@ms',
        },
    });

    // get the dependent from the id
    function getDependent(id) {
        return dependents.find((dependent) => dependent.id === id);
    }

    function onPress(dependent) {
        navigation.navigate('Dependent', { dependent: dependent });
    }

    async function handleUpdateAlertStatus(status) {
        try {
            navigation.navigate('AlertMessage', { statusId: status, alert: alert });
        } catch (error) {
            console.log(error);
        }
    }

    async function handleFalseAlarm(status) {
        try {
            const timestamp = new Date();
            // add 1 hour to the timestamp
            timestamp.setHours(timestamp.getHours() + 1);
            // stringify the timestamp
            timestamp.toISOString();

            const updatedAlertStatus = {
                AlertStatusTypeId: status,
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

    async function handleAssignCaregiverOrConfidant() {
        try {
            // add the new newAlertStatusUser to the database
            await postData('alertstatususer', newAlertStatusUser);

            const updatedAlertStatusUsers = await fetchData('alertstatususer');

            // insert the newAlertStatusUser into the state
            setAlertStatusUser(updatedAlertStatusUsers);
        } catch (error) {
            console.log(error);
        }
    }

    // get time from timestamp
    function getTime(timestamp) {
        const date = new Date(timestamp);
        // get the time with format hh:mm with a 24-hour clock
        let time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        // get the date with format dd/mm/yyyy and return the date and time
        return time + ' - ' + date.toLocaleDateString('en-GB');
    }

    return (
        <View contentContainerStyle={[style.containerColumnSpaceBetween, styles.height]}>
            {loading ? (
                <LoadingComponent /> // Use the LoadingComponent here
            ) : (
                <ScrollView style={styles.scrollView}>
                    <View style={style.containerColumn}>
                        <View style={[style.containerRowSpaceBetween, styles.custom]}>
                            <Text style={style.h1}>{alert.incidentType.name} {alert.incidentTypeId === 1 ? 'detected' : ''}</Text>
                            <Text style={[style.grey, styles.timeAlert]}>{getTime(alert.timeStamp)}</Text>
                        </View>
                        <DependentCard dependent={getDependent(alert.dependentId)} onPress={onPress} />
                        {alert.cameraRoom != null ? <Text style={style.h2}>Room: {alert.cameraRoom.name} </Text> : null}
                        {alert.incidentTypeId == 1 ? (
                            <>
                                <VideoCard url={alert.videoBlobFile} />
                            </>
                        ) : (
                            null
                        )}
                        {alert.reason != null ? (
                            <View style={styles.text}>
                                <Text style={style.h2}>Alert message:</Text>
                                <Text style={styles.textUserName}>{alert.reason}</Text>
                            </View>
                        ) : null}

                        {alert.alertStatus.message != '' ? (
                            <View style={styles.text}>
                                <Text style={style.h2}>
                                    {alert.alertStatus.alertStatusTypeId == 1
                                        ? 'Alert resolve message:'
                                        : alert.alertStatus.alertStatusTypeId == 3
                                            ? 'Alert escalation message:'
                                            : ''}
                                </Text>
                                    <Text style={styles.textUserName}>{alert.alertStatus.message}</Text>
                            </View>
                        ) : null}

                        {alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolver.roleId == 2) != null ? (
                            <View style={styles.text}>
                                <Text style={style.h2}>Assigned confidant name:</Text>
                                <Text style={styles.textUserName}>
                                    {alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolver.roleId == 2).resolver.firstName +
                                        ' ' +
                                        alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolver.roleId == 2).resolver.lastName}
                                </Text>
                            </View>
                        ) : null}

                        {alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolver.roleId == 3) != null ? (
                            <View style={styles.text}>
                                <Text style={style.h2}>Assigned caregiver name:</Text>
                                <Text style={styles.textUserName}>
                                    {alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolver.roleId == 3).resolver.firstName +
                                        ' ' +
                                        alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolver.roleId == 3).resolver.lastName}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                        <View style={[style.containerColumn, styles.custom]}>
                            {/* If the currentUser.roleId is 3 and the alertStatusUser for this alert has no resolvers with the id 3 then show the button assign caregiver */}
                            {currentUser.roleId == 3 &&
                                alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolver.roleId == 3) == null &&
                                (alert.alertStatus.alertStatusTypeId == 2 || alert.alertStatus.alertStatusTypeId == 3 || alert.alertStatus.alertStatusTypeId == 4) ? (
                                <Pressable style={[style.button, styles.buttonPrimary]} onPress={() => handleAssignCaregiverOrConfidant()}>
                                    <Text style={[style.buttonText, styles.buttonTextColor]}>Assign caregiver</Text>
                                </Pressable>
                            ) : (
                                ''
                            )}
                            {/* If the currentUser.roleId is 2 and the alertStatusUser for this alert has no resolvers with the id 2 and there are no resolvers with the id 3 then show the button assign confidant */}
                            {currentUser.roleId == 2 &&
                                alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolver.roleId == 2) == null &&
                                alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolver.roleId == 3) == null &&
                                alert.alertStatus.alertStatusTypeId == 2 ? (
                                <Pressable style={[style.button, styles.buttonPrimary]} onPress={() => handleAssignCaregiverOrConfidant()}>
                                    <Text style={[style.buttonText, styles.buttonTextColor]}>Assign confidant</Text>
                                </Pressable>
                            ) : (
                                ''
                            )}
                            {/* If the currentUser.roleId is 2 and the alertStatusUser for this alert has a resolver with the same id as the currentUser and the alertstatususer.alertstatus.alertStatusTypeId != 3 */}
                            {currentUser.roleId == 2 &&
                                alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolverId == currentUser.id && item.alertStatus.alertStatusTypeId == 2) != null ? (
                                <>
                                    <Pressable style={[style.button, styles.buttonPrimary]} onPress={() => handleUpdateAlertStatus(1)}>
                                        <Text style={[style.buttonText, styles.buttonTextColor]}>Resolve</Text>
                                    </Pressable>
                                    <Pressable style={[style.button, styles.buttonSecondary]} onPress={() => handleFalseAlarm(5)}>
                                        <Text style={[style.buttonText, styles.buttonTextColor]}>False Alarm</Text>
                                    </Pressable>
                                </>
                            ) : (
                                ''
                            )}
                            {/* If the currentUser.roleId is 2 and the alertStatusUser for this alert has a resolver with the same id as the currentUserId and the alertStatusType is not equal to 1, 3, 4, 5 then show the button escalate */}
                            {currentUser.roleId == 2 &&
                                alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolverId == currentUser.id && item.alertStatus.alertStatusTypeId != 1 && item.alertStatus.alertStatusTypeId != 3 && item.alertStatus.alertStatusTypeId != 4 && item.alertStatus.alertStatusTypeId != 5) !=
                                null ? (
                                <Pressable style={[style.button, styles.buttonDangerOutline]} onPress={() => handleUpdateAlertStatus(3)}>
                                    <Text style={[style.buttonText, styles.buttonDangerOutlineText]}>Escalate</Text>
                                </Pressable>
                            ) : (
                                ''
                            )}
                            {/* If the currentUser.roleId is 3 and the alertStatusUser for this alert has a resolver with the same id as the currentUserId then show the Resolve button and the alertstatususer.alertstatus.alertStatusTypeId is not equal to 3 or 1 */}
                            {currentUser.roleId == 3 &&
                                alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.resolverId == currentUser.id) != null &&
                                alertStatusUser.find((item) => item.alertStatus.alertId == alert.id && item.alertStatus.alertStatusTypeId != 4 && item.alertStatus.alertStatusTypeId != 1 && item.alertStatus.alertStatusTypeId != 5) !=
                                null ? (
                                <>
                                    <Pressable style={[style.button, styles.buttonPrimary]} onPress={() => handleUpdateAlertStatus(1)}>
                                        <Text style={[style.buttonText, styles.buttonTextColor]}>Resolve</Text>
                                    </Pressable>
                                    <Pressable style={[style.button, styles.buttonSecondary]} onPress={() => handleFalseAlarm(5)}>
                                        <Text style={[style.buttonText, styles.buttonTextColor]}>False Alarm</Text>
                                    </Pressable>
                                </>
                            ) : (
                                ''
                            )}
                        </View>
                </ScrollView>
            )}
        </View>
    );
}
