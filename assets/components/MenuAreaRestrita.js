import React from 'react';
import { Text, View, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {css} from '../css/Css';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function MenuAreaRestrita(props){
    
    async function logout(){
        await AsyncStorage.clear();
        props.navigation.navigate('Login')
    }

    return (
        <View style={css.area__menu}>
          <TouchableOpacity style={css.button__home2} onPress={()=>props.navigation.navigate('Home')} >
            <Icon name='home' size={20} color='#999' />
          </TouchableOpacity>
    
          <Text style={css.area__title}>{props.title}</Text>
    
          <TouchableOpacity style={css.button__logout} onPress={()=>logout()} >
            <Icon name='logout' size={20} color='#999' />
          </TouchableOpacity>
        </View>
      );
}