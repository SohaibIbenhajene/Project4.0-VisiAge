import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useRecoilState } from 'recoil';
import { currentUserState, styleState } from '../../store';
import { useNavigation } from '@react-navigation/native';
import { ScaledSheet } from 'react-native-size-matters';

export default function AccountScreen({ handleLogout }) {
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
    const [style, setStyle] = useRecoilState(styleState);
    const navigation = useNavigation();

    function manageSetups() {
        navigation.navigate('InsightDependentSearch');
    }

    function manageUsers() {
        navigation.navigate('UserSearch');
    }


    return (
        <View style={[style.containerColumnSpaceBetween, styles.custom]}>
            <Text style={[styles.h3, styles.center]}>Welcome to the account screen! {currentUser.firstName}</Text>
            {currentUser.roleId === 4 && 
                (<>
                    <Pressable style={style.button} onPress={() => manageSetups()}>
                        <Text style={style.buttonText}>Manage setups</Text>
                    </Pressable>
                    <Pressable style={style.button} onPress={() => manageUsers()}>
                        <Text style={style.buttonText}>Manage users</Text>
                    </Pressable>
                </>)
            }
            <Pressable style={style.button} onPress={() => handleLogout()}>
                <Text style={style.buttonText}>Logout</Text>
            </Pressable>
        </View>
    );
}

const styles = ScaledSheet.create({
    center: {
        textAlign: 'center',
    },
    custom: {
        height: '100%',
        alignItems: 'center',
    },
    h3: {
        fontSize: '25@ms0.3',
        fontWeight: 'bold',
    }
});