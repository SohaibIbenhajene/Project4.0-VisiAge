import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@rneui/themed';
import { useRecoilState } from 'recoil';
import { styleState } from '../../store';
import { ScaledSheet } from 'react-native-size-matters';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function DependentCard({ dependent, onPress, isManageUsers = false }) {
    const [style, setStyle] = useRecoilState(styleState);
    const { theme } = useTheme();
    const navigation = useNavigation();

    // calculate the age of the dependent from the birthdate string
    function calculateAge(birthDate) {
        const today = new Date();
        const birthDateArray = birthDate.split('-');
        const birthYear = birthDateArray[0];
        const birthMonth = birthDateArray[1];
        const birthDay = birthDateArray[2];
        let age = today.getFullYear() - birthYear;
        const m = today.getMonth() - birthMonth;
        if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
            age--;
        }
        return age;
    }

    const styles = ScaledSheet.create({
        containerRow: {
            justifyContent: 'flex-start',
            backgroundColor: theme.light,
            borderRadius: '20@ms',
            marginBottom: '10@ms',
            alignItems: 'center',
        },
        custom: {
            height: '75@vs',
        },
        editButton: {
            position: 'absolute',
            top: '8@ms',
            right: '8@ms',
            padding: '8@ms',
        },
        icon: {
            size: '80@ms',
        },
        pencil: {
            size: '24@ms',
        },
        phone: {
            size: '13@ms',
        },
        dependentName: {
            fontSize: '18@ms',
        },
        ageTextStyle: {
            fontSize: '14@ms0.2',
        },
        phoneTextStyle: {
            fontSize: '14@ms0.2',
        },
    });

    return (
        <>
            {isManageUsers ? (
                <View style={[style.containerRow, styles.containerRow]}>
                    <Ionicons name="person-circle-outline" size={styles.icon.size} color="black" />
                    <View style={[style.containerColumnSpaceBetween, styles.custom]}>
                        <View>
                            <Text style={[style.bold, styles.dependentName]}>{dependent.firstName} {dependent.lastName}</Text>
                            <Text style={styles.ageTextStyle}>Age: {calculateAge(dependent.birthDate)}</Text>
                            {isManageUsers && <Text>Role: {dependent.role.name}</Text>}
                        </View>
                        <Text style={styles.phoneTextStyle}><FontAwesome5 name="phone-alt" size={styles.phone.size} color="black" /> {dependent.phoneNumber}</Text>
                    </View>
                    <Pressable style={styles.editButton} onPress={() => navigation.navigate('ManageUsers', { user: dependent, isEditing: true })}>
                            <FontAwesome5 name="pencil-alt" size={styles.pencil.size} color="#3498db" />
                    </Pressable>
                </View>
            ) : (
                <Pressable style={[style.containerRow, styles.containerRow]} onPress={() => onPress(dependent)}>
                    <Ionicons name="person-circle-outline" size={styles.icon.size} color="black" />
                    <View style={[style.containerColumnSpaceBetween, styles.custom]}>
                        <View>
                            <Text style={[style.bold, styles.dependentName]}>{dependent.firstName} {dependent.lastName}</Text>
                            <Text style={styles.ageTextStyle}>Age: {calculateAge(dependent.birthDate)}</Text>
                            {isManageUsers && <Text>Role: {dependent.role.name}</Text>}
                        </View>
                        <Text style={styles.phoneTextStyle}><FontAwesome5 name="phone-alt" size={styles.phone.size} color="black" /> {dependent.phoneNumber}</Text>
                    </View>
                </Pressable>
            )}
        </>
    );
}