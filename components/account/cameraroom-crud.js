import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRecoilState } from 'recoil';
import { cameraRoomState } from '../../store';
import { putData, postData, fetchData } from '../../api/api';

const CameraRoomCrud = ({ route, navigation }) => {
  const { cameraRoomId, dependent } = route.params;
  const isEditing = cameraRoomId !== undefined;

  const [name, setName] = useState('');
  const [cameraId, setCameraId] = useState('');
  const [microphoneId, setMicrophoneId] = useState('');
  const [cameraRoom, setCameraRoom] = useRecoilState(cameraRoomState);

  useEffect(() => {
    // Load existing camera room data if editing
    if (isEditing) {
      // Get the cameraRoom data from the cameraRoomState based on the cameraRoomId
        const existingCameraRoomData = cameraRoom.find((cameraRoom) => cameraRoom.id === cameraRoomId);

        setName(existingCameraRoomData.name);
        setCameraId(existingCameraRoomData.cameraId);
        setMicrophoneId(existingCameraRoomData.microphoneId);
    }
  }, [isEditing, cameraRoomId]);

  const handleSubmit = async () => {
    // Validate form data if needed

    // Prepare data object
    const cameraRoomData = {
      name: name,
      dependentId: dependent.id,
      cameraId: cameraId,
      microphoneId: microphoneId,
    };

    // Handle submitting data based on isEditing
    if (isEditing) {
      try {
        // Implement logic to update existing CameraRoom using cameraRoomData
        const updatedCameraRoom = await putData(`cameraroom/${cameraRoomId}`, cameraRoomData);

        // Update the local state with the updated camera room
        setCameraRoom((prevCameraRoom) =>
          prevCameraRoom.map((item) => (item.id === cameraRoomId ? updatedCameraRoom : item))
        );
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        // Implement logic to create a new CameraRoom using cameraRoomData
        const newCameraRoom = await postData('cameraroom', cameraRoomData);

        // Update the local state with the new camera room
        setCameraRoom((prevCameraRoom) => [...prevCameraRoom, newCameraRoom]);
      } catch (error) {
        console.log(error);
      }
    }

    // Navigate back to ManageSetups page
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={(text) => setName(text)}
        placeholder="Enter name"
      />

      <Text style={styles.label}>Camera ID:</Text>
      <TextInput
        style={styles.input}
        value={cameraId}
        onChangeText={(text) => setCameraId(text)}
        placeholder="Enter camera ID"
      />

      <Text style={styles.label}>Microphone ID:</Text>
      <TextInput
        style={styles.input}
        value={microphoneId}
        onChangeText={(text) => setMicrophoneId(text)}
        placeholder="Enter microphone ID"
      />

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Create'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    padding: 8,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CameraRoomCrud;