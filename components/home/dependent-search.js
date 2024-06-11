import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { dependentsState, styleState, currentUserState, usersState } from '../../store';
import { View, ScrollView, TextInput, Text, Pressable } from 'react-native';
import DependentCard from '../misc/dependent-card';
import { ScaledSheet } from 'react-native-size-matters';
import { heightPercentageToDP } from 'react-native-responsive-screen';
// use navigation
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LoadingComponent from '../misc/loading-component';
// import the api
import { fetchData } from '../../api/api';

export default function DependentSearch({ isInsight = false, isManageSetups = false, isManageUsers = false}) {
    const [dependents, setDependents] = useRecoilState(dependentsState);
    const [users, setUsers] = useRecoilState(usersState);
    const [style, setStyle] = useRecoilState(styleState);
    const [search, setSearch] = useState('');
    let filteredDependents = [];
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
    const [loading, setLoading] = useState(true); // Add loading state
    const navigation = useNavigation();
    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        const fetchDependents = async () => {
            try {
                const data = await fetchData('user');
                console.log(data);
                // filter the data to only get the dependents on roleId = 1
                const filteredData = data.filter((user) => user.roleId === 1);

                if (currentUser.roleId === 1) {
                    const filtered = data.filter((dependent) => dependent.id === currentUser.id);
                    console.log("Role 1, filtered: ", filtered);
                    filteredDependents = filtered;
                } else if (currentUser.roleId === 2) {
                    const filtered = data.filter((dependent) => dependent.id === currentUser.dependentId);
                    filteredDependents = filtered;
                } else {
                    filteredDependents = filteredData;
                }

                if (isManageUsers) {
                    setFilteredData(users);
                } else {
                    setFilteredData(filteredDependents);
                }
                console.log('filteredData', filteredData);

                setLoading(false); // Set loading to false after initial render
            } catch (error) {
                // Handle errors (e.g., network issues, server errors)
                console.log(error);
            }
        };

        fetchDependents();
    }, []);

    function searchDependents(text) {
        setSearch(text);
        if(isManageUsers) {
            const filtered = users.filter((user) => {
                // filter on firstName and lastName
                const name = `${user.firstName} ${user.lastName}`;
                return name.toLowerCase().includes(text.toLowerCase());
            });
            setFilteredData(filtered);
        } else {
            const filtered = dependents.filter((dependent) => {
                // filter on firstName and lastName
                const name = `${dependent.firstName} ${dependent.lastName}`;
                return name.toLowerCase().includes(text.toLowerCase());
            });
            setFilteredData(filtered);
        }
    }

    function onPress(item) {
        if (isInsight) {
          navigation.navigate('Insight', { dependent: item });
        } 
        else if (isManageSetups) {
          navigation.navigate('ManageSetups', { dependent: item });
        } 
        else if (isManageUsers) {
          navigation.navigate('ManageUsers', { user: item });
        } 
        else {
          navigation.navigate('Dependent', { dependent: item });
        }
      }

    function handleCreateUser() {
        navigation.navigate('ManageUsers', { isEditing: false });
    }

    // create a style
    const styles = ScaledSheet.create({
        scrollView: {
            maxHeight: isManageUsers ? '75%' : '100%',
            marginBottom: isManageUsers ? '16@ms' : '0@ms',
        },
        addButtonContainer: {
            alignItems: 'center',
            marginBottom: '16@ms',
        },
        addButton: {
            backgroundColor: '#3498db',
            padding: '16@ms',
            paddingStart: '50@ms',
            paddingEnd: '50@ms',
            borderRadius: '8@ms',
        },
        addButtonText: {
            color: 'white',
            fontSize: '16@ms0.3',
            fontWeight: 'bold',
        },
    });

    return (
        <View style={style.containerColumnSpaceBetween}>
            {loading && <LoadingComponent />}
            <TextInput
                style={style.input}
                onChangeText={searchDependents}
                value={search}
                placeholder={`Search ${isManageUsers ? 'users' : 'dependents'}`}
            />
            <ScrollView style={styles.scrollView}>
                {filteredData.map((item) => (
                <View key={item.id}>
                    <DependentCard dependent={item} isManageUsers={isManageUsers} onPress={() => onPress(item)} />
                </View>
                ))}
            </ScrollView>
            {isManageUsers && (
                <View style={styles.addButtonContainer}>
                    <Pressable style={styles.addButton} onPress={handleCreateUser}>
                        <Text style={styles.addButtonText}>Create User</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}
