import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRecoilState, useRecoilValue } from 'recoil';
import { usersState, roleState, dependentsState } from '../../store';
import { putData, postData, fetchData } from '../../api/api';
import DateTimePicker from 'react-native-ui-datepicker';

const ManageUsers = ({ route, navigation }) => {
  const { user } = route.params;
  const isEditing = user !== undefined;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [roleId, setRoleId] = useState('');
  const [dependentId, setDependentId] = useState(null);

  const [users, setUsers] = useRecoilState(usersState);
  const [roles, setRoles] = useRecoilState(roleState);
  const dependents = useRecoilValue(dependentsState);

  useEffect(() => {
    // Load existing user data if editing
    if (isEditing) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setBirthDate(user.birthDate);
      setPhoneNumber(user.phoneNumber);
      setEmail(user.email);
      setAddress(user.address);
      setRoleId(user.roleId);
      setDependentId(user.dependentId);
    }
  }, [isEditing, user]);

  const handleSubmit = async () => {
    // Validate form data if needed

    // Prepare data object
    const userData = {
      firstName,
      lastName,
      birthDate,
      phoneNumber,
      email,
      address,
      roleId,
      dependentId,
    };

    // Handle submitting data based on isEditing
    if (isEditing) {
      try {
        // Implement logic to update existing user using userData
        const updatedUser = await putData(`user/${user.id}`, userData);

        // Update the local state with the updated user
        setUsers((prevUsers) => prevUsers.map((item) => (item.id === user.id ? updatedUser : item)));
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        // Implement logic to create a new user using userData
        await postData('user', userData);

        const newUsers = await fetchData('user');

        // Update the local state with the new user
        setUsers(newUsers);
      } catch (error) {
        console.log(error);
      }
    }

    // Navigate back to the previous page
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>
            {isEditing ? `Manage ${user.firstName} ${user.lastName}` : 'Add a new user'}
        </Text>
        <Text style={styles.label}>First Name:</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
          placeholder="Enter first name"
        />

        <Text style={styles.label}>Last Name:</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={(text) => setLastName(text)}
          placeholder="Enter last name"
        />

        <Text style={styles.label}>Birth Date:</Text>
        <View style={{ alignItems: 'flex-start', width: '100%' }}>
        </View>
        <View style={styles.containerDatePicker}>
          <DateTimePicker
            mode="single"
            date={birthDate ? new Date(birthDate) : new Date()}
            onChange={(selectedDate) => {
              if (selectedDate.date) {
                const adjustedDate = new Date(selectedDate.date);
                
                // Manually adjust the day
                adjustedDate.setDate(adjustedDate.getDate() + 1);
        
                // Format the date string
                const formattedDate = adjustedDate.toISOString().slice(0, 10);
        
                setBirthDate(formattedDate);
              }
            }}
          />
        </View>
          
        



        <Text style={styles.label}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
          placeholder="Enter phone number"
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(text) => setEmail(text)}
          placeholder="Enter email"
        />

        <Text style={styles.label}>Address:</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={(text) => setAddress(text)}
          placeholder="Enter address"
        />

        <Text style={styles.label}>Role:</Text>
        <Picker
            selectedValue={roleId}
            style={styles.inputPicker}
            onValueChange={(itemValue) => setRoleId(itemValue)}>
            <Picker.Item label="Select Role" value="" />
            {roles.map((role) => (
                <Picker.Item key={role.id} label={role.name} value={role.id} />
            ))}
        </Picker>

        {roleId == 2 && (
            <View>
                <Text style={styles.label}>Dependent:</Text>
                <Picker
                selectedValue={dependentId}
                style={styles.inputPicker}
                onValueChange={(itemValue) => setDependentId(itemValue)}>
                <Picker.Item label="Select Dependent" value="" />
                {dependents.map((dependent) => (
                    <Picker.Item key={dependent.id} label={dependent.firstName + " " + dependent.lastName} value={dependent.id} />
                ))}
                </Picker>
            </View>
        )}
      </ScrollView>

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>{isEditing ? 'Update' : 'Create'}</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  containerDatePicker: {
    flex: 1,
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
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
  inputPicker: {
    borderWidth: 0.5,
    borderColor: 'gray',
    paddingHorizontal: 10,
    marginBottom: 16,
    padding: 10
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
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
  datePicker: {
    width: 'auto',
    marginBottom: 16,
   },
});

export default ManageUsers;