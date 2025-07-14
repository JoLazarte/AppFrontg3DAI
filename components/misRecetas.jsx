import React, { useState, useEffect, useRef, useContext } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import UserMenu from './UserMenu';
import { misRecetas } from './recipeService'; 
import { AuthContext } from '../context/AuthContext';

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
            </View>
        </Modal>
    );
};

const DEFAULT_RECIPE_IMAGE = require('../assets/imagenNodisponible.png'); 

const MyRecipeCard = ({ item }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const navigation = useNavigation(); // Hook para poder navegar

    const toggleBookmark = (e) => {
        // Detiene la propagación para que al presionar el bookmark, no se active la navegación de la tarjeta
        e.stopPropagation(); 
        setIsBookmarked(!isBookmarked);
    };

    const handleNavigate = () => {
        // Navega a la pantalla 'InformacionReceta' y le pasa el ID
        navigation.navigate('InformacionReceta', { recipeId: item.id });
    };

    const handleEditRecipe = () => {
         navigation.navigate('EditarReceta', { recipeToEdit: item, mode: 'edit' }); //
    };

    return (
        // Hacemos que toda la tarjeta sea un botón
        <TouchableOpacity onPress={handleNavigate}>
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.recipeName}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={handleEditRecipe}>
                        <FontAwesome name="pencil-square-o" size={26} color="#6b8e23" />
                    </TouchableOpacity>
                </View>
                <Image 
                    source={{ uri: item.mainPicture || 'https://placehold.co/110x150/fff7e6/5d4037?text=Receta' }} 
                    style={styles.cardImage} 
                />
            </View>
        </TouchableOpacity>
    );
};

const MisRecetas = () => {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [isUserMenuVisible, setUserMenuVisible] = useState(false);
    const [myRecipesData, setMyRecipesData] = useState([]); // State to store fetched recipes
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    const { user } = useContext(AuthContext); // Get user from AuthContext
    const navigation = useNavigation();

    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf')
    });

    useEffect(() => {
        const fetchMyRecipes = async () => {
            if (user && user.sub) { // Assuming 'sub' contains the username
                setLoading(true);
                setError(null);
                try {
                    const response = await misRecetas(user.sub); //
                    setMyRecipesData(response.data.content || []); //
                    console.log(myRecipesData);
                } catch (err) {
                    if (err.response && err.response.status === 404) {
                        setMyRecipesData([]); // No recipes found
                    } else {
                        console.error("Error fetching my recipes:", err);
                        setError('No se pudieron cargar tus recetas.'); //
                    }
                } finally {
                    setLoading(false); //
                }
            } else {
                setLoading(false);
                setMyRecipesData([]);
                setError('No hay usuario autenticado para cargar recetas.');
            }
        };

        fetchMyRecipes();
    }, [user]); // Re-fetch when user changes

    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={{ flex: 1 }}>
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

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.logoPlaceholder}>
                        <Image
                            source={require('../assets/logo.png')}
                            style={styles.logoImage}
                        />
                    </View>

                    <View style={styles.listContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#6b8e23" />
                        ) : error ? (
                            <Text style={styles.errorText}>{error}</Text>
                        ) : myRecipesData.length > 0 ? (
                            myRecipesData.map(item => <MyRecipeCard item={item} key={item.id} />)
                        ) : (
                            <View style={styles.center}><Text>No se encontraron tus recetas.</Text></View>
                        )}
                    </View>
                </ScrollView>

                <TouchableOpacity 
                    style={styles.fab}
                    onPress={() => navigation.navigate('CrearReceta')}
                >
                    <Ionicons name="add" size={32} color="#fff" />
                </TouchableOpacity>
            </View>
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
    scrollContent: {
        paddingBottom: 100,
    },
    logoPlaceholder: {
        alignSelf: 'center',
        marginVertical: 40,
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
    editButton: {
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
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fcc853',
        justifyContent: 'center',
        alignItems: 'center',
        right: 20,
        bottom: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    menuContainer: { 
        flex: 1, 
        flexDirection: 'row' 
    },
    menuContent: { 
        width: 280, 
        height: '100%', 
        backgroundColor: '#fcc853', 
        paddingTop: Platform.OS === 'android' ? 45 : 55, 
        paddingHorizontal: 20 
    },
    menuOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)' 
    },
    backButton: { 
        marginBottom: 40 
    },
    menuItemsContainer: { 
        paddingLeft: 10 
    },
    menuItem: { 
        paddingVertical: 15 
    },
    menuItemText: { 
        fontFamily: 'Inika-Bold', 
        fontSize: 18, 
        color: '#333' 
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        minHeight: 150,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        fontFamily: 'Inika-Regular',
        textAlign: 'center',
    },
});

export default MisRecetas;