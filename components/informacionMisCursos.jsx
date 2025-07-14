import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    ScrollView,
    Platform,
    TouchableOpacity,
    StatusBar,
    Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation, useRoute } from '@react-navigation/native';
import Constants from 'expo-constants';

const attendanceData = [
    { id: '1', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '2', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '3', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '4', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '5', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '6', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '7', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '8', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '9', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '10', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '11', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
    { id: '12', status: 'Presente', date: 'Lu 10/03', time: '14:00' },
];

const InformacionMisCursos = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { curso } = route.params;

    const [isModalVisible, setModalVisible] = useState(false);

    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf')
    });

    if (!fontsLoaded) {
        return null;
    }

    const statusBarHeight = Constants.statusBarHeight;

    const handleAcceptBaja = () => {
        console.log('Se aceptó la baja del curso');
        setModalVisible(false);
    };

    const handleCancelBaja = () => {
        console.log('Se canceló la baja del curso');
        setModalVisible(false);
    };

    return (
        <View style={styles.fullScreenContainer}>
            <StatusBar barStyle="dark-content" backgroundColor="#fcc853" />

            <View style={styles.courseHeader}>
                <Image source={curso.image} style={styles.headerImage} />
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backButton, { top: statusBarHeight + 10 }]}
                >
                    <Ionicons name="arrow-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={[styles.threeDotsButton, { top: statusBarHeight + 10 }]}
                >
                    <MaterialIcons name="more-vert" size={28} color="#FFF" />
                </TouchableOpacity>

                <View style={styles.headerTextContainer}>
                    <Text style={styles.courseTitle}>{curso.title}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <TouchableOpacity style={styles.generateQrButton}>
                    <Text style={styles.generateQrButtonText}>Generar QR</Text>
                </TouchableOpacity>

                <View style={styles.attendanceSection}>
                    <View style={styles.tableHeaderRow}>
                        <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Estado</Text>
                        <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Fecha</Text>
                        <Text style={[styles.tableHeaderText, { flex: 0.5 }]}>Hora</Text>
                    </View>
                    {attendanceData.map((item, index) => (
                        <View
                            key={item.id}
                            style={[
                                styles.tableRow,
                                index % 2 === 1 ? styles.tableRowEven : styles.tableRowOdd
                            ]}
                        >
                            <Text style={[styles.tableCellText, { flex: 0.8 }]}>{item.status}</Text>
                            <Text style={[styles.tableCellText, { flex: 1.2 }]}>{item.date}</Text>
                            <Text style={[styles.tableCellText, { flex: 0.5 }]}>{item.time}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>¿Desea darse de baja?</Text>
                        <TouchableOpacity
                            style={styles.modalButtonAccept}
                            onPress={handleAcceptBaja}
                        >
                            <Text style={styles.modalButtonText}>Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButtonCancel}
                            onPress={handleCancelBaja}
                        >
                            <Text style={styles.modalButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#fcc853',
    },
    scrollViewContent: {
        flexGrow: 1,
        backgroundColor: '#F8F8F8',
        paddingBottom: 20,
    },
    courseHeader: {
        width: '100%',
        height: 250,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingBottom: 20,
        position: 'relative',
    },
    headerImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    backButton: {
        position: 'absolute',
        left: 20,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 5,
    },
    threeDotsButton: {
        position: 'absolute',
        right: 20,
        zIndex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 5,
    },
    headerTextContainer: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        alignSelf: 'flex-start',
    },
    courseTitle: {
        fontFamily: 'Inika-Bold',
        fontSize: 28,
        color: '#FFFFFF',
        textShadowColor: 'rgba(0,0,0,0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    generateQrButton: {
        backgroundColor: '#619F4C',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    generateQrButtonText: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#FFFFFF',
    },
    attendanceSection: {
        marginHorizontal: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#fcc853',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#e0b84f',
    },
    tableHeaderText: {
        fontFamily: 'Inika-Bold',
        fontSize: 16,
        color: '#5d4037',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    tableRowOdd: {
        backgroundColor: '#FFFFFF',
    },
    tableRowEven: {
        backgroundColor: '#FFF7E6',
    },
    tableCellText: {
        fontFamily: 'Inika-Regular',
        fontSize: 15,
        color: '#333',
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 25,
        alignItems: 'center',
        width: '80%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    modalText: {
        fontFamily: 'Inika-Bold',
        fontSize: 20,
        marginBottom: 25,
        color: '#5d4037',
        textAlign: 'center',
    },
    modalButtonAccept: {
        backgroundColor: '#619F4C',
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalButtonCancel: {
        backgroundColor: '#A83D3D',
        paddingVertical: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    modalButtonText: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#FFFFFF',
    },
});

export default InformacionMisCursos;