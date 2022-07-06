import React, { useState, useEffect } from "react";
import { Text, View, Button, TextInput, TouchableOpacity } from "react-native";
import Storage from "react-native-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuAreaRestrita from "../../assets/components/MenuAreaRestrita";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Location from 'expo-location';
import Geocoder from 'react-native-geocoding';
import { css } from "../../assets/css/Css";
import config from '../../config/config.json';

export default function Edicao({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [displayQR, setDisplayQR] = useState("flex");
  const [displayForm, setDisplayForm] = useState("none");
  const [code, setCode] = useState(null);
  const [product, setProduct] = useState(null);
  const [localization, setLocalization] = useState(null);
  const [response, setResponse] = useState(null);
  const [displayMsg, setDisplayMsg] = useState('none');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(()=>{
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
    })();
  }, [])

  //Leitura do código QR
  async function handleBarCodeScanned({ type, data }) {
    setScanned(true);
    setDisplayQR("none");
    setDisplayForm('flex');
    setCode(data)
    await getLocation();
    await searchProduct(data)
  }

  async function searchProduct(codigo){
    let response=await fetch(`${config.urlRoot}searchProduct`,{
      method: 'POST',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          code: codigo
      })
  });
  let json = await response.json();
  setProduct(json.Products[0].name)
  }

  //Envia o Formulario com os dados para edição
  async function sendForm() {
    let response=await fetch(config.urlRoot+'update',{
      method: 'POST',
      headers:{
           Accept: 'application/json',
          'Content-type':'application/json'
      },
       body: JSON.stringify({
           code: code,
           product: product,
           local: localization
       })
   });
   let json=await response.json();
   setResponse(json);
   setDisplayMsg('flex');
   setTimeout(()=>{
    setDisplayMsg('none');
   }, 3000)
  }

  //Nova leitura do QRCode
  async function readAgain(){
    setScanned(false);
    setDisplayQR('flex');
    setDisplayForm('none');
    setCode(null);
    setProduct(null);
    setLocalization(null);
  }

  //Retorna a posição e endereço do usuário
  async function getLocation(){
    let location = await Location.getCurrentPositionAsync({});
    Geocoder.init(config.geocodingAPI);
    Geocoder.from(location.coords.latitude, location.coords.longitude)
		.then(json => {
      //O código abaixo deve ser descomentado após a verificação de pagamento(explicado no console.warn() mais abaixo) do Google (É gratuito, para usar até U$300, a partir do prazo ou gasto todos os créditos, a API acaba sendo desabilitada pela equipe Google) 
      
      /*let number = json.results[0].address_components[0].short_name;
      let street = json.results[0].address_components[1].short_name;
			setLocalization(`${street} - ${number}`)*/
		})
		.catch(error => {
      console.warn('Para esta funcionalidade deve-se realizar a verificação do pagamento(eviando foto da identidade e cartão de crédito para o Google, após isso é liberado o acesso a API)(Não possui nenhum custo, é apenas para o google verificar que você não é um robô)')
      console.warn(error)
    });
  }

  return (
    <View>
      <MenuAreaRestrita title="Edição" navigation={navigation} />
      <BarCodeScanner
        onBarCodeScanned={
          scanned ? undefined : (value) => handleBarCodeScanned(value)
        }
        style={css.qr__code(displayQR)}
      />
      <View style={[css.qr__form(displayForm), css.conatiner3]}>
      <Text style={css.msg_success(displayMsg)}>{response}</Text>
        <Text style={css.code__label}>Código</Text>
        <Text style={css.code_product}>{code}</Text>
        <View style={css.login__input}>
          <TextInput
            placeholder="Nome do Produto"
            onChangeText={(text) => setProduct(text)}
            value={product}
          />
        </View>
        <View style={css.login__input}>
          <TextInput
            placeholder="Localização do Produto"
            onChangeText={(text) => setLocalization(text)}
            value={localization}
          />
        </View>
        <TouchableOpacity style={css.login__button} onPress={() => sendForm()}>
          <Text>Atualizar</Text>
        </TouchableOpacity>

        {scanned &&
          <View style={css.readAgain}>
            <Button 
              title='Escanear Novamente'
              onPress={() => readAgain()}  
            ></Button>
          </View>
        }
      </View>
    </View>
  );
}
