import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useRecoilState } from 'recoil';
import { alertsState, styleState } from '../../store';
import { useTheme } from '@rneui/themed';
import { ScaledSheet } from 'react-native-size-matters';

export default function AlertIcon({ onPress }) {
    const [alerts, setAlerts] = useRecoilState(alertsState);
    const [style, setStyle] = useRecoilState(styleState);
    const { theme } = useTheme();
    let isEmergency = false;

    function getAlertCount() {
        // count all the alerts that are of status waiting and escalated
        let count = 0;
        for (let i = 0; i < alerts.length; i++) {
            if (alerts[i].alertStatus.alertStatusTypeId === 2 || alerts[i].alertStatus.alertStatusTypeId === 3) {
                count++;
            }
        }
        return count;
    }

    return (
        <Pressable style={style.containerRow} onPress={onPress}>
            <Text style={styles.text}>{getAlertCount()}</Text>
            {isEmergency ? <Ionicons name="notifications-outline" size={styles.icon.size} color={theme.danger} /> : <Ionicons name="notifications-outline" size={styles.icon.size} color="black" />}
        </Pressable>
    );
}

const styles = ScaledSheet.create({
    icon: {
      size: '24@ms',
    },
    text: {
        fontSize: '13@ms',
    }
});