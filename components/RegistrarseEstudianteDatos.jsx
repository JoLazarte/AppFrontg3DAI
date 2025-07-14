import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
// 1. IMPORTAMOS LA FUNCIÓN PARA INICIAR EL REGISTRO
import { iniciarRegistro } from './authService';

const icon = require('../assets/logo.png');
const flechaBack = require('../assets/Arrow.png');
const upload = require('../assets/upload.png');

export default function RegistrarseEstudianteDatos({ navigation, route }){
    const { pendingUser, esEstudiante } = route.params;
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf'),
        'KaushanScript-Regular': require('../assets/fonts/KaushanScript-Regular.ttf'),
    });

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
    
    if (!fontsLoaded) return null;

    const handleBackPress = () => {
        navigation.goBack();
    };

    const handleSelectImage = async (type) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permiso denegado", "Necesitas permitir el acceso a tus fotos para continuar.");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5, // Comprimimos la imagen para que no sea tan pesada
            base64: true, // ¡La opción más importante!
        });

        if (!pickerResult.canceled) {
            // Creamos la Data URL completa
            const imageBase64 = `data:image/jpeg;base64,${pickerResult.assets[0].base64}`;

            // Guardamos la imagen en el estado correspondiente
            if (type === 'frente') {
                setDniFrente(imageBase64);
            } else if (type === 'dorso') {
                setDniDorso(imageBase64);
            }
        }
    };

    // --- 2. FUNCIÓN ACTUALIZADA Y ASÍNCRONA ---
    const handleNavigateToVerificar = async () => {
        // Validación completa de campos
        if (!nroTramite.trim() || !cardNumber.trim() || !nombreTitular.trim() || !fechaVencimiento.trim() || !cvv.trim() || !nroDocumento.trim() || !tipoTarjeta) {
            Alert.alert('Error', 'Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Combinamos todos los datos para el paquete final
        const fullStudentData = {
            ...pendingUser, // alias, email, password, firstName, etc.
            nroTramite: nroTramite.trim(),
            cardNumber: cardNumber.trim(),
            dniFrente: dniFrente,
            dniDorso: dniDorso,
            nroDocumento: nroDocumento.trim(),
            tipoTarjeta: tipoTarjeta,
            // Aquí no incluimos nombreTitular, etc., porque no están en tu backend, pero sí los nuevos campos.
        };

        setIsLoading(true);
        try {
            // Llamamos al backend para que envíe el email de verificación
            // Le pasamos la bandera permissionGranted explícitamente.
            const result = await iniciarRegistro({ ...fullStudentData, permissionGranted: false });

            if (result.success) {
                setIsLoading(false);
                Alert.alert(
                    "Verificación Requerida",
                    result.message || `Hemos enviado un código a ${fullStudentData.email}.`,
                    [
                        { 
                            text: "OK", 
                            onPress: () => navigation.navigate('Verificar', {
                                email: fullStudentData.email,
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
    }

    return(
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                <StatusBar style= "auto"/>
                <Pressable style={[styles.botonBack, { top: insets.top + 10, left: insets.left +15 }]} onPress={handleBackPress}>
                    <Image source={flechaBack}/>
                </Pressable>
                <Image source={icon} style={styles.logoEstilos}/>
                <Text style={styles.titulo}>Datos de Estudiante</Text>

                <View style={styles.card}>
                    <Text style={styles.label}>Paso 3 de 4: Datos de Validación</Text>

                    <Text style={styles.label}>Número de Documento</Text>
                    <TextInput style={styles.input} value={nroDocumento} onChangeText={setNroDocumento} keyboardType="numeric" />

                    <Text style={styles.label}>Nro. de trámite (DNI)</Text>
                    <TextInput style={styles.input} value={nroTramite} onChangeText={setNroTramite} keyboardType="numeric"/>

                    <Text style={styles.label}>Foto D.N.I (frente y reverso)</Text>
                    <View style={styles.medioPagos}>
                        <Pressable style={styles.cargarImagen} onPress={() => handleSelectImage('frente')}>
                            {dniFrente ? (
                                // Si hay imagen, la mostramos
                                <Image source={{ uri: dniFrente }} style={styles.imagenPreview} />
                            ) : (
                                // Si no, mostramos el icono de carga
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
                    
                    {/* El botón ahora muestra un spinner si está cargando y tiene un texto más apropiado */}
                    <Pressable style={styles.botonIngresar} onPress={handleNavigateToVerificar} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.botonIngresarTexto}>Enviar Código</Text>}
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
    imagenCargada: {
        fontFamily: 'Inika-Bold',
        color: '#679F40'
    },
    inputGroupLargo: {
        width: '60%', 
    },
    inputGroupCorto: {
        width: '35%'
    },
    medioPagoSeleccionado: {
        borderColor: '#679F40', 
        borderWidth: 2,
        borderRadius: 10, 
    },
    medioPagoItem: {
        padding: 5,
        borderRadius: 10, 
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
    imagenPreview: {
        width: '100%',
        height: '100%',
        borderRadius: 8, // Para que coincida con el borde del Pressable
        resizeMode: 'cover',
    },
})