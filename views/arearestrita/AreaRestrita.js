import React, { useState, useEffect } from "react";
import { Text, View, Button, BackHandler, Alert } from "react-native";
import {css} from '../../assets/css/Css';
import Storage from "react-native-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {Profile, Cadastro, Edicao} from '../index';
import Icon from 'react-native-vector-icons/FontAwesome'; 


export default function AreaRestrita({navigation}) {
  const [user, setUser] = useState(null);

  const Tab = createBottomTabNavigator();

  useEffect(() => {
    async function getUser()
        {
            let response=await AsyncStorage.getItem('userData');
            let json=JSON.parse(response);
            setUser(json.name);
        } 
    getUser();
  }, []);

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Alerta!", "Deseja mesmo sair do App?", [
        {
          text: "Não",
          onPress: () => null,
          style: "cancel"
        },
        { 
          text: "Sim", 
          onPress: () => {
            navigation.navigate('Home');
            BackHandler.exitApp() 
          }
        }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <Tab.Navigator screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#999',
      tabBarInactiveTintColor: '#FFF',
      tabBarStyle: css.area__tab

    }}>
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        options={{
          tabBarIcon: ()=>(
            <Icon name='users' size={20} color='#999' />
          )
        }}  
      />
      <Tab.Screen 
        name="Cadastro" 
        component={Cadastro} 
        options={{
          tabBarIcon: ()=>(
            <Icon name='archive' size={20} color='#999' />
          )
        }}
      />
      <Tab.Screen 
        name="Edicao" 
        component={Edicao} 
        options={{
          tabBarIcon: ()=>(
            <Icon name='edit' size={20} color='#999' />
          )
        }}  
      />
    </Tab.Navigator>
  );
}
