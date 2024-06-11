import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRecoilState } from "recoil";
import { styleState } from "../../store";
import { ScaledSheet } from 'react-native-size-matters';

export default function UserCard({ user, customText }) {
    const [style, setStyle] = useRecoilState(styleState);

    return (
        <View style={style.containerRow}>
            <Ionicons name="person-circle-outline" size={styles.icon.size} color="black" />
            <View style={style.containerColumn}>
                <Text style={styles.customTextStyle}>{customText}</Text>
                <Text style={[style.bold, styles.nameTextStyle]}>{user.firstName} {user.lastName}</Text>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    icon: {
      size: '80@ms',
    },
    customTextStyle: {
        fontSize: '14@ms',
    },
    nameTextStyle: {
        fontSize: '20@ms',
    }
  });