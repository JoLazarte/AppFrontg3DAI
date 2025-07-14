import React, { useState } from 'react';
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Alert, Text, View, Image, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";

import { checkAliasExists, checkEmailExists, generateAliasSuggestions } from './authService';

const icon = require('../assets/logo.png');
const flechaBack = require('../assets/Arrow.png');
const errorIcon = require('../assets/error.png');

const esEmailValido = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
};

export default function RegistrarseEstudiante({ navigation }){
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf'),
        'KaushanScript-Regular': require('../assets/fonts/KaushanScript-Regular.ttf'),
    });

    // --- ESTADOS SIMPLIFICADOS: Solo para alias y email ---
    const [alias, setAlias] = useState('');
    const [email, setEmail] = useState('');

    const [aliasError, setAliasError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [aliasSuggestions, setAliasSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    if (!fontsLoaded){
        return null;
    }

    const handleBackPress = () => {
        navigation.goBack();
    };

    // --- FUNCIÓN ACTUALIZADA: Solo valida alias/email y pasa al siguiente paso ---
    const handleContinuar = async () => {
        setAliasError('');
        setEmailError('');
        setAliasSuggestions([]);
        setIsLoading(true);

        if (!alias.trim() || !email.trim()) {
            Alert.alert("Error", 'Debes completar todos los campos.');
            setIsLoading(false);
            return;
        }
        if (!esEmailValido(email)) {
            setEmailError('El formato del correo electrónico no es válido.');
            setIsLoading(false);
            return;
        }

        try {
            const aliasExists = await checkAliasExists(alias.trim());
            if (aliasExists) {
                setAliasError('El alias que ingresaste ya está en uso.');
                setAliasSuggestions(generateAliasSuggestions(alias.trim()));
                setIsLoading(false);
                return; 
            }

            const emailExists = await checkEmailExists(email.trim());
            if (emailExists) {
                setEmailError('El correo electrónico ya está registrado.');
                setIsLoading(false);
                return;
            }

            setIsLoading(false);
            // Preparamos el paquete de datos inicial
            const pendingStudentData = {
                alias: alias.trim(),
                email: email.trim(),
            };
            
            // Navegamos a la pantalla de Datos Personales con la bandera 'esEstudiante'
            navigation.navigate('RegistrarseDatosPersonales', { 
                pendingUser: pendingStudentData,
                esEstudiante: true 
            });

        } catch (error) {
            setIsLoading(false);
            console.error("Error en la validación del estudiante:", error);
            Alert.alert("Error de Red", "No se pudo conectar con el servidor para validar los datos.");
        }
    };

    return(
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView 
                style={styles.scrollView} 
                contentContainerStyle={styles.contentContainer} 
                showsVerticalScrollIndicator={false}
            >
                <StatusBar style= "auto"/>
                <Pressable style={({pressed}) => [ styles.botonBack, { top: insets.top + 10, left: insets.left +15 }, pressed && styles.botonBackPress ]} onPress={handleBackPress}>
                    <Image source={flechaBack}/>
                </Pressable>
                <Image source={icon} style={styles.logoEstilos}/>
                <Text style={styles.titulo}>Registro de Estudiante</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>Paso 1 de 4: Datos de la Cuenta</Text>
                    
                    <Text style={styles.label}>Alias</Text>
                    <TextInput 
                        value={alias} 
                        onChangeText={(text) => {
                            setAlias(text);
                            if (aliasError) setAliasError('');
                            if (aliasSuggestions.length > 0) setAliasSuggestions([]);
                        }}
                        autoCapitalize="none"
                        style={styles.input}
                        placeholder="Crea tu nombre de usuario"
                    />
                    {aliasError ? <View style={styles.errorContainer}><Image source={errorIcon} style={styles.errorIconStyle}/><Text style={styles.errorText}>{aliasError}</Text></View> : null}
                    {aliasSuggestions.length > 0 && ( <View style={styles.suggestionContainer}><Text style={styles.suggestionTitle}>Alias libres:</Text>{aliasSuggestions.map((sugg) => (<Pressable key={sugg} onPress={() => setAlias(sugg)}><View style={styles.suggestionBox}><Text style={styles.suggestionText}>{sugg}</Text></View></Pressable>))}</View> )}

                    <Text style={styles.label}>E-mail</Text>
                    <TextInput 
                        value={email} 
                        style={styles.input}
                        placeholder="ejemplo@correo.com"
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError('');
                        }}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                    {emailError ? <View style={styles.errorContainer}><Image source={errorIcon} style={styles.errorIconStyle}/><Text style={styles.errorText}>{emailError}</Text></View> : null}

                    {/* --- HEMOS QUITADO LOS CAMPOS DE CONTRASEÑA DE ESTA PANTALLA --- */}

                    <Pressable style={styles.botonIngresar} onPress={handleContinuar} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color="white"/> : <Text style={styles.botonIngresarTexto}>Continuar</Text>}
                    </Pressable>
                </View>
            </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5C444',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5C444',
    },
    scrollView: {
        flex: 1, 
    },
    contentContainer: {
        flexGrow:1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
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
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 10,
        fontSize: 12,
        fontFamily: 'Inika-Regular',
    },
    botonIngresar: {
        backgroundColor: '#679F40',
        paddingVertical: 10,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        elevation: 2,
        marginBottom:10
    },
    botonIngresarTexto: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inika-Regular',
    },
    ordenarHorizontal:{
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-between',
    },
    medioPagos:{
        width:'100%',
        flexDirection:'row',
        justifyContent:'space-between',
        marginBottom:20
    },
    cargarImagen:{
        width:135,
        height:75,
        borderWidth: 2,
        borderColor:'#679F40',
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center',
    },
    inputGroupLargo: {
        width: '60%', 
    },
    inputGroupCorto: {
        width: '35%'
    },
    errorText:{
        color: '#9F4042',
        fontSize: 12,
    },
    linkText:{
        color: '#9F4042',
        textDecorationLine: 'underline',
        fontWeight: 'bold'
    },
    suggestionContainer:{
        width: '100%',
        marginBottom:  15
    },
    suggestionTitle:{
        fontFamily: 'Inika-Bold',
        fontSize: 12,
        color: '#679F40',
        marginBottom: 5
    },
    suggestionBox:{
        borderWidth: 1,
        borderColor: '#679F40',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 15,
        marginBottom: 5
    },
    suggestionText:{
        fontFamily: 'Inika-Regular',
        fontSize: 12
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
        paddingLeft: 5,
    },
    errorIconStyle: {
        width: 16,
        height: 16,
        marginRight: 6,
    }
})