import React, {useState, useEffect} from 'react'
import {Text, View, Button, Alert, PermissionsAndroid, Platform } from 'react-native';
import * as Device from 'expo-device';
import {css} from './assets/css/Css'; 
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {Home, Login, Rastreio} from './views';
import AreaRestrita from './views/arearestrita/AreaRestrita';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import config from './config/config.json';

export default function App() {

  const Stack = createNativeStackNavigator();
  const [expoPushToken, setExpoPushToken] = useState(null);
  const [notification, setNotification] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if(expoPushToken !== null){
      sendToken();
    }
  }, [expoPushToken]);

  //Registra o Token do usuário
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
      token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  //Envio Token
  async function sendToken(){
    let response = await fetch(`${config.urlRoot}token`,{
      method: 'POST',
      headers: {
        Accept:'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: expoPushToken
      })
    })
  
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={Home}
          options={{
              title: "VK Transportes",
              headerStyle: {backgroundColor: '#EC6433'},
              headerTintColor: '#333',
              headerTitleAlign: 'center',
              headerTitleStyle: {fontWeight:'bold'},
          }} 
        />
        <Stack.Screen name="Login" options={{headerShown: false}} component={Login} />
        <Stack.Screen name="Rastreio" component={Rastreio} />
        <Stack.Screen name="AreaRestrita" options={{headerShown: false}} component={AreaRestrita} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

