import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RecoilRoot } from 'recoil';
import { Ionicons } from "@expo/vector-icons";
import { createTheme, ThemeProvider } from '@rneui/themed';
import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';

// get the api file
import { fetchData, putData } from './api/api';

import WelcomeScreen from './components/welcome/welcome-screen';
import LoginScreen from './components/login/login-screen';
import HomeScreen from './components/home/home-screen';
import AccountScreen from './components/account/account-screen';
import DependentDetails from './components/home/dependent-details';
import AlertScreen from './components/alert/alert-screen';
import DependentSearch from './components/home/dependent-search';
import AlertDetails from './components/alert/alert-details';
import AlertInsert from './components/alert/alert-insert';
import InsightDetails from './components/insight/insight-details';
import AlertMessage from './components/alert/alert-message';
import ManageSetups from './components/account/manage-setups';
import CameraRoomCrud from './components/account/cameraroom-crud';
import ManageUsers from './components/account/manage-users';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const AlertStack = createNativeStackNavigator();
const InsightStack = createNativeStackNavigator();
const AccountStack = createNativeStackNavigator();

const navigationRef = React.createRef();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token.data;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState({email: ""});
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  const notificationListener = useRef();
  const responseListener = useRef();

  const theme = createTheme({
    black: '#060C0F',
    white: '#FAFDFE',
    primary: '#50CFF9',
    secondary: '#619DB1',
    tertiary: '#78D2F0',
    fourth: '#44D8E5',
    fifth: '#507BF9',
    warning: '#FFD233',
    success: '#0FA958',
    danger: '#E51515',
    light: '#D4F5FF',
    background: '#FAFDFE',
  });

  registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

  useEffect(() => {
    // Function to load user data from AsyncStorage
    const loadUserData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('currentUser');
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    const initializeApp = async () => {
      try {
        await loadUserData();
        // Other initialization tasks can be added here if needed
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        // Set loading to false once the initial data loading is complete
        setLoading(false);
      }
    };

    // Load user data when the app starts
    if (!currentUser.email) {
      initializeApp();
    }

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async response => {
      // Access navigationRef.current here and perform navigation actions
      if (response.notification.request.content.data) {
        const alertId = response.notification.request.content.data.alertId;
        if (alertId && navigationRef.current) {
          // get the alert from the database
          let alert = await fetchData('alert/' + alertId);
          navigationRef.current.navigate('Alerts', { screen: 'AlertDetails', params: { alert: alert } });
          return;
        }
      }

      // If no specific data is present, navigate to the homepage
      navigationRef.current.navigate('Home');
    });


    // Save user data to AsyncStorage whenever it changes
    if (currentUser.email !== "") {
      AsyncStorage.setItem('currentUser', JSON.stringify(currentUser))
        .catch(error => console.error('Error saving user data:', error));
    }

    // Clean up the event listeners when the component unmounts
    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [currentUser]);

  const handleNotificationSendToConfidents = async (message, dependentId) => {
    try {
      // get all the confidents of the dependent, by looking at the dependentId in each user
      const users = await fetchData('user');

      // filter the users to only get the users with the dependentId
      const usersWithDependent = users.filter((user) => user.dependentId === dependentId);
      // filter the users to only get the users with the roleId 3
      const caregivers = users.filter((user) => user.roleId === 3);

      // merge the caregivers with the usersWithDependent
      usersWithDependent.push(...caregivers);

      // Create an array to hold all the fetch promises
      const notificationPromises = [];

      for (const user of usersWithDependent) {
        // set the to field to the expoPushToken
        message.to = user.expoPushToken; // Assuming the expoPushToken is a property of the user object

        // Push each fetch promise into the array
        notificationPromises.push(
          fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          })
        );
      }

      // Execute all the fetch promises in parallel
      const responses = await Promise.all(notificationPromises);

      // Check the responses
      responses.forEach(async (response) => {
        const responseJson = await response.json(); // Parse JSON response

        if (response.ok) {
        } else {
          console.error("Failed to send notification. HTTP status:", response.status);
          console.error("Error details:", responseJson);
        }
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };


  function handleLogin(user) {
    // add the expoPushToken to the user
    user.expoPushToken = expoPushToken;
    // update the user in the database
    putData('user/' + user.id, user)
      .then((response) => {
        // update the state
        setCurrentUser(response);
      })
      .catch((error) => {
        console.log(error);
      });
    // save the currentUser to the AsyncStorage
    AsyncStorage.setItem('currentUser', JSON.stringify(user))
      .catch(error => console.error('Error saving user data:', error));
  }

  function handleLogout() {
    // Clear the user data from AsyncStorage when logged out
    AsyncStorage.removeItem('currentUser')
      .catch(error => console.error('Error clearing user data:', error));

    setCurrentUser({ email: "" });
  }

  const styles = ScaledSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.white, // Customize the background color if needed
    },
    bottomNavIcon: {
      size: '30@ms0.3',
    },
    tabBarStyle: {
        display: 'row',
        height: '90@ms0.3',
        paddingVertical: '17@ms0.6',
    },
    tabIconStyling: {
      flexDirection: 'column',
      height: '50@ms0.3',
    },
    tabLabelStyling: {
      fontSize: '11@ms0.3',
    }
  });

  function HomeScreenStack() {
    return (
      <HomeStack.Navigator initialRouteName='Homepage' screenOptions={{contentStyle: {backgroundColor: theme.background, }}}>
        <HomeStack.Screen name="Homepage" options={{ title: 'Home' }} >
          {() => <HomeScreen />}
        </HomeStack.Screen>
        <HomeStack.Screen name="Dependent" component={DependentDetails} options={{ title: 'Details' }} />
        <HomeStack.Screen name="DependentSearch" options={{ title: 'Search' }} >
          {() => <DependentSearch isInsight={false} />}
        </HomeStack.Screen>
      </HomeStack.Navigator>
    );
  }

  function AccountScreenStack() {
    return (
      <AccountStack.Navigator initialRouteName='AccountStackScreen' screenOptions={{contentStyle: {backgroundColor: theme.background,}}}>
        <AccountStack.Screen name="AccountStackScreen" options={{ title: 'Account' }}>
          {() => <AccountScreen handleLogout={handleLogout} />}
        </AccountStack.Screen>
        <AccountStack.Screen name="InsightDependentSearch" options={{ title: 'Search' }}>
          {() => <DependentSearch isManageSetups={true} />}
        </AccountStack.Screen>
        <AccountStack.Screen name="UserSearch" options={{ title: 'Search' }}>
          {() => <DependentSearch isManageUsers={true} />}
        </AccountStack.Screen>
        <AccountStack.Screen name="ManageUsers" component={ManageUsers} options={{ title: 'Manage Users' }} />
        <AccountStack.Screen name="ManageSetups" component={ManageSetups} options={{ title: 'Manage Setups' }} />
        <AccountStack.Screen name="CameraRoomCrud" component={CameraRoomCrud} options={{ title: 'Camera Room' }} />
      </AccountStack.Navigator>
    );
  }

  function AlertScreenStack() {
    return (
      <AlertStack.Navigator screenOptions={{contentStyle: {backgroundColor: theme.background,}}}>
        <AlertStack.Screen name="Alertspage" component={AlertScreen} options={{ title: 'Alerts' }} />
        <AlertStack.Screen name="AlertDetails" component={AlertDetails} options={{ title: 'Alert Details' }} />
        <AlertStack.Screen name="AlertMessage" component={AlertMessage} options={{ title: 'Alert Message' }} />
        <AlertStack.Screen name="AlertInsert" options={{ title: 'Create Alert' }} >
          {() => <AlertInsert handleNotificationSendToConfidents={handleNotificationSendToConfidents} />}
        </AlertStack.Screen>
      </AlertStack.Navigator>
    );
  }

  function InsightScreenStack() {
    return (
      <InsightStack.Navigator screenOptions={{contentStyle: {backgroundColor: theme.background,}}}>
        <InsightStack.Screen name="Insightspage" options={{ title: 'Insights' }} >
          {() => <DependentSearch isInsight={true} />}
        </InsightStack.Screen>
        <InsightStack.Screen name="Insight" component={InsightDetails} options={{ title: 'Details' }} />
      </InsightStack.Navigator>
    )
  }

  return (
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        {/* Show loading screen when loading is true */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <NavigationContainer ref={navigationRef}>
            {currentUser.email != "" ? (
              <Tab.Navigator
                screenOptions={({ route }) => ({
                  tabBarIcon: ({ focused, color }) => {
                    let iconName;

                    switch (route.name) {
                      case "Home":
                        iconName = focused ? 'home-sharp' : 'home-outline';
                        break;
                      case "Account":
                        iconName = focused ? 'person-circle' : 'person-circle-outline';
                        break;
                      case "Alerts":
                        iconName = focused ? 'notifications' : 'notifications-outline';
                        break;
                      case "Insights":
                        iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                        break;
                    }

                    return <Ionicons name={iconName} size={styles.bottomNavIcon.size} style={styles.tabIconStyling} color={color} />;
                  },
                  tabBarStyle: styles.tabBarStyle,
                  tabBarItemStyle: styles.tabIconStyling,
                  tabBarLabelStyle: styles.tabLabelStyling,
                  tabBarLabelPosition: "below-icon",
                  tabBarActiveTintColor: theme.primary,
                  tabBarInactiveTintColor: "gray"
                })}
              >
                <Tab.Screen name="Home" component={HomeScreenStack} options={{ headerShown: false }} />
                <Tab.Screen name="Alerts" component={AlertScreenStack} options={{ headerShown: false }} />
                <Tab.Screen name="Insights" component={InsightScreenStack} options={{ headerShown: false }} />
                <Tab.Screen name="Account" component={AccountScreenStack} options={{ headerShown: false }} />
              </Tab.Navigator>
            ) : (
              <Stack.Navigator initialRootname="Welcome" screenOptions={{contentStyle: {backgroundColor: theme.background, }}}>
                <Stack.Screen
                  name="Welcome"
                  component={WelcomeScreen}
                  options={{
                    animationEnabled: false,
                    headerShown: false,
                  }}
                />
                <Stack.Screen name="Login" options={{ title: "" }} >
                  {() => <LoginScreen handleLogin={handleLogin} />}
                </Stack.Screen>
              </Stack.Navigator>
            )}
          </NavigationContainer>
        )}
      </ThemeProvider >
    </RecoilRoot>
  );
}