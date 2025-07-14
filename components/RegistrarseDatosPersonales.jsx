import React, { useState } from 'react';
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, TextInput, View, Image, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
// 1. IMPORTAMOS LA FUNCIÓN PARA INICIAR EL REGISTRO
import { iniciarRegistro } from './authService';

const icon = require('../assets/logo.png');
const flechaBack = require('../assets/Arrow.png');
const errorIcon = require('../assets/error.png');

export default function RegistrarseDatosPersonales({ route, navigation }) {
    const { pendingUser, esEstudiante } = route.params;
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf'),
        'KaushanScript-Regular': require('../assets/fonts/KaushanScript-Regular.ttf'),
    });

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState(null);

    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [firstNameError, setFirstNameError] = useState('');
    const [lastNameError, setLastNameError] = useState('');
    
    // Añadimos el estado de carga que faltaba
    const [isLoading, setIsLoading] = useState(false);

    if (!fontsLoaded) return null;

    const handleBackPress = () => {
        navigation.goBack();
    };

    // --- 2. FUNCIÓN 'handleContinuar' TOTALMENTE REEMPLAZADA ---
    const handleContinuar = async () => {
        // Reseteamos errores
        setPasswordError('');
        setConfirmPasswordError('');
        setFirstNameError('');
        setLastNameError('');
        
        let hasError = false;
        const mensajeObligatorio = "Este campo es obligatorio";

        // Validaciones locales
        if (!firstName.trim()) { setFirstNameError(mensajeObligatorio); hasError = true; }
        if (!lastName.trim()) { setLastNameError(mensajeObligatorio); hasError = true; }
        if (!password) { setPasswordError(mensajeObligatorio); hasError = true; }
        if (!confirmPassword) { setConfirmPasswordError(mensajeObligatorio); hasError = true; }
        
        if (password && confirmPassword && password !== confirmPassword) {
            setConfirmPasswordError('Las contraseñas no coinciden.');
            hasError = true;
        }

        if (hasError) { return; }

        // Si las validaciones del formulario pasan, construimos el paquete de datos
        const fullUserData = {
            ...pendingUser,
            password: password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim() || null,
            address: address.trim() || null,
            urlAvatar: avatar ? `data:image/jpeg;base64,${avatar.base64}` : null,
        };

        // Si es estudiante, le pasamos los datos del siguiente paso
        if (esEstudiante) {
            navigation.navigate('RegistrarseEstudianteDatos', {
                pendingUser: fullUserData,
                esEstudiante: true
            });
            return; // Detenemos la ejecución aquí para el flujo de estudiante
        }
        
        // --- LÓGICA PARA USUARIO GENERAL: LLAMAR A LA API ---
        setIsLoading(true);
        try {
            // Pasamos la bandera 'permissionGranted' directamente
            const result = await iniciarRegistro({ ...fullUserData, permissionGranted: true });
            
            if (result.success) {
                setIsLoading(false);
                Alert.alert(
                    "Verificación Requerida",
                    result.message || `Hemos enviado un código a ${fullUserData.email}.`,
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.navigate('Verificar', {
                                email: fullUserData.email,
                            })
                        }
                    ]
                );
            } else {
                setIsLoading(false);
                Alert.alert('Error', result.message);
            }
        } catch (error) {
            setIsLoading(false);
            Alert.alert("Error de Red", "No se pudo conectar con el servidor.");
        }
    };

    const handleChooseAvatar = async () => {
        // Pedir permiso para acceder a la galería
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            alert("¡Necesitas permitir el acceso a tus fotos para elegir un avatar!");
            return;
        }

        // Abrir la galería de imágenes
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1], // Proporción cuadrada para el avatar
            quality: 0.5,    // Comprime la imagen para no enviar datos enormes
            base64: true,    // ¡MUY IMPORTANTE! Esto nos da la cadena Base64
        });

        // Si el usuario no cancela, guardamos la imagen seleccionada
        if (!pickerResult.canceled) {
            setAvatar(pickerResult.assets[0]);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <StatusBar style="auto" />
                    <Pressable style={[styles.botonBack, { top: insets.top + 10, left: insets.left + 15 }]} onPress={handleBackPress}>
                        <Image source={flechaBack} />
                    </Pressable>
                    <Image source={icon} style={styles.logoEstilos} />
                    <Text style={styles.titulo}>Datos Personales</Text>
                    <View style={styles.card}>
                        <Text style={styles.label}>Avatar (Opcional)</Text>
                        <Pressable style={styles.avatarPicker} onPress={handleChooseAvatar}>
                            {avatar ? (
                                <Image source={{ uri: avatar.uri }} style={styles.avatarPreview} />
                            ) : (
                                <Text style={styles.avatarPickerText}>Seleccionar Imagen</Text>
                            )}
                        </Pressable>
                        <Text style={styles.label}>{esEstudiante ? 'Paso 2 de 4' : 'Paso 2 de 3'}: Completa tu Perfil</Text>
                        
                        <Text style={styles.label}>Nombre</Text>
                        <TextInput style={styles.input} value={firstName} onChangeText={(text) => { setFirstName(text); if(firstNameError) setFirstNameError(''); }} />
                        {firstNameError ? <View style={styles.errorContainer}><Image source={errorIcon} style={styles.errorIconStyle}/><Text style={styles.errorText}>{firstNameError}</Text></View> : null}

                        <Text style={styles.label}>Apellido</Text>
                        <TextInput style={styles.input} value={lastName} onChangeText={(text) => { setLastName(text); if(lastNameError) setLastNameError(''); }} />
                        {lastNameError ? <View style={styles.errorContainer}><Image source={errorIcon} style={styles.errorIconStyle}/><Text style={styles.errorText}>{lastNameError}</Text></View> : null}

                        <Text style={styles.label}>Teléfono (Opcional)</Text>
                        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                        <Text style={styles.label}>Dirección (Opcional)</Text>
                        <TextInput style={styles.input} value={address} onChangeText={setAddress} />

                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput style={styles.input} value={password} onChangeText={(text) => { setPassword(text); if(passwordError) setPasswordError(''); }} secureTextEntry />
                        {passwordError ? <View style={styles.errorContainer}><Image source={errorIcon} style={styles.errorIconStyle}/><Text style={styles.errorText}>{passwordError}</Text></View> : null}

                        <Text style={styles.label}>Confirmar Contraseña</Text>
                        <TextInput style={styles.input} value={confirmPassword} onChangeText={(text) => { setConfirmPassword(text); if(confirmPasswordError) setConfirmPasswordError(''); }} secureTextEntry />
                        {confirmPasswordError ? <View style={styles.errorContainer}><Image source={errorIcon} style={styles.errorIconStyle}/><Text style={styles.errorText}>{confirmPasswordError}</Text></View> : null}
                        
                        {/* 3. AÑADIMOS EL ESTADO DE CARGA AL BOTÓN */}
                        <Pressable style={styles.botonIngresar} onPress={handleContinuar} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.botonIngresarTexto}>Continuar</Text>}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Estilos consistentes con el resto de tu aplicación
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5C444',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5C444',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20, // Añadido para dar espacio en pantallas pequeñas
    },
    logoEstilos:{
        width: 150,
        height: 150,
        resizeMode:'contain',
        marginBottom: 10,
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
        top: 50, // Ajustado para SafeAreaView
        left: 20,
        backgroundColor: '#679F40',
        padding: 12,
        borderRadius: 10,
        elevation: 3,
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
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 15, // Un poco menos de margen para acomodar los errores
        fontSize: 14,
        fontFamily: 'Inika-Regular',
    },
    botonIngresar: {
        backgroundColor: '#679F40',
        paddingVertical: 12,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
        elevation: 2,
        marginTop: 10, // Margen superior para separarlo del último campo
    },
    botonIngresarTexto: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Inika-Bold',
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: -10, // Para que el error aparezca más cerca del input
        marginBottom: 10,
        paddingLeft: 5,
    },
    errorIconStyle: {
        width: 14,
        height: 14,
        marginRight: 5,
    },
    errorText:{
        color: '#9F4042',
        fontSize: 12,
        fontFamily: 'Inika-Regular',
    },
    avatarPicker: {
    width: 120,
    height: 120,
    borderRadius: 60, // Para hacerlo circular
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#679F40',
    borderStyle: 'dashed',
    },
    avatarPickerText: {
        color: '#679F40',
        fontFamily: 'Inika-Regular',
        textAlign: "center",
    },
    avatarPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    }
});