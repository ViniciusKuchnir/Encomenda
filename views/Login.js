import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
  View,
  Text,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { css } from "../assets/css/Css";
import config from '../config/config.json';

export default function Login({navigation}) {
  const [display, setDisplay] = useState("none");
  const [user, setUser] = useState(null);
  const [password, setPassword] = useState(null);
  const [login, setLogin] = useState(false);


  useEffect(()=>{
    verifyLogin();
  }, []);

  useEffect(()=>{
    if(login === true){
       biometric();
    }
  }, [login])

  
  //Verifica se usuário já possui algum login
  async function verifyLogin(){
    let response=await AsyncStorage.getItem('userData');
    let json=await JSON.parse(response);
    if(json !== null){
        setUser(json.name);
        setPassword(json.password);
        setLogin(true);
    }
  }

  //Biometria
  async function biometric(){
    let compatible = await LocalAuthentication.hasHardwareAsync();
    if (compatible) {
      let biometricRecords = await LocalAuthentication.isEnrolledAsync();
      if (!biometricRecords) {
        alert('Biometria não cadastrada');
      }else{
        let result = await LocalAuthentication.authenticateAsync();
        if(result.success){
          sendForm();
        }else{
          setUser(null);
          setPassword(null); 
        }
      }
    }
  }

  //Envio do formulário de login
  async function sendForm() {
    let response = await fetch(`${config.urlRoot}login`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: user,
        password: password,
      }),
    });
    let json = await response.json();
    if(json == 'error'){
      setDisplay('flex');
      setTimeout(() => {
        setDisplay('none');
      }, 3000);
      await AsyncStorage.clear();
    }else{
      await AsyncStorage.setItem('userData', JSON.stringify(json));
      navigation.navigate('AreaRestrita')
    }
    
  }

  return (
    <KeyboardAvoidingView
      style={[css.container, css.darkbg]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={css.login__logomarca}>
        <Image source={require("../assets/img/Logomarca.png")} />
      </View>
      <View>
        <Text style={css.login__msg(display)}>Usuário ou senha inválidos</Text>
      </View>
      <View style={css.login__form}>
        <TextInput
          style={css.login__input}
          placeholder="Usuário:"
          onChangeText={(text) => setUser(text)}
        />
        <TextInput
          style={css.login__input}
          placeholder="Senha:"
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={true}
        />
        <TouchableOpacity
          style={css.login__button}
          onPress={() => sendForm()}
        >
          <Text style={css.login__buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
