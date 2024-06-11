import { StyleSheet, Text, View, Pressable } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@rneui/themed';
import { useRecoilState } from 'recoil';
import { dependentsState, styleState } from '../../store';
import { ScaledSheet } from 'react-native-size-matters';

export default function AlertCard({ alert, onPress }) {
    const { theme } = useTheme();
    const [dependents, setDependents] = useRecoilState(dependentsState);
    const [style, setStyle] = useRecoilState(styleState);

    function getDependentName(id) {
        for (let i = 0; i < dependents.length; i++) {
            if (dependents[i].id === id) {
                return dependents[i].firstName + ' ' + dependents[i].lastName;
            }
        }
    }

    // get time from timestamp
    function getTime(timestamp) {
        const date = new Date(timestamp);
        // get the time with format hh:mm with a 24 hour clock
        let time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        // get the date with format dd/mm/yyyy
        // check how long ago the alert was created and return teh difference, e.g. 2 hours ago
        const diff = Math.abs(new Date() - date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (minutes < 60) {
            return minutes + ' minutes ago';
        } else if (hours < 24) {
            return hours + ' hours ago';
        } else {
            return days + ' days ago';
        }
    }

    return (
        <Pressable style={style.containerRowSpaceBetween} onPress={() => onPress(alert)}>
            <View style={style.containerRow}>
                <View style={styles.circle}>
                    {alert.incidentType.name === 'Fall' ? <FontAwesome5 name="user-injured" size={styles.standardIcon.size} color="black" /> : <FontAwesome5 name="exclamation-circle" size={styles.standardIcon.size} color="black" />}
                    
                </View>
                <View style={style.box}>
                    <View style={style.containerColumn}>
                        <Text style={style.bold}>{alert.incidentType.name} {alert.incidentTypeId === 1 ? 'detected' : ''}</Text>
                        <Text>{getDependentName(alert.dependentId)}</Text>
                    </View>
                </View>
            </View>
            <View style={[style.containerColumn, styles.custom]}>
                <Text style={[style.grey, styles.textAgo]}>{getTime(alert.timeStamp)}</Text>
                {alert.alertStatus.alertStatusTypeId === 4 ? <FontAwesome5 name="ambulance" size={styles.alertIcon.size} color={theme.danger} /> : 
                    alert.alertStatus.alertStatusTypeId === 3 ? <Ionicons name="warning-outline" size={styles.alertIcon.size} color={theme.danger} /> :
                    alert.alertStatus.alertStatusTypeId === 2 ? <FontAwesome5 name="clock" size={styles.alertIcon.size} color={theme.warning} /> :
                    alert.alertStatus.alertStatusTypeId === 5 ? <FontAwesome5 name="user-shield" size={styles.alertIcon.size} color={theme.success} /> :
                    <Ionicons name="checkmark-circle-outline" size={styles.alertIcon.size} color={theme.success} />
                }
            </View>
        </Pressable>
    );
}

const styles = ScaledSheet.create({
    circle: {
        width: '70@ms0.3',
        aspectRatio: 1,
        borderRadius: '35@ms0.3',
        backgroundColor: 'lightgray',
        justifyContent: 'center',
        alignItems: 'center',
    },
    custom: {
        alignItems: 'flex-end',
        gap: 3,
    },
    alertIcon: {
        size: '24@ms0.3'
    },
    standardIcon:{
        size: '30@ms0.3'
    },
    textAgo: {
        fontSize: '12@ms0.3',
    },
});