import React, { useState, useEffect, useContext } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Platform,
    ImageBackground,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { getRecipeById, createReview } from './recipeService';
import { useFonts } from 'expo-font';
import { AuthContext } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker';

// --- Componente para la tarjeta de reseña (sin cambios) ---
const ReviewCard = ({ review }) => (
    <View style={styles.reviewCard}>
        <FontAwesome name="user-circle-o" size={30} color="#888" style={styles.reviewAvatar} />
        <View style={styles.reviewContent}>
            <Text style={styles.reviewAuthor}>{review.user?.username || 'Usuario'}</Text>
            <View style={styles.starContainer}>
                {[...Array(5)].map((_, i) => (
                    <FontAwesome
                        key={i}
                        name="star"
                        size={16}
                        color={i < review.rating ? '#ffc107' : '#e0e0e0'}
                    />
                ))}
            </View>
            <Text style={styles.reviewText}>{review.comment}</Text>
        </View>
    </View>
);

// --- Componente para el Modal de Reseñas ---
const ReviewModal = ({ visible, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        onSubmit(rating, comment);
        setRating(0);
        setComment('');
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>¡Dejanos tu reseña!</Text>
                    
                    {/* Sistema de calificación por estrellas */}
                    <View style={styles.modalStarsContainer}>
                        {[...Array(5)].map((_, index) => (
                            <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
                                <FontAwesome
                                    name={index < rating ? 'star' : 'star-o'}
                                    size={35}
                                    color={index < rating ? '#ffc107' : '#a9a9a9'}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TextInput
                        style={styles.modalInput}
                        placeholder="Escribe tu comentario aquí..."
                        placeholderTextColor="#999"
                        multiline
                        value={comment}
                        onChangeText={setComment}
                    />

                    <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.publishButton]} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Publicar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- Nuevo Componente para el Modal de Modificación de Cantidades ---
const ModifyIngredientsModal = ({ visible, onClose, recipe, onModify }) => {
    const [selectedIngredientLocal, setSelectedIngredientLocal] = useState('');
    const [ingredientQuantityLocal, setIngredientQuantityLocal] = useState('');
    const [numDinersLocal, setNumDinersLocal] = useState('');

    useEffect(() => {
        if (!visible) {
            setSelectedIngredientLocal('');
            setIngredientQuantityLocal('');
            setNumDinersLocal('');
        }
    }, [visible]);

    const handleIngredientChange = (value) => {
        setSelectedIngredientLocal(value);
        setIngredientQuantityLocal('');
    };

    const handleModify = () => {
        if (numDinersLocal) {
            const parsedNumDiners = parseFloat(numDinersLocal);
            if (isNaN(parsedNumDiners) || parsedNumDiners <= 0) {
                Alert.alert('Error', 'Por favor, ingresa un número de personas válido.');
                return;
            }
            onModify('diners', parsedNumDiners);
            onClose();
        } else if (selectedIngredientLocal && ingredientQuantityLocal) {
            const ingredientId = parseInt(selectedIngredientLocal);
            const quantity = parseFloat(ingredientQuantityLocal);
            if (isNaN(ingredientId) || isNaN(quantity) || quantity < 0) {
                Alert.alert('Error', 'Por favor, selecciona un ingrediente y/o ingresa una cantidad válida.');
                return;
            }
            onModify('ingredient', { id: ingredientId, quantity });
            onClose();
        } else {
            Alert.alert('Atención', 'Por favor, ingresa un valor en "Modificar por persona" o selecciona un ingrediente y su cantidad.');
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitleModify}>Modificar cantidades</Text>

                    <Text style={styles.modalSubtitle}>Modificar por ingrediente</Text>
                    <View style={styles.inputGroup}>
                        <Picker
                            selectedValue={selectedIngredientLocal}
                            style={styles.picker}
                            onValueChange={(itemValue) => handleIngredientChange(itemValue)}>
                            <Picker.Item label="Selecciona un ingrediente" value="" />
                            {recipe?.ingredients.map(material => (
                                <Picker.Item key={material.id} label={material.ingredient?.name || 'Ingrediente desconocido'} value={material.id.toString()} />
                            ))}
                        </Picker>
                        <TextInput
                            style={styles.modalInputSmall}
                            placeholder="Cantidad"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={ingredientQuantityLocal}
                            onChangeText={setIngredientQuantityLocal}
                        />
                    </View>

                    <Text style={styles.modalSubtitle}>Modificar por persona</Text>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Número de personas"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={numDinersLocal}
                        onChangeText={setNumDinersLocal}
                    />

                    <View style={styles.modalButtonsContainer}>
                        <TouchableOpacity style={[styles.modalButton, styles.publishButton]} onPress={handleModify}>
                            <Text style={styles.buttonText}>Aceptar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

// --- Componente Principal de la Pantalla ---
const InformacionRecetaScreen = ({ route, navigation }) => {
    const { recipeId } = route.params;
    const { userToken } = useContext(AuthContext);

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('Información');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isReviewModalVisible, setReviewModalVisible] = useState(false);
    const [isModifyModalVisible, setModifyModalVisible] = useState(false);

    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf'),
    });

    const fetchRecipe = async () => {
        try {
            setLoading(true);
            const response = await getRecipeById(recipeId);
            setRecipe(response.data);
        } catch (err) {
            console.error("Error al cargar la receta:", err);
            setError('No se pudo cargar la receta.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipe();
    }, [recipeId]);
    
    // Función para calcular el promedio de calificaciones
    const calculateAverageRating = () => {
        if (!recipe || !recipe.reviews || recipe.reviews.length === 0) {
            return 0;
        }
        const totalRating = recipe.reviews.reduce((sum, review) => sum + review.rating, 0);
        return (totalRating / recipe.reviews.length).toFixed(1); // Redondear a un decimal
    };

    const handleReviewSubmit = async (rating, comment) => {
        if (rating === 0) {
            Alert.alert('Error', 'Por favor, selecciona una valoración de estrellas.');
            return;
        }
        if (comment.trim() === '') {
            Alert.alert('Error', 'Por favor, escribe un comentario.');
            return;
        }

        try {
            if (!userToken) {
                Alert.alert('Error', 'Debes iniciar sesión para dejar una reseña.');
                return;
            }
            
            await createReview(userToken, recipeId, { rating, comment });
            setReviewModalVisible(false);
            fetchRecipe();
        } catch (error) {
        }
    };

    const handleModifyIngredients = (type, value) => {
        let updatedIngredients = [...recipe.ingredients];
        let updatedServings = recipe.servings;
        let updatedComensales = recipe.comensales;

        if (type === 'diners') {
            const newNumDiners = value;
            if (newNumDiners > 0 && recipe.comensales > 0) {
                const ratio = newNumDiners / recipe.comensales;
                updatedIngredients = recipe.ingredients.map(item => ({
                    ...item,
                    quantity: parseFloat((item.quantity * ratio).toFixed(2))
                }));
                updatedComensales = newNumDiners;
                updatedServings = parseFloat((recipe.servings * ratio).toFixed(2));
            } else if (newNumDiners <= 0) {
                Alert.alert('Atención', 'El número de personas debe ser mayor a cero.');
                return;
            }
        } else if (type === 'ingredient') {
            const { id, quantity } = value;
            updatedIngredients = recipe.ingredients.map(item =>
                item.id === id ? { ...item, quantity: parseFloat(quantity.toFixed(2)) } : item
            );
        }

        setRecipe(prevRecipe => ({
            ...prevRecipe,
            ingredients: updatedIngredients,
            servings: updatedServings,
            comensales: updatedComensales,
        }));
    };

    const renderContent = () => {
        return (
            <View style={{ paddingHorizontal: 20 }}>
                {activeTab === 'Información' ? (
                    <View>
                        <View style={styles.extraInfoContainer}>
                            <Text style={styles.extraInfoText}>Porciones: {recipe.servings} unidades</Text>
                            <Text style={styles.extraInfoText}>Personas: {recipe.comensales}</Text>
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ingredientes</Text>
                            {recipe.ingredients.map(material => (
                                <View key={material.id} style={styles.ingredientItem}>
                                    <Text style={styles.itemText}>• {material.ingredient?.name || 'Ingrediente'}</Text>
                                    <Text style={styles.itemQuantity}>{material.quantity} {material.unity?.description || ''}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Pasos</Text>
                            {recipe.description.sort((a, b) => a.numberOfStep - b.numberOfStep).map(step => (
                                <View key={step.id} style={styles.stepItem}>
                                    <Text style={styles.stepNumber}>{step.numberOfStep}.</Text>
                                    <Text style={styles.stepDescription}>{step.comment}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View style={styles.section}>
                        {recipe.reviews && recipe.reviews.length > 0 ? (
                            recipe.reviews.map(review => <ReviewCard key={review.id} review={review} />)
                        ) : (
                            <Text style={styles.noReviewsText}>Todavía no hay reseñas para esta receta.</Text>
                        )}
                    </View>
                )}
            </View>
        );
    };
    
    if (!fontsLoaded || loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#6b8e23" /></View>;
    }

    if (error) {
        return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
    }

    if (!recipe) {
        return <View style={styles.center}><Text>Receta no encontrada.</Text></View>;
    }

    const averageRating = calculateAverageRating();

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <ImageBackground source={{ uri: recipe.mainPicture || 'https://placehold.co/400x300' }} style={styles.mainImage}>
                    <View style={styles.imageOverlay}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                            <Ionicons name="arrow-back" size={28} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsBookmarked(!isBookmarked)} style={styles.iconButton}>
                            <FontAwesome name={isBookmarked ? 'bookmark' : 'bookmark-o'} size={26} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </ImageBackground>

                <View style={styles.contentContainer}>
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.title}>{recipe.recipeName}</Text>
                        {/* Mostrar el promedio de calificaciones aquí */}
                        {recipe.reviews && recipe.reviews.length > 0 ? (
                            <View style={styles.averageRatingContainer}>
                                <FontAwesome name="star" size={18} color="#ffc107" />
                                <Text style={styles.averageRatingText}>{averageRating}</Text>
                                <Text style={styles.reviewCountText}>({recipe.reviews.length} reseñas)</Text>
                            </View>
                        ) : (
                            <Text style={styles.noAverageRatingText}>Sin calificaciones aún</Text>
                        )}
                        <Text style={styles.description}>{recipe.descriptionGeneral}</Text>
                    </View>
                    
                    <View style={styles.tabContainer}>
                        <TouchableOpacity onPress={() => setActiveTab('Información')} style={[styles.tabButton, activeTab === 'Información' && styles.tabButtonActive]}>
                            <Text style={[styles.tabText, activeTab === 'Información' && styles.tabTextActive]}>Información</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('Reseñas')} style={[styles.tabButton, activeTab === 'Reseñas' && styles.tabButtonActive]}>
                            <Text style={[styles.tabText, activeTab === 'Reseñas' && styles.tabTextActive]}>Reseñas</Text>
                        </TouchableOpacity>
                    </View>
                    {renderContent()}
                </View>
            </ScrollView>
            
            {activeTab === 'Reseñas' && (
                 <TouchableOpacity style={styles.fab} onPress={() => setReviewModalVisible(true)}>
                    <FontAwesome name="pencil" size={24} color="#fff" />
                </TouchableOpacity>
            )}

            {activeTab === 'Información' && (
                <TouchableOpacity style={styles.fabModify} onPress={() => setModifyModalVisible(true)}>
                    <FontAwesome name="calculator" size={24} color="#fff" />
                </TouchableOpacity>
            )}

            <ReviewModal
                visible={isReviewModalVisible}
                onClose={() => setReviewModalVisible(false)}
                onSubmit={handleReviewSubmit}
            />

            <ModifyIngredientsModal
                visible={isModifyModalVisible}
                onClose={() => setModifyModalVisible(false)}
                recipe={recipe}
                onModify={handleModifyIngredients}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1 },
    mainImage: {
        width: '100%',
        height: 250,
    },
    imageOverlay: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? 40 : 50,
        backgroundColor: 'rgba(0,0,0,0.25)',
    },
    iconButton: {
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        paddingVertical: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        backgroundColor: '#fff',
    },
    descriptionContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EAEAEA',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        backgroundColor: '#fff',
    },
    title: {
        fontFamily: 'Inika-Bold',
        fontSize: 26,
        color: '#333',
        marginBottom: 8,
    },
    description: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    // Nuevos estilos para el promedio de calificaciones
    averageRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    averageRatingText: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#ffc107',
        marginLeft: 5,
        marginRight: 5,
    },
    reviewCountText: {
        fontFamily: 'Inika-Regular',
        fontSize: 14,
        color: '#888',
    },
    noAverageRatingText: {
        fontFamily: 'Inika-Regular',
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFFBF0',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 15,
        alignItems: 'center',
    },
    tabButtonActive: {
        borderBottomWidth: 3,
        borderBottomColor: '#6b8e23',
    },
    tabText: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: '#888',
    },
    tabTextActive: {
        fontFamily: 'Inika-Bold',
        color: '#333',
    },
    section: {
        paddingTop: 15,
    },
    sectionTitle: {
        fontFamily: 'Inika-Bold',
        fontSize: 20,
        color: '#444',
        marginBottom: 15,
    },
    ingredientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        paddingBottom: 10,
        marginBottom: 5,
    },
    itemText: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: '#555',
    },
    itemQuantity: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: '#888',
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    stepNumber: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#6b8e23',
        marginRight: 10,
    },
    stepDescription: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: '#555',
        flex: 1,
        lineHeight: 22,
    },
    reviewCard: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    reviewAvatar: {
        marginRight: 15,
    },
    reviewContent: {
        flex: 1,
    },
    reviewAuthor: {
        fontFamily: 'Inika-Bold',
        fontSize: 16,
        color: '#333',
    },
    starContainer: {
        flexDirection: 'row',
        marginVertical: 4,
    },
    reviewText: {
        fontFamily: 'Inika-Regular',
        fontSize: 15,
        color: '#666',
        lineHeight: 21,
    },
    noReviewsText: {
        fontFamily: 'Inika-Regular',
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    fab: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: '#fcc853',
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
    },
    fabModify: {
        position: 'absolute',
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 90,
        backgroundColor: '#8BC34A',
        borderRadius: 28,
        elevation: 8,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
    },
    errorText: {
        color: 'red',
        fontFamily: 'Inika-Regular',
    },
    extraInfoContainer: {
        paddingTop: 20,
        paddingBottom: 15,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    extraInfoText: {
        fontFamily: 'Inika-Bold',
        fontSize: 17,
        color: '#b58c49',
        marginBottom: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#FFFBF0',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontFamily: 'Inika-Bold',
        color: '#6b8e23',
        marginBottom: 20,
    },
    modalTitleModify: {
        fontSize: 24,
        fontFamily: 'Inika-Bold',
        color: '#8BC34A',
        marginBottom: 20,
    },
    modalStarsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
        marginBottom: 20,
    },
    modalInput: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#6b8e23',
        padding: 15,
        textAlignVertical: 'top',
        fontSize: 16,
        fontFamily: 'Inika-Regular',
        color: '#333',
        marginBottom: 20,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    publishButton: {
        backgroundColor: '#6b8e23',
    },
    cancelButton: {
        backgroundColor: '#a52a2a',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Inika-Bold',
    },
    modalSubtitle: {
        fontSize: 18,
        fontFamily: 'Inika-Bold',
        color: '#444',
        marginBottom: 10,
        alignSelf: 'flex-start',
        marginTop: 15,
    },
    inputGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
    },
    picker: {
        flex: 2,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#6b8e23',
        marginRight: 10,
        color: '#333',
    },
    modalInputSmall: {
        flex: 1,
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#6b8e23',
        padding: 10,
        fontSize: 16,
        fontFamily: 'Inika-Regular',
        color: '#333',
    },
});

export default InformacionRecetaScreen;