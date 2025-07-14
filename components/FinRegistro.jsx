import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Pressable} from "react-native";
import { useFonts } from "expo-font";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const icon = require('../assets/logo.png');
const flechaBack = require('../assets/Arrow.png');

export default function FinRegistro({ navigation }){
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf'),
        'KaushanScript-Regular': require('../assets/fonts/KaushanScript-Regular.ttf'),
    });

    if (!fontsLoaded){
        return null;
    }

    const handleBackPress = () =>  {
        navigation.reset({
            index: 0,
            routes: [{ name: 'InicioSesion' }],
        });
    };

    const handleNavigateToLogin = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'InicioSesion' }],
        });
    }

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
            <Text style={styles.titulo}>¡Felicitaciones!</Text>
            <View style={styles.card}>
                <Text style={styles.texto}>Se registró correctamente</Text>

                <Pressable style={styles.botonIngresar} onPress={handleNavigateToLogin}>
                    <Text style={styles.botonIngresarTexto}>Ir a Iniciar Sesión</Text>
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
            marginTop: 20,
        },
        botonIngresarTexto: {
            color: 'white',
            fontSize: 16,
            fontFamily: 'Inika-Regular',
        },
        texto:{
            fontFamily:'Inika-Bold',
            color:'#416328',
            fontSize:18,
            marginTop:20,
            marginBottom:20
        }
    }
);