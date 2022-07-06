import {StyleSheet} from 'react-native';

const css = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    containerTop:{
      justifyContent: 'flex-start',  
    },
    container2: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    conatiner3: {
        padding: 20
    },
    textPage:{
        backgroundColor: 'orange',
        padding: 20,
    }, 
    button__home:{
        marginRight: 40  
    },
    darkbg:{
        backgroundColor: '#333'
    },
    login__logomarca:{
        marginBottom: 10
    },
    login__msg:(text='none') => ({
        fontWeight: 'bold',
        fontSize: 22,
        color: 'red',
        marginTop: 5,
        marginBottom: 15,
        display: text
    }),
    login__form: {
        width: '80%',
    },
    login__input: {
        backgroundColor: '#FFF',
        fontSize: 19,
        padding: 7,
        marginBottom: 15
    },
    login__button:{
        padding: 12,
        backgroundColor: '#EC6433',
        alignSelf: 'center',
        borderRadius: 5,
    },
    login__buttonText:{
        fontWeight: 'bold',
        fontSize: 22,
        color: '#232323'
    },
    area__tab: {
        backgroundColor: '#232323',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#232323'
    },
    area__menu:{
        flexDirection: 'row',
        paddingTop: 40,
        paddingBottom: 10,
        width: '100%',
        backgroundColor: '#232323',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button__home2:{
        textAlign: 'left',
    },
    area__title:{
        width: '80%',
        fontWeight: 'bold',
        fontSize: 20,
        color: '#FFF',
        textAlign: 'center'
    },
    button__logout:{
        textAlign: 'right',
    },
    edit__msg:{
        color: 'red',
        fontSize: 20,
        fontWeight: 'bold',
    },
    edit__input:{
        width: '100%',
        backgroundColor: '#FFF',
        fontSize: 19,
        padding: 7,
        marginBottom: 15,
        borderBottomWidth: 1,
        textAlign: 'center'
    },
    qr__code: (display = 'flex') => ({
        width: '100%',
        height: '100%',
        backgroundColor: '#000',
        justifyContent: 'center',
        display: display,
    }),
    qr__form: (display = 'none') => ({
        width: '100%',
        display: display
    }),
    msg_success:(display = 'none') => ({
        display: display,
        textAlign: 'center',
        width: '100%',
        alignItems: 'center',
        height: 50,
        backgroundColor: '#D1E7DD',
        color: '#0F5132',
        letterSpacing: 1
    }),
    code__label:{
        marginTop: 40,
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 20,
    },
    code_product:{
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 25,
        marginBottom: 40
    },
    readAgain:{
        width: '100%',
        marginTop: 40
    },
    rastreio__inputMargin:{
        marginTop: 20,
        marginBottom: 30,
        borderColor: '#ccc',
        borderBottomWidth: 1,
        paddingLeft: 20,
        paddingRight: 20,
    }
});

export {css};
   