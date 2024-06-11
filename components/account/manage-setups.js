import React from 'react';
import { Text, StyleSheet, View, Pressable, FlatList } from 'react-native';
import { useRecoilState } from 'recoil';
import { cameraRoomState } from '../../store';
import { FontAwesome5 } from '@expo/vector-icons';
import { ScaledSheet } from 'react-native-size-matters';

export default function ManageSetups({ route, navigation }) {
    const [cameraRoom, setCameraRoom] = useRecoilState(cameraRoomState);
    const { dependent } = route.params;

    // get only the cameraRooms that are assigned to the dependent
    const filteredCameraRooms = cameraRoom.filter((cameraRoom) => cameraRoom.dependentId === dependent.id);

    const editCameraRoom = (cameraRoomId) => {
        navigation.navigate('CameraRoomCrud', { cameraRoomId, dependent, isEditing: true });
      };
    
      const addRoom = () => {
        navigation.navigate('CameraRoomCrud', { dependent, isEditing: false });
      };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage Setups for {dependent.firstName} {dependent.lastName}</Text>
            <FlatList
                data={filteredCameraRooms}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardContent}>
                            <Text style={styles.cardText}>{item.name}</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Pressable style={styles.iconButton} onPress={() => editCameraRoom(item.id)}>
                                <FontAwesome5 name="pencil-alt" size={24} color="#3498db" />
                            </Pressable>
                        </View>
                    </View>
                )}
            />
            <View style={styles.addButtonContainer}>
                <Pressable style={styles.addButton} onPress={addRoom}>
                    <Text style={styles.addButtonText}>Add Room</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: 'white',
        justifyContent: 'space-between',
    },
    title: {
        textAlign: 'center',
        fontSize: '20@ms0.1',
        fontWeight: 'bold',
        marginBottom: 16,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 16,
        paddingTop: 24,
        paddingBottom: 24,
        marginBottom: 16,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
        marginStart: 'auto',
        marginEnd: 'auto',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    cardContent: {
        flex: 1,
    },
    cardText: {
        fontSize: '16@ms0.1',
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 16,
    },
    addButtonContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    addButton: {
        backgroundColor: '#3498db',
        padding: 16,
        paddingStart: 50,
        paddingEnd: 50,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: '16@ms0.1',
        fontWeight: 'bold',
    },
});