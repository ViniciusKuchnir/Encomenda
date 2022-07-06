import React, { useState, useEffect } from "react";
import { Text, View,TextInput, TouchableOpacity, KeyboardAvoidingView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {css} from '../../assets/css/Css';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import MenuAreaRestrita from '../../assets/components/MenuAreaRestrita';
import config from '../../config/config.json';

export default function Profile({navigation}) {

  const [idUser, setIdUser] = useState(null);
  const [senhaAntiga, setSenhaAntiga] = useState(null);
  const [novaSenha, setNovaSenha] = useState(null);
  const [confNovaSenha, setConfNovaSenha] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    async function getIdUser(){
      let response = await AsyncStorage.getItem('userData');
      let json = JSON.parse(response);
      setIdUser(json.id);
    }
    getIdUser();
  }, []);

  async function sendForm(){
    let response = await fetch(`${config.urlRoot}verifyPass`,{
      method: 'POST',
      body: JSON.stringify({
        id: idUser,
        senhaAntiga: senhaAntiga,
        novaSenha: novaSenha,
        confNovaSenha: confNovaSenha
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      }
    });
    let json = await response.json();
    setMsg(json);
  }
  
  return (
    <View style={[css.container, css.containerTop]}>
      <MenuAreaRestrita title='Perfil' navigation={navigation} />
      <View style={css.container}>
        <Icon name='account-edit' size={100} />
        <Text style={css.edit__msg}>{msg}</Text>
        <TextInput style={css.edit__input} placeholder='Senha Antiga ' onChangeText={text => setSenhaAntiga(text)} />
        <TextInput style={css.edit__input} placeholder='Nova Senha ' onChangeText={text => setNovaSenha(text)} />
        <TextInput style={css.edit__input} placeholder='Confirmação da Nova Senha ' onChangeText={text => setConfNovaSenha(text)} />
        <TouchableOpacity style={css.login__button} onPress={()=> sendForm()}>
          <Text style={css.login__buttonText} >Trocar</Text>
        </TouchableOpacity>
      </View>
    </View>
    
  );
}
