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
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import UserMenu from './UserMenu';

const myCoursesData = [
    {
        id: '101',
        title: 'Curso de comida asiatica',
        description: 'En este curso se dará enseñanza de cocina y gastronomía profesional, desde diferentes técnicas hasta recetas.',
        image: require('../assets/Images/courses/comida_asiatica.png'),
    },
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
                </>
            </View>
        </Modal>
    );
};

const MyCourseCard = ({ item, onPress }) => {
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

const MisCursos = () => {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUserMenuVisible, setUserMenuVisible] = useState(false);
    const navigation = useNavigation();

    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf')
    });

    const filteredMyCourses = myCoursesData.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                        placeholder="Buscar en mis cursos"
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <FontAwesome name="search" size={20} color="#aaa" style={styles.searchIcon} />
                </View>

                <Text style={styles.sectionTitle}>Mis Cursos</Text>

                <View style={styles.listContainer}>
                    {filteredMyCourses.map((item) => (
                        <MyCourseCard
                            item={item}
                            key={item.id}
                            onPress={() => {
                                navigation.navigate('InformacionMisCursos', { curso: item });
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
    sectionTitle: {
        fontSize: 24,
        fontFamily: 'Inika-Bold',
        color: '#5d4037',
        marginLeft: 20,
        marginBottom: 15,
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
        resizeMode: 'cover',
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
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#333',
        paddingVertical: 15,
    },
    menuItemText: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#333',
    },
});

export default MisCursos;