import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    Image,
    ScrollView,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

const cursoDetallado = {
    id: '1',
    title: 'Curso de comida',
    subtitle: 'asiatica',
    image: require('../assets/Images/courses/comida_asiatica.png'), 
    price: 95000,
    schedule: '14:00 hs - 18:00 hs',
    modality: 'Presencial',
    description: 'Constará de un total de 16 clases dictadas los martes y jueves, y estarán a cargo de 2 profesionales en la materia.\nSe trabajará sobre comidas típicas de China, Japón y la India. Se deberá traer el material propio, el cual consta de cuchillos, tablas y repas.\nSe deberá ser puntual con la hora de llegada y mantener el respeto hacia los profesores, dirigiéndose a ellos como "Chefs" para simular un ambiente profesional.',
    locations: [
        {
            id: 'sede1',
            name: 'UADE Monserrat',
            address: 'Dir: Lima 757, C1073 Cdad. Autónoma de Buenos Aires',
            phone: 'tel. 1176625199',
            vacancies: 18,
            image: require('../assets/Images/courses/uade_monserrat.png')
        },
        {
            id: 'sede2',
            name: 'UADE Recoleta',
            address: 'Dir: Libertad 1340, C1016 Cdad. Autónoma de Buenos Aires',
            phone: 'tel. 08001228233',
            vacancies: 27,
            image: require('../assets/Images/courses/uade_recoleta.png')
        },
        {
            id: 'sede3',
            name: 'UADE Belgrano',
            address: 'Dir: 11 de Septiembre de 1888 1990, Belgrano',
            phone: 'tel. 08001228233',
            vacancies: 30,
            image: require('../assets/Images/courses/uade_belgrano.png')
        }
    ]
};

const SedeCard = ({ location }) => (
    <View style={styles.sedeCard}>
        <View style={styles.sedeTextContainer}>
            <Text style={styles.sedeTitle}>{location.name}</Text>
            <Text style={styles.sedeInfo}>{location.address}</Text>
            <Text style={styles.sedeInfo}>{location.phone}</Text>
            <Text style={styles.sedeInfo}>Vacantes disponibles: {location.vacancies}</Text>
        </View>
        <Image source={location.image} style={styles.sedeImage} />
    </View>
);

const InformacionCurso = ({ route }) => {
    const curso = cursoDetallado;
    const navigation = useNavigation();

    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf')
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <TouchableOpacity style={styles.headerBackButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="#333" />
                <Text style={styles.headerBackText}>Volver</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.imageContainer}>
                    <Image source={curso.image} style={styles.courseImage} />
                    <View style={styles.imageOverlay}>
                        <Text style={styles.imageOverlayTitle}>{curso.title}</Text>
                        <Text style={styles.imageOverlaySubtitle}>{curso.subtitle}</Text>
                    </View>
                </View>

                <View style={styles.infoBar}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoTitle}>Precio</Text>
                        <Text style={styles.infoValue}>${curso.price.toLocaleString('es-AR')}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoTitle}>Horario</Text>
                        <Text style={styles.infoValue}>{curso.schedule}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoTitle}>Modalidad</Text>
                        <Text style={styles.infoValue}>{curso.modality}</Text>
                    </View>
                </View>

                <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionText}>{curso.description}</Text>
                </View>

                <View style={styles.sedesContainer}>
                    <Text style={styles.sedesTitle}>Sedes disponibles</Text>
                    {curso.locations.map(loc => <SedeCard key={loc.id} location={loc} />)}
                </View>

                <TouchableOpacity style={styles.signUpButton}>
                    <Text style={styles.signUpButtonText}>Anotarse</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerBackButton: {
        paddingTop: Platform.OS === 'android' ? 45 : 20,
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 20,
        paddingHorizontal: 20,
        backgroundColor: '#fcc853',
    },
    headerBackText: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        marginLeft: 6,
        color: '#333'
    },
    scrollContainer: {
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 250,
        justifyContent: 'flex-end',
    },
    courseImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    imageOverlay: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    imageOverlayTitle: {
        fontFamily: 'Inika-Regular',
        color: '#fff',
        fontSize: 22,
    },
    imageOverlaySubtitle: {
        fontFamily: 'Inika-Bold',
        color: '#fff',
        fontSize: 36,
        textTransform: 'uppercase',
    },
    infoBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    infoItem: {
        flex: 1,
        alignItems: 'center',
    },
    infoTitle: {
        fontFamily: 'Inika-Bold',
        fontSize: 16,
        color: '#333',
    },
    infoValue: {
        fontFamily: 'Inika-Regular',
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    separator: {
        width: 1,
        height: '80%',
        backgroundColor: '#e0e0e0',
    },
    descriptionContainer: {
        backgroundColor: '#fff7e6',
        borderRadius: 8,
        marginBottom: 20,
        padding: 15,
    },
    descriptionText: {
        fontFamily: 'Inika-Regular',
        fontSize: 15,
        lineHeight: 22,
        color: '#5d4037',
    },
    sedesContainer: {
        paddingHorizontal: 20,
    },
    sedesTitle: {
        fontFamily: 'Inika-Bold',
        fontSize: 20,
        color: '#333',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    sedeCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#a8d5ba',
        marginBottom: 15,
        padding: 10,
        alignItems: 'center',
    },
    sedeTextContainer: {
        flex: 1,
    },
    sedeTitle: {
        fontFamily: 'Inika-Bold',
        fontSize: 16,
        color: '#333',
    },
    sedeInfo: {
        fontFamily: 'Inika-Regular',
        fontSize: 13,
        color: '#666',
        marginTop: 4,
    },
    sedeImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginLeft: 10,
    },
    signUpButton: {
        backgroundColor: '#6b8e23',
        marginHorizontal: 20,
        marginTop: 10,
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        elevation: 3,
    },
    signUpButtonText: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#fff',
    },
});

export default InformacionCurso;