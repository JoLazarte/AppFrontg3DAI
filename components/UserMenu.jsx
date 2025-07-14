import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const UserMenu = ({ isVisible, onClose }) => {
    const { user, logout } = useContext(AuthContext);
    const navigation = useNavigation();

    console.log('Datos del usuario en UserMenu:', JSON.stringify(user, null, 2));


    if (!isVisible) {
        return null;
    }

    if (!user) {
        // Muestra un indicador de carga si el usuario aún no está disponible
        return (
            <View style={styles.dropdownMenu}>
                <ActivityIndicator style={{ padding: 20 }} color="#333" />
            </View>
        );
    }

    const handleLogout = () => {
        onClose(); // Llama a onClose para cerrar el menú
        logout();
    };

    const handleBecomeStudent = () => {
        onClose(); // Cierra el menú
        navigation.navigate('CambiarUsuarioAEstudiante'); 
    };

    return (
        <View style={styles.dropdownMenu}>
            <View style={styles.userInfoSection}>
                <Image 
                    source={{ uri: user.urlAvatar }} 
                    style={styles.menuAvatar} 
                />
                <Text style={styles.dropdownText}>{user.firstName} {user.lastName}</Text>
            </View>
            
            {user.permissionGranted === true && (
                <TouchableOpacity 
                    style={styles.dropdownItem}
                    onPress={handleBecomeStudent}
                >
                    <Ionicons name="school-outline" size={22} color="#2980b9" style={styles.menuIcon} />
                    <Text style={styles.actionText}>Quiero ser estudiante</Text>
                </TouchableOpacity>
            )}
            
            <TouchableOpacity 
                style={[styles.dropdownItem, styles.logoutButton]} 
                onPress={handleLogout}
            >
                <Ionicons name="log-out-outline" size={22} color="#c0392b" style={styles.menuIcon} />
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
        </View>
    );
};

// Los estilos son los mismos de antes
const styles = StyleSheet.create({
    dropdownMenu: {
        position: 'absolute',
        top: Platform.OS === 'android' ? 85 : 95, // Ajusta esta posición
        right: 15,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 20,
        minWidth: 220,
    },
    userInfoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuAvatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        marginRight: 10,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownText: {
        fontFamily: 'Inika-Bold',
        fontSize: 16,
    },
    logoutButton: {
        borderBottomWidth: 0,
    },
    menuIcon: {
        marginRight: 10,
    },
    logoutButtonText: {
        fontFamily: 'Inika-Bold',
        fontSize: 16,
        color: '#c0392b',
    },
    actionText: {
        fontFamily: 'Inika-Bold',
        fontSize: 16,
        color: '#2980b9',
    },
});

export default UserMenu;