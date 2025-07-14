import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image, Pressable} from "react-native";
import { useFonts } from "expo-font";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const icon = require('../assets/logo.png');
const flechaBack = require('../assets/Arrow.png');

export default function Inicio({navigation}){
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf')
    });

    if (!fontsLoaded){
        return null;
    }

    const handleBackPress = () =>  {
        navigation.navigate('Invitados');
    };

    const handleNavigateToRegistrarse = () => {
        navigation.navigate('Registrarse');
    }

    const handleNavigateToIniciarSesion = () => {
        navigation.navigate('InicioSesion');
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

        
            <Pressable style={({pressed}) => [
                styles.botones,
                pressed && styles.botonesPressed
            ]}
            onPress={handleNavigateToIniciarSesion}
            >
                <Text style={styles.botonesTexto}>Iniciar Sesión</Text>
            </Pressable>
            <Pressable style={({pressed}) => [
                styles.botones,
                pressed && styles.botonesPressed
            ]}
            onPress={handleNavigateToRegistrarse}
            >
                <Text style={styles.botonesTexto}>Registrarse</Text>
            </Pressable>
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
        botones:{
            backgroundColor: "white",
            paddingVertical: 15,
            paddingHorizontal: 40,
            borderRadius: 8,
            marginVertical: 10,
            width: '70%',
            alignItems: 'center'
        },
        botonesPressed:{
            backgroundColor: 'lightgrey',
            elevation:1
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
        }
    }
)