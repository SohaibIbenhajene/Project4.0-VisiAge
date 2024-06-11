import { View, Text, Button } from 'react-native';
import { useRecoilState } from 'recoil';
import { currentUserState, styleState, alertsState, dependentsState, alertStatusUserState, cameraRoomState, usersState, roleState } from '../../store';
import { useEffect, useState } from 'react';
import { useTheme } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScaledSheet } from 'react-native-size-matters';

// import the api
import { fetchData } from '../../api/api';

import UserCard from './user-card';
import DependentList from '../misc/dependent-list';
import AlertIcon from './alert-icon';
import LoadingComponent from '../misc/loading-component';

export default function HomeScreen({  }) {
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
    const [dependents, setDependents] = useRecoilState(dependentsState);
    const [users, setUsers] = useRecoilState(usersState);
    const [alertStatusUser, setAlertStatusUser] = useRecoilState(alertStatusUserState);
    const [roles, setRoles] = useRecoilState(roleState);
    const [style, setStyle] = useRecoilState(styleState);
    const [alerts, setAlerts] = useRecoilState(alertsState);
    const [cameraroom, setCameraRoom] = useRecoilState(cameraRoomState);
    const { theme } = useTheme();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);

    // fetch all the alerts
    const fetchAlerts = async () => {
        try {
            const response = await fetchData('alert');
            setAlerts(response);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchDependents = async () => {
        try {
            const data = await fetchData('user');
            // filter the data to only get the dependents on roleId = 1
            const filteredData = data.filter((user) => user.roleId === 1);
            setDependents(filteredData);
        } catch (error) {
            // Handle errors (e.g., network issues, server errors)
            console.log(error);
        }
    };

    const fetchCameraRooms = async () => {
        try {
            const response = await fetchData('cameraroom');
            setCameraRoom(response);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await fetchData('role');
            setRoles(response);
        } catch (error) {
            console.log(error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await fetchData('user');
            setUsers(response);
        } catch (error) {
            console.log(error);
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

    // set the custom styles for the app
    useEffect(() => {
        setStyle(ScaledSheet.create({
            ...style,
            h1: {
                fontSize: '24@ms',
                fontWeight: 'bold',
                marginBottom: '15@ms',
                textAlign: 'center',
            },
            h2: {
                fontSize: '20@ms',
                fontWeight: 'bold',
                marginBottom: '15@ms',
            },
            box: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            containerRow: {
                flexDirection: 'row',
                justifyContent: 'center',
                padding: '8@ms',
            },
            containerRowSpaceBetween: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: '8@ms',
            },
            containerColumn: {
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '8@ms',
            },
            containerColumnSpaceBetween: {
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '8@ms',
            },
            bold: {
                fontWeight: 'bold',
                fontSize: '20@ms0.3',
            },
            grey: {
                color: 'silver',
            },
            button: {
                width: '300@ms0.3',
                height: '50@vs',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '5@ms',
                backgroundColor: theme.primary,
                marginBottom: '20@ms',
            },
            buttonText: {
                color: 'white',
                fontSize: '16@ms',
            },
            input: {
                height: '50@vs',
                padding: '8@ms',
                borderWidth: '1@ms',
                borderRadius: '5@ms',
                marginBottom: '30@ms',
                borderColor: 'silver',
                fontSize: '12@ms0.3',
            },
            height: {
                height: '100%',
            },
        }));

        const fetchDataOnMount = async () => {
            try {
                // You can run these in parallel using Promise.all
                await Promise.all([
                    fetchAlertStatusUsers(),
                    fetchAlerts(),
                    fetchDependents(),
                    fetchCameraRooms(),
                    fetchUsers(),
                    fetchRoles(),
                ]);
            } catch (error) {
                console.error('Error fetching data on mount:', error);
            } finally {
                setLoading(false); // Set loading to false when all fetches are complete
            }
        };

        fetchDataOnMount();

        // get the user from the asyncstorage
        AsyncStorage.getItem('currentUser')
            .then((user) => {
                // set this user as the current user
                setCurrentUser(JSON.parse(user));
            })
            .catch(error => console.error('Error getting user data:', error));
    }, []);


    function handleAlertPress() {
        navigation.navigate('Alerts');
    }

    return (
        <>
            {loading ? (
                <LoadingComponent /> // Use the LoadingComponent here
            ) : (
                <View style={style.containerColumn}>
                    <View style={style.box}>
                        <UserCard user={currentUser} customText={'Hi,'} />
                        <AlertIcon onPress={handleAlertPress}/>
                    </View>
                    <Text style={style.h1}>Let's start facilitating lives</Text>
                    <DependentList navigation={navigation} />
                </View>
            )}
        </>
    );
}