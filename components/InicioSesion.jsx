import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useState, useContext } from 'react';

import { loginUser } from './authService';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';


const icon = require('../assets/logo.png');
const flechaBack = require('../assets/Arrow.png');

export default function InicioSesion({ navigation }){
    const insets = useSafeAreaInsets();
    
    const { login } = useContext(AuthContext);

    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf'),
        'KaushanScript-Regular': require('../assets/fonts/KaushanScript-Regular.ttf'),
    });

    const [alias, setAlias] = useState('');
    const [password, setPassword] = useState('');
    const [keepSession, setKeepSession] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!fontsLoaded){
        return null;
    }

    const handleBackPress = () =>  {
        navigation.goBack();
    };
    
    const handleLogin = async () => {
        if (!alias || !password) {
            Alert.alert('Error', 'Por favor, completa ambos campos.');
            return;
        }

        setIsLoading(true);

        try {
            const result = await loginUser(alias.trim(), password);

            if (result.success && result.token) {
                login(result.token, keepSession);

            } else {
                Alert.alert('Error de inicio de sesión', result.message);
            }
        } catch (error) {
            console.error("Error inesperado en la pantalla de login:", error);
            Alert.alert('Error', 'Ocurrió un error inesperado. Inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return(
        <View style={styles.container}>
            <StatusBar style= "auto"/>
            <Pressable style={({pressed}) => [
                styles.botonBack,
                {
                    top: insets.top + 10,
                    left: insets.left +15,
                },
                pressed && styles.botonBackPress
            ]} onPress={handleBackPress}
            >
                <Image source={flechaBack}/>
            </Pressable>
            <Image source={icon} style={styles.logoEstilos}/>
            <Text style={styles.titulo}>Iniciar sesión</Text>
            <View style={styles.card}>
                <Text style={styles.label}>Alias</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder='Tu alias de usuario'
                    value={alias}
                    onChangeText={setAlias}
                    autoCapitalize="none"
                />
                <Text style={styles.label}>Contraseña</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder='Tu contraseña'
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                
                <Pressable style={styles.checkboxContainer} onPress={() => setKeepSession(!keepSession)}>
                    <View style={[styles.checkbox, keepSession && styles.checkboxChecked]}>
                        {keepSession && <Text style={styles.checkboxCheckmark}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>Mantener sesión iniciada</Text>
                </Pressable>

                <Pressable style={styles.botonIngresar} onPress={handleLogin} disabled={isLoading}>
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.botonIngresarTexto}>Ingresar</Text>
                    )}
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
        botonesTexto:{
            fontSize: 16,
            color: 'black',
            fontFamily: 'Inika-Regular'
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
        titulo: {
            fontSize: 36,
            color: '#416328', 
            fontFamily: 'KaushanScript-Regular', 
            marginBottom: 20,
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
        label: {
            width: '100%',
            textAlign: 'left',
            fontFamily: 'Inika-Regular',
            fontSize: 12,
            color: '#679F40',
            marginBottom: 5,
        },
        input: {
            width: '100%',
            height: 40,
            borderColor: '#679F40',
            borderWidth: 2,
            borderRadius: 10,
            paddingHorizontal: 15,
            marginBottom: 20,
            fontSize: 16,
            fontFamily: 'Inika-Regular',
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            marginBottom: 25,
        },
        checkbox: {
            width: 20,
            height: 20,
            borderWidth: 2,
            borderColor: '#679F40',
            borderRadius: 3,
            marginRight: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        checkboxChecked: {
            backgroundColor: '#679F40',
        },
        checkboxCheckmark: {
            color: 'white',
            fontWeight: 'bold',
        },
        checkboxLabel: {
            fontFamily: 'Inika-Regular',
            fontSize: 14,
        },
        botonIngresar: {
            backgroundColor: '#679F40',
            paddingVertical: 12,
            borderRadius: 10,
            width: '80%',
            alignItems: 'center',
            elevation: 2,
            marginBottom:10,
            minHeight: 45,
        },
        botonIngresarTexto: {
            color: 'white',
            fontSize: 16,
            fontFamily: 'Inika-Regular',
        }
    }
);