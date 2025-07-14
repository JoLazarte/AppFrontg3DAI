import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Modal,
    Animated,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import UserMenu from './UserMenu';

const paymentHistoryData = [
    { id: '1', date: '11/03/2025', receipt: '00001', course: 'Curso comida asiatica', amount: 95000 },
    { id: '2', date: '11/03/2025', receipt: '00001', course: 'Curso comida asiatica', amount: 95000 },
    { id: '3', date: '11/03/2025', receipt: '00001', course: 'Curso comida asiatica', amount: 95000 },
    { id: '4', date: '11/03/2025', receipt: '00001', course: 'Curso comida asiatica', amount: 95000 },
    { id: '5', date: '11/03/2025', receipt: '00001', course: 'Curso comida asiatica', amount: 95000 },
    { id: '6', date: '11/03/2025', receipt: '00001', course: 'Curso comida asiatica', amount: 95000 },
];

const userData = {
    name: 'Tomás',
    lastName: 'Rodríguez',
    lu: '0123456'
};

const SideMenu = ({ isVisible, onClose }) => {
    const menuItems = ["Buscar Recetas", "Buscar Cursos", "Mis Cursos", "Mis Recetas", "Recetas Guardadas", "Cuenta Corriente"];
    const slideAnim = useRef(new Animated.Value(-280)).current;
    const navigation = useNavigation();

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isVisible ? 0 : -280,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isVisible]);

    const handleNavigation = (screenName) => {
        navigation.navigate(screenName);
        onClose();
    };

    return (
        <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <View style={styles.menuContainer}>
                <Animated.View style={[styles.menuContent, { transform: [{ translateX: slideAnim }] }]}>
                    <TouchableOpacity onPress={onClose} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={32} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.menuItemsContainer}>
                        {menuItems.map(item => (
                            <TouchableOpacity
                                key={item}
                                style={styles.menuItem}
                                onPress={() => {
                                    if (item === "Buscar Cursos") {
                                        handleNavigation('BuscarCursos');
                                    } 
                                    else if (item === "Buscar Recetas") {
                                        handleNavigation('Home');
                                    }
                                    else if (item === "Mis Cursos") {
                                        handleNavigation('MisCursos');
                                    }
                                    else if (item === "Mis Recetas") {
                                            handleNavigation('MisRecetas');
                                        }
                                    else if (item === "Recetas Guardadas") { 
                                        handleNavigation('RecetasGuardadas');
                                    }
                                    else if (item === "Cuenta Corriente") { 
                                        handleNavigation('CuentaCorriente');
                                    } 
                                    else {
                                        console.log(`Navegar a: ${item}`);
                                        onClose();
                                    }
                                }}
                            >
                                <Text style={styles.menuItemText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Animated.View>
                <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={onClose} />
            </View>
        </Modal>
    );
};

const CuentaCorriente = () => {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [isUserMenuVisible, setUserMenuVisible] = useState(false);
    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf')
    });

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <SideMenu isVisible={isMenuVisible} onClose={() => setMenuVisible(false)} />

            <View>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <Ionicons name="menu" size={32} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setUserMenuVisible(!isUserMenuVisible)}>
                        <FontAwesome name="user-circle-o" size={30} color="#333" />
                    </TouchableOpacity>
                </View>
                <UserMenu isVisible={isUserMenuVisible} onClose={() => setUserMenuVisible(false)} />
            </View>

            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.balanceCard}>
                    <Text style={styles.balanceText}>Saldo en cuenta: $0</Text>
                    <TouchableOpacity>
                        <Ionicons name="arrow-up-circle-outline" size={32} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.paymentsContainer}>
                    <Text style={styles.paymentsTitle}>Pagos Realizados:</Text>
                    
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.columnHeader, styles.col1]}>Fecha recibo</Text>
                            <Text style={[styles.columnHeader, styles.col2]}>Nro. recibo</Text>
                            <Text style={[styles.columnHeader, styles.col3]}>Nombre Curso</Text>
                            <Text style={[styles.columnHeader, styles.col4]}>Monto</Text>
                        </View>
                        {paymentHistoryData.map((payment) => (
                            <View key={payment.id} style={styles.tableRow}>
                                <Text style={[styles.cell, styles.col1]}>{payment.date}</Text>
                                <Text style={[styles.cell, styles.col2]}>{payment.receipt}</Text>
                                <Text style={[styles.cell, styles.col3]}>{payment.courseName}</Text>
                                <Text style={[styles.cell, styles.col4]}>${payment.amount.toLocaleString('es-AR')}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 45 : 20,
        paddingBottom: 20,
        backgroundColor: '#fcc853',
        paddingHorizontal: 20,
    },
    dropdownMenu: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 85 : 75,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderWidth: 1,
        borderColor: '#ddd',
        zIndex: 20,
    },
    dropdownItem: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownText: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
    },
    container: {
        padding: 20,
    },
    balanceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff7e6',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#fcc853',
        marginBottom: 30,
    },
    balanceText: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#333',
    },
    paymentsContainer: {
    },
    paymentsTitle: {
        fontFamily: 'Inika-Bold',
        fontSize: 22,
        marginBottom: 15,
        color: '#333',
    },
    table: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f9f9f9',
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    columnHeader: {
        fontFamily: 'Inika-Bold',
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    cell: {
        fontFamily: 'Inika-Regular',
        fontSize: 12,
        color: '#555',
        textAlign: 'center',
    },
    col1: { flex: 2.5 },
    col2: { flex: 2 },
    col3: { flex: 4 },
    col4: { flex: 2.5 },
    menuContainer: { flex: 1, flexDirection: 'row' },
    menuContent: { width: 280, height: '100%', backgroundColor: '#fcc853', paddingTop: Platform.OS === 'android' ? 45 : 55, paddingHorizontal: 20 },
    menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    backButton: { marginBottom: 40 },
    menuItemsContainer: { paddingLeft: 10 },
    menuItem: { paddingVertical: 15 },
    menuItemText: { fontFamily: 'Inika-Bold', fontSize: 18, color: '#333' },
});

export default CuentaCorriente;