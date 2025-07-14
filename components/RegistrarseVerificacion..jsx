import React, {useState, useRef} from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Pressable, Alert, ActivityIndicator} from "react-native";
import { useFonts } from "expo-font";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextInput } from "react-native-gesture-handler";

// 1. IMPORTAMOS LA NUEVA FUNCIÓN 'finalizarRegistro'
import { finalizarRegistro } from "./authService";

const icon = require('../assets/logo.png');
const flechaBack = require('../assets/Arrow.png');

export default function RegistrarseVerificacion({ navigation, route }){
    // 2. AHORA SOLO RECIBIMOS EL EMAIL DE LA PANTALLA ANTERIOR
    const { email } = route.params;
    
    // 3. ELIMINAMOS EL CÓDIGO HARDCODEADO
    // const CODIGO_CORRECTO = "1234"; 
    
    const [codigo, setCodigo] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const inputRefs = useRef([]);

    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf'),
        'KaushanScript-Regular': require('../assets/fonts/KaushanScript-Regular.ttf'),
    });

    if (!fontsLoaded) return null;

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleCodeChange = (text, index) => {
        const nuevoCodigo = [...codigo];
        nuevoCodigo[index] = text;
        setCodigo(nuevoCodigo);

        if (text && index < 3) {
            inputRefs.current[index + 1].focus();
        }
    };

    // 4. LÓGICA DE VERIFICACIÓN ACTUALIZADA
    const handleVerification = async () => {
        const codigoIngresado = codigo.join('');

        if (codigoIngresado.length !== 4) {
            Alert.alert('Error', 'Por favor, ingresa los 4 dígitos del código.');
            return;
        }

        // Ya no comparamos aquí. Le pasamos la responsabilidad al backend.
        setIsLoading(true); 
        
        const result = await finalizarRegistro(email, codigoIngresado);
        
        setIsLoading(false);

        if (result.success) {
            Alert.alert('¡Cuenta Creada!', 'Tu cuenta ha sido verificada y creada con éxito.', [
                { text: 'OK', onPress: () => navigation.navigate('FinRegistro') } 
            ]);
        } else {
            // Mostramos el error que nos devuelve el backend
            Alert.alert('Error de Verificación', result.message);
        }
    };

    return(
        <View style={styles.container}>
            <StatusBar style= "auto"/>
            <Pressable style={({pressed}) => [styles.botonBack, {top: insets.top + 10,left: insets.left +15,}, pressed && styles.botonBackPress]} onPress={handleBackPress}>
                <Image source={flechaBack}/>
            </Pressable>
            <Image source={icon} style={styles.logoEstilos}/>
            <Text style={styles.titulo}>Verificación</Text>
            <View style={styles.card}>
                <Text style={styles.texto}>Hemos enviado un código a tu correo. Por favor, ingrésalo a continuación.</Text>
                <View style={styles.ordernar}>
                    {codigo.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={ref => inputRefs.current[index] = ref}
                            style={styles.input}
                            keyboardType="numeric"
                            maxLength={1}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            value={digit}
                            textAlign="center"
                            selectTextOnFocus
                            editable={!isLoading}
                        />
                    ))}
                </View>
                <Pressable style={styles.botonIngresar} onPress={handleVerification} disabled={isLoading}>
                    {isLoading ? (<ActivityIndicator color="white" />) : (<Text style={styles.botonIngresarTexto}>Verificar y Crear Cuenta</Text>)}
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create(
    {
        container:{
            flex:1,
            backgroundColor:'#F5C444',
            alignItems:'center',
            justifyContent:'center'
        },
        logoEstilos:{
            width: 150,
            height: 150,
            resizeMode:'contain'
        },
        titulo: {
            fontSize: 36,
            color: '#416328', 
            marginBottom: 20,
            fontFamily:'KaushanScript-Regular'
        },
        botonBack:{
            position:'absolute',
            zIndex: 10, 
            backgroundColor: '#679F40',
            padding: 12,
            borderRadius: 10,
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            width: 40,
            height:40,
            alignItems: 'center',
            justifyContent: 'center'
        },
        botonBackPress:{
            backgroundColor:'#428E0D'
        },
        card: {
            width: '85%',
            backgroundColor: 'white',
            borderRadius: 15,
            padding: 25,
            alignItems: 'center',
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        botonIngresar: {
            backgroundColor: '#679F40',
            paddingVertical: 10,
            borderRadius: 10,
            width: '80%',
            alignItems: 'center',
            elevation: 2,
            marginBottom:10,
            minHeight: 45, // <-- Añadido para que no cambie de tamaño con el spinner
        },
        botonIngresarTexto: {
            color: 'white',
            fontSize: 16,
            fontFamily: 'Inika-Regular',
        },
        ordernar:{
            flexDirection:'row',
            marginTop:30,
            marginBottom:35,
            width:'100%',
            justifyContent:'space-evenly'
        },
        input:{
            borderWidth:3,
            borderRadius:5,
            borderColor:'#679F40',
            width:40,
            height:40,
            margin:5,
            fontSize: 18,
            fontFamily: 'Inika-Bold'
        },
        verificarTexto:{
            color:'#F5BF3C',
            textDecorationLine:'underline',
            marginTop:10
        },
        texto:{
            fontFamily:'Inika-Regular',
            color:'#416328',
            fontSize:15,
            marginTop:20
        }
    }
)