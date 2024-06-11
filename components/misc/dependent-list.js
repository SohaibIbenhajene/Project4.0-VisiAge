import { FlatList, Text, View, Pressable } from 'react-native';
import { useEffect, useState } from 'react';
import DependentCard from './dependent-card';
import { useRecoilState } from 'recoil';
import { ScaledSheet } from 'react-native-size-matters';
import { dependentsState, styleState, currentUserState } from '../../store';

// get the api file
import { fetchData } from '../../api/api';

export default function DependentList({ navigation }) {
    const [dependents, setDependents] = useRecoilState(dependentsState);
    const [dependentList, setDependentList] = useState([]);
    const [style, setStyle] = useRecoilState(styleState);
    const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

    useEffect(() => {
        const fetchDependents = async () => {
            try {
                const data = await fetchData('user');
                // filter the data to only get the dependents on roleId = 1
                const filteredData = data.filter((user) => user.roleId === 1);
                // set the dependents to the filtered data
                setDependents(filteredData);
                // if the currentUser is a dependent, filter the data to only get the users with the dependentId from the currentUser and all the users with roleId = 3
                // if the currentUser is a confident, filter the data to only get the dependent with the dependentId from the currentUser
                // else, get all dependents
                if (currentUser.roleId === 1) {
                    const filteredConfidents = data.filter((dependent) => dependent.dependentId === currentUser.id);
                    const caregivers = data.filter((dependent) => dependent.roleId === 3);
                    // add both arrays together
                    const filtered = filteredConfidents.concat(caregivers);
                    console.log(filteredConfidents);
                    setDependentList(filtered);
                } else if (currentUser.roleId === 2) {
                    const filtered = filteredData.filter((dependent) => dependent.id === currentUser.dependentId);
                    setDependentList(filtered);
                } else {
                    setDependentList(filteredData);
                }
            } catch (error) {
                // Handle errors (e.g., network issues, server errors)
                console.log(error);
            }
        };

        fetchDependents();
    }, []);

    function onPress(dependent) {
        navigation.navigate('Dependent', { dependent: dependent });
    }

    function onPressSeeAll() {
        navigation.navigate('DependentSearch');
    }

    return (
        <View style={[style.container, styles.backgroundColor]}>
            <View style={style.containerRowSpaceBetween}>
                {currentUser.roleId === 1 && (<Text style={styles.dependentsText}>Your confidents & caregivers</Text>)}
                {currentUser.roleId === 2 && (<Text style={styles.dependentsText}>Your dependent</Text>)}
                {(currentUser.roleId === 3 || currentUser.roleId === 4) && (<Text style={styles.dependentsText}>Dependents</Text>)}
                {currentUser.roleId === 3 || currentUser.roleId === 4 ? (
                    <Pressable onPress={onPressSeeAll}>
                        <Text style={[style.grey, styles.dependentsText]}>See all</Text>
                    </Pressable>) : null
                }
            </View>
            <FlatList
                data={dependentList}
                renderItem={({ item }) => (
                    <DependentCard dependent={item} onPress={() => onPress(item)} />  
                )}
                keyExtractor={(item) => item.id.toString()}
            />
        </View>
    );
}

const styles = ScaledSheet.create({
    dependentsText: {
        fontSize: '14@ms',
    },
    backgroundColor: {
        backgroundColor: 'white',
    },
});