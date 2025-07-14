import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Image,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Modal,
    Animated,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';

import UserMenu from './UserMenu';

const coursesData = [
    {
        id: '1',
        title: 'Curso de comida asiatica',
        description: 'En este curso se dará enseñanza de cocina y gastronomía profesional, desde diferentes técnicas hasta recetas.',
        image: require('../assets/Images/courses/comida_asiatica.png'), 
    },
    {
        id: '2',
        title: 'Curso de comida sin T.A.C.C',
        description: 'En este curso se dará enseñanza sobre diferentes recetas que no contengan T.A.C.C.',
        image: require('../assets/Images/courses/comida_sin_tacc.png'),
    },
];

const SideMenu = ({ isVisible, onClose }) => {
    const menuItems = ["Buscar Recetas", "Buscar Cursos", "Mis Cursos", "Mis Recetas", "Recetas Guardadas", "Cuenta Corriente"];
    const slideAnim = useRef(new Animated.Value(-280)).current;
    const navigation = useNavigation();

    useEffect(() => {
        if (isVisible) {
            Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true, }).start();
        } else {
            Animated.timing(slideAnim, { toValue: -280, duration: 300, useNativeDriver: true, }).start();
        }
    }, [isVisible]);

    const handleNavigation = (screenName) => {
        navigation.navigate(screenName);
        onClose();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={styles.menuContainer}>
                <>
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
                                        if (item === "Buscar Cursos") handleNavigation('BuscarCursos');
                                        else if (item === "Buscar Recetas") handleNavigation('Home');
                                        else if (item === "Mis Cursos") handleNavigation('MisCursos');
                                        else if (item === "Mis Recetas") handleNavigation('MisRecetas');
                                        else if (item === "Recetas Guardadas") handleNavigation('RecetasGuardadas');
                                        else if (item === "Cuenta Corriente") handleNavigation('CuentaCorriente');
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
                </>
            </View>
        </Modal>
    );
};

const CourseCard = ({ item, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
            </View>
            <Image source={item.image} style={styles.cardImage} />
        </TouchableOpacity>
    );
};

const BuscarCursos = () => {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [isUserMenuVisible, setUserMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigation = useNavigation();

    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf')
    });

    const filteredCourses = coursesData.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <SideMenu isVisible={isMenuVisible} onClose={() => setMenuVisible(false)} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Ionicons name="menu" size={32} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setUserMenuVisible(!isUserMenuVisible)}>
                    <FontAwesome name="user-circle-o" size={30} color="#333" />
                </TouchableOpacity>
            </View>
            
            <UserMenu isVisible={isUserMenuVisible} onClose={() => setUserMenuVisible(false)} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logoImage}
                    />
                </View>

                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar"
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <FontAwesome name="search" size={20} color="#aaa" style={styles.searchIcon} />
                </View>

                <View style={styles.listContainer}>
                    {filteredCourses.map((item, index) => (
                        <CourseCard 
                            item={item} 
                            key={item.id}
                            onPress={() => {
                                if (index === 0) {
                                    navigation.navigate('InformacionCurso', { curso: item });
                                } else {
                                    console.log(`No se navega para el curso: ${item.title}. Solo el primero es navegable en este ejemplo.`);
                                }
                            }}
                        />
                    ))}
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
    logoContainer: {
        alignSelf: 'center',
    },
    logoImage: {
        width: 130,
        height: 130,
        resizeMode: 'contain',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 25,
        paddingHorizontal: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        height: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: '#333',
        fontFamily: 'Inika-Regular',
    },
    searchIcon: {
        marginLeft: 10,
    },
    listContainer: {
        paddingHorizontal: 20,
    },
    card: {
        backgroundColor: '#fff7e6',
        borderRadius: 15,
        marginBottom: 20,
        flexDirection: 'row',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
    },
    cardContent: {
        flex: 1,
        padding: 15,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: 'Inika-Bold',
        color: '#5d4037',
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 14,
        fontFamily: 'Inika-Regular',
        color: '#6d6d6d',
        lineHeight: 20,
    },
    cardImage: {
        width: 120,
        height: '100%',
    },
    menuContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    menuContent: {
        width: 280,
        height: '100%',
        backgroundColor: '#fcc853',
        paddingTop: Platform.OS === 'android' ? 45 : 55,
        paddingHorizontal: 20,
    },
    menuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backButton: {
        marginBottom: 40,
    },
    menuItemsContainer: {
        paddingLeft: 10,
    },
    menuItem: {
        paddingVertical: 15,
    },
    menuItemText: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#333',
    },
});

export default BuscarCursos;