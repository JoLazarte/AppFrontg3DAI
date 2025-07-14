import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Pressable, TextInput, FlatList, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { useFonts } from 'expo-font';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { getAllRecipes, findRecipesByName } from './recipeService';
import { useNavigation } from '@react-navigation/native';

// Componente RecipeCard (manteniendo los estilos de Home.jsx)
const RecipeCard = ({ item }) => {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const navigation = useNavigation();

    const toggleBookmark = (e) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
    };

    const handleNavigate = () => {
        navigation.navigate('InformacionReceta', { recipeId: item.id });
    };

    return (
        <TouchableOpacity onPress={handleNavigate}>
            <View style={styles.card}>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.recipeName}</Text>
                </View>
                <Image
                    source={{ uri: item.mainPicture || 'https://placehold.co/110x150/fff7e6/5d4037?text=Receta' }}
                    style={styles.cardImage}
                />
            </View>
        </TouchableOpacity>
    );
};

export default function Invitados({ navigation }) {
    const insets = useSafeAreaInsets();
    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf')
    });

    const [searchText, setSearchText] = useState('');
    const [currentSearchQuery, setCurrentSearchQuery] = useState(''); // New state for triggering search
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortOrder, setSortOrder] = useState('alpha_asc');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchRecipes = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = currentSearchQuery // Use currentSearchQuery here
                    ? await findRecipesByName(currentSearchQuery, sortOrder, currentPage)
                    : await getAllRecipes(sortOrder, currentPage);

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
    }, [sortOrder, currentPage, currentSearchQuery]); // <--- dependency changed to currentSearchQuery

    const handleSearchSubmit = () => {
        setCurrentPage(0);
        setCurrentSearchQuery(searchText); // Trigger search by updating currentSearchQuery
    };

    // This handles the clear functionality for the search bar, if you decide to implement it
    const handleClearSearch = () => {
        setSearchText('');
        setCurrentSearchQuery(''); // Clear the actual search query
        setCurrentPage(0); // Reset page when clearing search
    };

    const handleNextPage = () => { if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 0) setCurrentPage(currentPage - 1); };

    if (!fontsLoaded) {
        return null;
    }

    const handleNavigateToInicio = () => {
        navigation.navigate('Inicio');
    }

    // Header para el FlatList
    const ListHeader = () => (
        <>
            <View style={styles.logoContainer}>
                <Image source={require('../assets/logo.png')} style={styles.logoImage} />
            </View>

            <View style={styles.searchContainer}>
                <FontAwesome name="search" size={20} color="#aaa" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar receta..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText} // Only update searchText state
                    onSubmitEditing={handleSearchSubmit} // Trigger search only on submit
                    returnKeyType="search"
                />
                {/* Optional: Add a clear button */}
                {searchText.length > 0 && (
                    <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                        <Ionicons name="close-circle" size={20} color="#aaa" />
                    </TouchableOpacity>
                )}
            </View>
            {/* Mensajes de estado antes de la lista */}
            {loading && <ActivityIndicator size="large" color="#6b8e23" style={styles.statusIndicator} />}
            {error && <Text style={styles.errorText}>{error}</Text>}
            {!loading && !error && recipes.length === 0 && (
                <View style={styles.center}><Text>No se encontraron recetas.</Text></View>
            )}
        </>
    );

    // Footer para el FlatList
    const ListFooter = () => (
        <>
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
        </>
    );

    return (
        <View style={styles.mainContainer}>
            {/* Barra superior fija */}
            <View style={styles.Barra}>
                <Pressable style={styles.botonIngresar} onPress={handleNavigateToInicio}>
                    <Text style={styles.textoBoton}>Ingresar</Text>
                </Pressable>
            </View>

            {/* FlatList que maneja el desplazamiento de todo el contenido dinámico */}
            <FlatList
                data={recipes}
                renderItem={({ item }) => <RecipeCard item={item} />}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.recipeListContent}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
            />
        </View>
    )
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create(
    {
        mainContainer: {
            flex: 1,
            backgroundColor: '#F5C444',
        },
        Barra: {
            backgroundColor: '#F5C444',
            width: '100%',
            height: 100,
            justifyContent: 'flex-end',
            paddingBottom: 10,
            paddingHorizontal: 15,
        },
        botonIngresar: {
            backgroundColor: '#C38D17',
            width: 150,
            borderRadius: 20,
            height: 35,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'flex-start'
        },
        textoBoton: {
            fontFamily: 'Inika-Regular',
            color: '#FFFFFF'
        },
        logoContainer: {
            alignSelf: 'center',
            marginTop: 20,
            marginBottom: 20,
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
            marginHorizontal: 20,
            marginBottom: 20,
            width: screenWidth * 0.9,
            alignSelf: 'center'
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
        clearButton: {
            paddingLeft: 10,
            paddingVertical: 5,
        },
        recipeListContent: {
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 20,
            paddingTop: 0,
            paddingBottom: 20,
        },
        flatListContent: {
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 20,
            paddingTop: 0,
            paddingBottom: 20,
            alignItems: 'center',
        },
        statusIndicator: {
            marginTop: 20,
            marginBottom: 20,
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
            marginTop: 20,
            marginBottom: 20,
        },
        paginationContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 40,
            width: '100%',
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
            zIndex: 1,
        },
        cardImage: {
            width: 110,
            height: '100%',
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
            backgroundColor: '#e0e0e0',
        },
    }
);