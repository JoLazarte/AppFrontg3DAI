import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; // <-- 1. IMPORTACIÓN AÑADIDA

// Importamos la nueva función del servicio y el contexto de autenticación
import { upgradeToStudent } from './authService';
import { AuthContext } from '../context/AuthContext';

const icon = require('../assets/logo.png');
const flechaBack = require('../assets/Arrow.png');
const upload = require('../assets/upload.png');

export default function CambiarUsuarioAEstudiante() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    
    // Obtenemos el token y la función de logout del contexto
    const { userToken, logout } = useContext(AuthContext);

    // Mantenemos los mismos estados del formulario
    const [nroTramite, setNroTramite] = useState('');
    const [dniFrente, setDniFrente] = useState(null);
    const [dniDorso, setDniDorso] = useState(null);
    const [tipoTarjeta, setTipoTarjeta] = useState(null);
    const [cardNumber, setCardNumber] = useState('');
    const [nombreTitular, setNombreTitular] = useState('');
    const [fechaVencimiento, setFechaVencimiento] = useState('');
    const [cvv, setCvv] = useState('');
    const [nroDocumento, setNroDocumento] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf'),
        'KaushanScript-Regular': require('../assets/fonts/KaushanScript-Regular.ttf'),
    });
    
    if (!fontsLoaded) return null;

    const handleBackPress = () => {
        navigation.goBack();
    };

    // --- 2. FUNCIÓN DE CARGA DE IMAGEN REAL ---
    const handleSelectImage = async (type) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permiso denegado", "Necesitas permitir el acceso a tus fotos para continuar.");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!pickerResult.canceled) {
            const imageBase64 = `data:image/jpeg;base64,${pickerResult.assets[0].base64}`;
            if (type === 'frente') {
                setDniFrente(imageBase64);
            } else if (type === 'dorso') {
                setDniDorso(imageBase64);
            }
        }
    };

    const handleSubmit = async () => {
        // ▼▼▼ CONDICIÓN DE VALIDACIÓN CORREGIDA ▼▼▼
        if (!nroTramite.trim() || !cardNumber.trim() || !nroDocumento.trim() || !tipoTarjeta) {
            Alert.alert('Error', 'Por favor, completa todos los campos y carga ambas imágenes del DNI.');
            return;
        }

        // Creamos el objeto solo con los datos que necesita el backend
        const studentDataPayload = {
            nroTramite: nroTramite.trim(),
            cardNumber: cardNumber.trim(),
            dniFrente,
            dniDorso,
            nroDocumento: nroDocumento.trim(),
            tipoTarjeta,
        };

        setIsLoading(true);
        try {
            const result = await upgradeToStudent(studentDataPayload, userToken);

            if (result.success) {
                setIsLoading(false);
                Alert.alert(
                    "¡Felicidades!",
                    "Tu cuenta ha sido actualizada a Estudiante. Por favor, inicia sesión de nuevo para aplicar los cambios.",
                    [{ text: "OK", onPress: () => logout() }]
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
                <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                    <StatusBar style="auto"/>
                    <Pressable style={[styles.botonBack, { top: insets.top + 10, left: insets.left + 15 }]} onPress={handleBackPress}>
                        <Image source={flechaBack}/>
                    </Pressable>
                    <Image source={icon} style={styles.logoEstilos}/>
                    <Text style={styles.titulo}>Datos de Estudiante</Text>

                    <View style={styles.card}>
                        <Text style={styles.label}>Paso Final: Datos de Validación</Text>
                        
                        <Text style={styles.label}>Número de Documento</Text>
                        <TextInput style={styles.input} value={nroDocumento} onChangeText={setNroDocumento} keyboardType="numeric" />

                        <Text style={styles.label}>Nro. de trámite (DNI)</Text>
                        <TextInput style={styles.input} value={nroTramite} onChangeText={setNroTramite} keyboardType="numeric"/>

                        <Text style={styles.label}>Foto D.N.I (frente y reverso)</Text>
                        {/* --- 3. JSX ACTUALIZADO PARA MOSTRAR IMAGEN --- */}
                        <View style={styles.medioPagos}>
                            <Pressable style={styles.cargarImagen} onPress={() => handleSelectImage('frente')}>
                                {dniFrente ? (
                                    <Image source={{ uri: dniFrente }} style={styles.imagenPreview} />
                                ) : (
                                    <Image source={upload} />
                                )}
                            </Pressable>
                            <Pressable style={styles.cargarImagen} onPress={() => handleSelectImage('dorso')}>
                                {dniDorso ? (
                                    <Image source={{ uri: dniDorso }} style={styles.imagenPreview} />
                                ) : (
                                    <Image source={upload} />
                                )}
                            </Pressable>
                        </View>

                        <Text style={styles.label}>Tipo de Tarjeta</Text>
                        <View style={styles.selectorContainer}>
                            <TouchableOpacity 
                                style={[styles.selectorOption, tipoTarjeta === 'Debito' && styles.selectorOptionSelected]}
                                onPress={() => setTipoTarjeta('Debito')}>
                                <Text style={[styles.selectorText, tipoTarjeta === 'Debito' && styles.selectorTextSelected]}>Débito</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.selectorOption, tipoTarjeta === 'Credito' && styles.selectorOptionSelected]}
                                onPress={() => setTipoTarjeta('Credito')}>
                                <Text style={[styles.selectorText, tipoTarjeta === 'Credito' && styles.selectorTextSelected]}>Crédito</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <Text style={styles.label}>Nro. de tarjeta</Text>
                        <TextInput style={styles.input} value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric"/>

                        <Text style={styles.label}>Titular de tarjeta</Text>
                        <TextInput style={styles.input} value={nombreTitular} onChangeText={setNombreTitular}/>

                        <View style={styles.ordenarHorizontal}>
                            <View style={styles.inputGroupLargo}>
                                <Text style={styles.label}>Fecha de vencimiento</Text>
                                <TextInput style={styles.input} value={fechaVencimiento} onChangeText={setFechaVencimiento} placeholder="MM/AA"/>
                            </View>
                            <View style={styles.inputGroupCorto}>
                                <Text style={styles.label}>CVV</Text>
                                <TextInput style={styles.input} value={cvv} onChangeText={setCvv} keyboardType="numeric" maxLength={4} secureTextEntry/>
                            </View>
                        </View>
                        
                        <Pressable style={styles.botonIngresar} onPress={handleSubmit} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.botonIngresarTexto}>Finalizar y Convertir</Text>}
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Estilos formateados con tabulaciones como pediste
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F5C444',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5C444',
    },
    contentContainer: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    logoEstilos:{
        width: 150,
        height: 150,
        resizeMode:'contain',
    },
    titulo: {
        fontSize: 36,
        color: '#416328', 
        marginBottom: 20,
        fontFamily:'KaushanScript-Regular',
    },
    botonBack:{
        position:'absolute',
        zIndex: 10,
        top: 20,
        left: 20,
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
        justifyContent: 'center',
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
        marginBottom: 20,
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
        marginBottom:10,
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
        marginBottom:20,
    },
    cargarImagen:{
        width:135,
        height:75,
        borderWidth: 2,
        borderColor:'#679F40',
        borderRadius:10,
        justifyContent:'center',
        alignItems:'center',
        overflow: 'hidden', // Asegura que la imagen no se salga de los bordes redondeados
    },
    imagenPreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    inputGroupLargo: {
        width: '60%', 
    },
    inputGroupCorto: {
        width: '35%',
    },
    selectorContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    selectorOption: {
        flex: 1,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: '#679F40',
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    selectorOptionSelected: {
        backgroundColor: '#679F40',
    },
    selectorText: {
        color: '#679F40',
        fontFamily: 'Inika-Bold',
    },
    selectorTextSelected: {
        color: 'white',
    },
});