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
    Dimensions,
    FlatList,
    Modal,
    Animated,
    ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import UserMenu from './UserMenu';
import { 
    getAllRecipes, 
    findRecipesByName, 
    findRecipesByAuthor, 
    findRecipesByType, 
    getRecipeTypes,
    findRecipesByIngredient
} from './recipeService';

const categoryImageMap = {
    'Carne': require('../assets/Images/Categories/Carne.png'),
    'Pollo': require('../assets/Images/Categories/Pollo.png'),
    'Pescados y Mariscos': require('../assets/Images/Categories/pescado.png'),
    'Bebidas con alcohol': require('../assets/Images/Categories/Bebidas con Alcohol.png'),
    'Bebidas sin alcohol': require('../assets/Images/Categories/Bebidas sin Alcohol.png'),
    'Postres': require('../assets/Images/Categories/postres.png'),
    'Crepes': require('../assets/Images/Categories/Crepes.png'),
    'Pastas': require('../assets/Images/Categories/Pastas.png'),
    'Ensaladas': require('../assets/Images/Categories/Ensaladas.png'),
    'Sopas': require('../assets/Images/Categories/sopas.png'),
    'Salsas': require('../assets/Images/Categories/Salsas.png'),
    'Panaderia': require('../assets/Images/Categories/pan.png'),
    'Española': require('../assets/Images/Categories/Española.png'),
    'China': require('../assets/Images/Categories/China.png'),
    'Mexicana': require('../assets/Images/Categories/Mexicana.png'),
    'Árabe': require('../assets/Images/Categories/Árabe.png'),
};

const RecipeCard = ({ item }) => {
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

    return (
        // Hacemos que toda la tarjeta sea un botón
        <TouchableOpacity onPress={handleNavigate}>
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.recipeName}</Text>
                    <TouchableOpacity style={styles.bookmarkButton} onPress={toggleBookmark}>
                        <FontAwesome name={isBookmarked ? 'bookmark' : 'bookmark-o'} size={24} color="#6b8e23" />
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

const CategoryPage = ({ data, onCategoryPress, activeCategory }) => (
    <View style={styles.pageContainer}>
        {data.map((category) => (
            <TouchableOpacity 
                key={category.id} 
                style={styles.categoryItem}
                onPress={() => onCategoryPress(category.id)}
            >
                <Image 
                    source={categoryImageMap[category.name]} 
                    style={[styles.categoryPlaceholder, activeCategory === category.id && styles.categoryActive]} 
                />
                 <View style={styles.categoryTextContainer}>
                    <Text style={styles.categoryText}>{category.name}</Text>
                </View>
            </TouchableOpacity>
        ))}
    </View>
);
const SideMenu = ({ isVisible, onClose }) => {
    const menuItems = [ "Buscar Recetas", "Buscar Cursos", "Mis Cursos", "Mis Recetas", "Recetas Guardadas", "Cuenta Corriente" ];
    const slideAnim = useRef(new Animated.Value(-280)).current;
    const navigation = useNavigation();
    useEffect(() => {
        Animated.timing(slideAnim, { toValue: isVisible ? 0 : -280, duration: 300, useNativeDriver: true }).start();
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

const HomeScreen = () => {
    const [isMenuVisible, setMenuVisible] = useState(false);
    const [isUserMenuVisible, setUserMenuVisible] = useState(false);
    
    const [activeSearchFilter, setActiveSearchFilter] = useState('name');
    const [searchText, setSearchText] = useState('');
    const [submittedSearchText, setSubmittedSearchText] = useState('');
    
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    
    const [ingredientFilterMode, setIngredientFilterMode] = useState('Con ingrediente');
    const [ingredientSearchText, setIngredientSearchText] = useState('');
    const [submittedIngredient, setSubmittedIngredient] = useState(null);
    const [isIngredientFilterOpen, setIngredientFilterOpen] = useState(false);

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('alpha_asc');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [fontsLoaded] = useFonts({ 'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'), 'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf') });

    useEffect(() => {
        getRecipeTypes().then(response => setCategories(response.data)).catch(err => console.error(err));
    }, []);

    useEffect(() => {
        setCurrentPage(0);
    }, [sortOrder, submittedSearchText, activeSearchFilter, activeCategory, submittedIngredient]);

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            setError(null);
            try {
                let response;

                if (submittedIngredient && submittedIngredient.name) {
                    const contains = submittedIngredient.mode === 'Con ingrediente';
                    response = await findRecipesByIngredient(submittedIngredient.name, contains, sortOrder, currentPage);
                } else if (activeCategory) {
                    response = await findRecipesByType(activeCategory, sortOrder, currentPage);
                } else if (submittedSearchText) {
                    if (activeSearchFilter === 'name') {
                        response = await findRecipesByName(submittedSearchText, sortOrder, currentPage);
                    } else {
                        response = await findRecipesByAuthor(submittedSearchText, sortOrder, currentPage);
                    }
                } else {
                    response = await getAllRecipes(sortOrder, currentPage);
                }
                
                setRecipes(response.data.content || []); 
                setTotalPages(response.data.totalPages || 0);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setRecipes([]);
                    setTotalPages(0);
                } else {
                    setError('No se pudieron cargar las recetas.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [sortOrder, currentPage, submittedSearchText, activeSearchFilter, activeCategory, submittedIngredient]);
    
    const resetAllFilters = (except = null) => {
        if (except !== 'category') setActiveCategory(null);
        if (except !== 'text') { setSearchText(''); setSubmittedSearchText(''); }
        if (except !== 'ingredient') { setIngredientSearchText(''); setSubmittedIngredient(null); }
    };
    
    const handleSearchSubmit = () => { resetAllFilters('text'); setSubmittedSearchText(searchText); };
    
    const handleCategoryPress = (categoryId) => {
        resetAllFilters('category');

        setActiveCategory(prevActiveId => prevActiveId === categoryId ? null : categoryId);
    };

    const handleIngredientSearchSubmit = () => {
        if (ingredientSearchText.trim() === '') {
            setSubmittedIngredient(null);
        } else {
            resetAllFilters('ingredient');
            setSubmittedIngredient({ name: ingredientSearchText, mode: ingredientFilterMode });
        }
    };
    const handleIngredientFilterSelect = (mode) => { setIngredientFilterMode(mode); setIngredientFilterOpen(false); };
    
    const handleNextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 0) setCurrentPage(currentPage - 1); };

    const pages = [];
    const itemsPerPage = 8;
    for (let i = 0; i < categories.length; i += itemsPerPage) {
        pages.push(categories.slice(i, i + itemsPerPage));
    }

    if (!fontsLoaded) { return null; }
    
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

            <ScrollView contentContainerStyle={styles.mainContentContainer}>
                <View style={styles.logoContainer}>
                    <Image source={require('../assets/logo.png')} style={styles.logoImage} />
                </View>

                <View style={styles.searchContainer}>
                    <FontAwesome name="search" size={20} color="#aaa" style={styles.searchIcon} />
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder={activeSearchFilter === 'name' ? 'Buscar receta...' : 'Buscar usuario...'}
                        placeholderTextColor="#999"
                        value={searchText}
                        onChangeText={setSearchText}
                        onSubmitEditing={handleSearchSubmit}
                        returnKeyType="search"
                    />
                </View>
                <View style={styles.searchFilterContainer}>
                    <TouchableOpacity 
                        style={[styles.searchFilterButton, activeSearchFilter === 'name' && styles.searchFilterButtonActive]}
                        onPress={() => setActiveSearchFilter('name')} >
                        <Text style={[styles.searchFilterText, activeSearchFilter === 'name' && styles.searchFilterTextActive]}>Nombre Receta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.searchFilterButton, activeSearchFilter === 'author' && styles.searchFilterButtonActive]}
                        onPress={() => setActiveSearchFilter('author')} >
                        <Text style={[styles.searchFilterText, activeSearchFilter === 'author' && styles.searchFilterTextActive]}>Usuario</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.filterContainer}>
                    <View style={styles.dropdownContainer}>
                        <TouchableOpacity style={styles.dropdown} onPress={() => setIngredientFilterOpen(!isIngredientFilterOpen)}>
                            <Text style={styles.filterDropdownText}>{ingredientFilterMode}</Text>
                            <Ionicons name={isIngredientFilterOpen ? "chevron-up" : "chevron-down"} size={20} color="#888" />
                        </TouchableOpacity>
                        {isIngredientFilterOpen && (
                            <View style={styles.dropdownOptions}>
                                <TouchableOpacity style={styles.optionItem} onPress={() => handleIngredientFilterSelect('Con ingrediente')}><Text style={styles.optionText}>Con ingrediente</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.optionItem} onPress={() => handleIngredientFilterSelect('Sin ingrediente')}><Text style={styles.optionText}>Sin ingrediente</Text></TouchableOpacity>
                            </View>
                        )}
                    </View>
                    <TextInput 
                        style={styles.ingredientInput} 
                        placeholder="Ingrediente..." 
                        placeholderTextColor="#999"
                        value={ingredientSearchText}
                        onChangeText={setIngredientSearchText}
                        onSubmitEditing={handleIngredientSearchSubmit}
                        returnKeyType="search"
                    />
                </View>

                <View style={styles.carouselContainer}>
                    <FlatList
                        data={pages}
                        renderItem={({ item }) => 
                            <CategoryPage 
                                data={item} 
                                onCategoryPress={handleCategoryPress}
                                activeCategory={activeCategory}
                            />
                        }
                        keyExtractor={(item, index) => `page_${index}`}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
                
                <View style={styles.sortContainer}>
                    <TouchableOpacity onPress={() => setSortOrder('alpha_asc')} style={[styles.sortButton, sortOrder === 'alpha_asc' && styles.sortButtonActive]}>
                        <Text style={[styles.sortButtonText, sortOrder === 'alpha_asc' && styles.sortButtonTextActive]}>A-Z</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSortOrder('newest')} style={[styles.sortButton, sortOrder === 'newest' && styles.sortButtonActive]}>
                        <Text style={[styles.sortButtonText, sortOrder === 'newest' && styles.sortButtonTextActive]}>Más Nuevas</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSortOrder('oldest')} style={[styles.sortButton, sortOrder === 'oldest' && styles.sortButtonActive]}>
                        <Text style={[styles.sortButtonText, sortOrder === 'oldest' && styles.sortButtonTextActive]}>Más Antiguas</Text>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.recipeListContainer}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#6b8e23" />
                    ) : error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : recipes.length > 0 ? (
                        recipes.map(item => <RecipeCard item={item} key={item.id} />)
                    ) : (
                        <View style={styles.center}><Text>No se encontraron recetas.</Text></View>
                    )}
                    {!loading && !error && recipes.length > 0 && totalPages > 1 && (
                         <View style={styles.paginationContainer}>
                            <TouchableOpacity onPress={handlePrevPage} disabled={currentPage === 0}>
                                <Ionicons name="arrow-back-circle" size={40} color={currentPage === 0 ? '#ccc' : '#6b8e23'} />
                            </TouchableOpacity>
                            <Text style={styles.pageText}>Página {currentPage + 1} de {totalPages}</Text>
                            <TouchableOpacity onPress={handleNextPage} disabled={currentPage >= totalPages - 1}>
                                <Ionicons name="arrow-forward-circle" size={40} color={currentPage >= totalPages - 1 ? '#ccc' : '#6b8e23'} />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const screenWidth = Dimensions.get('window').width;
const HORIZONTAL_PADDINGS = 20;
const NUM_COLUMNS = 4;
const ITEM_MARGIN = 5;
const availableWidth = screenWidth - (HORIZONTAL_PADDINGS * 2);
const categoryItemWidth = (availableWidth / NUM_COLUMNS) - (ITEM_MARGIN * 2);

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainContentContainer: {
        paddingBottom: 40,
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
        marginTop: 20,
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
        paddingHorizontal: 15,
        marginTop: 20,
        marginHorizontal: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
        fontFamily: 'Inika-Regular',
    },
    searchFilterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginHorizontal: 20,
        marginTop: 15,
        marginBottom: 5,
    },
    searchFilterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
    },
    searchFilterButtonActive: {
        backgroundColor: '#6b8e23',
    },
    searchFilterText: {
        fontFamily: 'Inika-Regular',
        color: '#555',
    },
    searchFilterTextActive: {
        color: '#fff',
        fontFamily: 'Inika-Bold',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 15,
        gap: 10,
    },
    dropdownContainer: {
        flex: 1,
        position: 'relative',
    },
    dropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        height: 44,
    },
    filterDropdownText: {
        fontSize: 14,
        color: '#555',
        fontFamily: 'Inika-Regular',
        marginRight: 5,
    },
    ingredientInput: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        height: 44,
        fontSize: 14,
        color: '#333',
        fontFamily: 'Inika-Regular',
    },
    dropdownOptions: {
        position: 'absolute',
        top: '110%',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 3,
        zIndex: 10,
    },
    optionItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        fontFamily: 'Inika-Regular',
        fontSize: 14,
        color: '#555',
    },
    carouselContainer: {
        height: (categoryItemWidth + 30) * 2,
        marginTop: 10,
    },
    pageContainer: {
        width: screenWidth,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: HORIZONTAL_PADDINGS,
        justifyContent: 'flex-start',
    },
    categoryItem: {
        width: categoryItemWidth,
        height: categoryItemWidth + 20,
        marginHorizontal: ITEM_MARGIN,
        marginVertical: 5,
        alignItems: 'center',
    },
    categoryPlaceholder: {
        width: '100%',
        height: categoryItemWidth,
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    categoryActive: {
        borderColor: '#6b8e23',
    },
    categoryTextContainer: {
        height: 20,
        justifyContent: 'center',
    },
    categoryText: {
        fontFamily: 'Inika-Regular',
        fontSize: 12,
        textAlign: 'center',
    },
    sortContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    sortButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 20,
    },
    sortButtonActive: {
        backgroundColor: '#6b8e23',
    },
    sortButtonText: {
        fontFamily: 'Inika-Bold',
        color: '#555',
    },
    sortButtonTextActive: {
        color: '#fff',
    },
    recipeListContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
        minHeight: 200,
        justifyContent: 'center',
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
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 40,
    },
    pageText: {
        fontSize: 16,
        fontFamily: 'Inika-Bold',
        color: '#555',
    },
    card: {
        backgroundColor: '#fff7e6',
        borderRadius: 20,
        marginBottom: 20,
        flexDirection: 'row',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardContent: {
        flex: 1,
        padding: 20,
    },
    cardTitle: {
        fontSize: 20,
        fontFamily: 'Inika-Bold',
        color: '#5d4037',
        paddingRight: 15,
        paddingTop: 15,
    },
    bookmarkButton: {
        position: 'absolute',
        top: 15,
        right: 15,
    },
    cardImage: {
        width: 110,
        height: '100%',
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        backgroundColor: '#e0e0e0',
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

export default HomeScreen;
