import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRecoilState } from 'recoil';
import { styleState } from '../../store';
import { ScaledSheet } from 'react-native-size-matters';

import UserCard from './user-card';
import Separator from '../layout/seperator';

export default function DependentDetails({ navigation, route }) {
    const [style, setStyle] = useRecoilState(styleState);
    const { dependent } = route.params;

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

    return (
        <View style={[style.containerColumnSpaceBetween, styles.custom]}>
            <View>
                <UserCard user={dependent} customText={'Dependent'} />
                <Separator />
                <Text style={styles.textStyling}><Ionicons name="mail" size={styles.mailIcon.size} color="black" /> {dependent.email}</Text>
                <Text style={styles.textStyling}><FontAwesome5 name="phone-alt" size={styles.phoneIcon.size} color="black" /> {dependent.phoneNumber}</Text>
                <Text style={styles.textStyling}><FontAwesome5 name="map-marked-alt" size={styles.mapIcon.size} color="black" /> {dependent.address}</Text>
                <Text style={styles.textStyling}><Ionicons name="person" size={styles.personIcon.size} color="black" /> {calculateAge(dependent.birthDate)}</Text>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    custom: {
        height: '100%',
        alignItems: 'center',
    },
    mailIcon: {
        size: '24@ms0.2',
    },
    phoneIcon: {
        size: '20@ms0.2',
    },
    mapIcon: {
        size: '20@ms0.2',
    },
    personIcon: {
        size: '24@ms0.2',
    },
    textStyling: {
        fontSize: '14@ms0.3',
    },
});