import React, { useState, useEffect, useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
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

const enrolledCoursesData = [
    {
        id: '1',
        title: 'Cheesecake al horno',
        image: require('../assets/Images/recipes/cheesecake.jpg'),
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

const EnrolledCourseCard = ({ item }) => {
    const [isBookmarked, setIsBookmarked] = useState(true);

    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked);
    };

    return (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
                    <FontAwesome
                        name={isBookmarked ? 'bookmark' : 'bookmark-o'}
                        size={24}
                        color="#6b8e23"
                    />
                </TouchableOpacity>
            </View>
            <Image source={item.image} style={styles.cardImage} />
        </TouchableOpacity>
    );
};

const RecetasGuardadas = () => {
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logoImage}
                    />
                </View>

                <View style={styles.listContainer}>
                    {enrolledCoursesData.map(item => (
                        <EnrolledCourseCard
                            item={item}
                            key={item.id}
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
        alignItems: 'center',
        paddingLeft: 20,
    },
    cardContent: {
        flex: 1,
        paddingVertical: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: 'Inika-Bold',
        color: '#5d4037',
        width: '80%',
    },
    bookmarkButton: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    cardImage: {
        width: 110,
        height: 100,
        borderTopRightRadius: 15,
        borderBottomRightRadius: 15,
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

export default RecetasGuardadas;