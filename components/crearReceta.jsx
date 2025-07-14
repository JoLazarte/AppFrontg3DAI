import React, { useState, useEffect, useRef, useContext } from 'react'; // Asegúrate de importar useContext
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
    TouchableWithoutFeedback,
    Alert,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

// Importa el AuthContext
import { AuthContext } from '../context/AuthContext'; // Asegúrate de que la ruta sea correcta

// Importa las funciones necesarias de tu recipeService
// getRecipeTypes, getUnits, createRecipe
import { getRecipeTypes, getUnits, createRecipe } from './recipeService';

const upload = require("../assets/upload-white.png");

const CrearReceta = () => {
    const navigation = useNavigation();
    // Obtener userToken del contexto. También user y authLoading son útiles
    const { userToken, isLoading: authLoading, user } = useContext(AuthContext);

    const [recipeName, setRecipeName] = useState('');
    const [descriptionGeneral, setDescriptionGeneral] = useState('');
    const [portions, setPortions] = useState('');
    const [servings, setServings] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unitId: null, unitName: '' }]);
    const [steps, setSteps] = useState([{ comment: '', imageUri: null }]);
    const [mainImage, setMainImage] = useState(null);

    const [isUnitDropdownVisible, setIsUnitDropdownVisible] = useState(false);
    const [unitDropdownPosition, setUnitDropdownPosition] = useState({ top: 0, left: 0 });
    const [currentIngredientIndexForUnit, setCurrentIngredientIndexForUnit] = useState(null);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [errorUnits, setErrorUnits] = useState(null);
    const dropdownRefs = useRef([]);

    const [selectedRecipeType, setSelectedRecipeType] = useState(null);
    const [isRecipeTypeDropdownVisible, setIsRecipeTypeDropdownVisible] = useState(false);
    const [recipeTypeDropdownPosition, setRecipeTypeDropdownPosition] = useState({ top: 0, left: 0 });
    const [availableRecipeTypes, setAvailableRecipeTypes] = useState([]);
    const [loadingRecipeTypes, setLoadingRecipeTypes] = useState(true);
    const [errorRecipeTypes, setErrorRecipeTypes] = useState(null);
    const recipeTypeButtonRef = useRef(null);

    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [saveSuccess, setSaveSuccess] = useState(null);

    const [fontsLoaded] = useFonts({
        'Inika-Regular': require('../assets/fonts/Inika-Regular.ttf'),
        'Inika-Bold': require('../assets/fonts/Inika-Bold.ttf')
    });

    useEffect(() => {
        // Solo intenta cargar los datos si no está autenticando y el token está disponible (si los GET son protegidos)
        // O si son permitAll(), entonces userToken no importa.
        // Aquí asumimos que getRecipeTypes y getUnits SON permitAll() como dijiste.
        const fetchInitialData = async () => {
            try {
                setLoadingRecipeTypes(true);
                setErrorRecipeTypes(null);
                // No pasamos userToken, ya que asumes que es permitAll()
                const typesResponse = await getRecipeTypes(); 
                setAvailableRecipeTypes(typesResponse.data); 
            } catch (err) {
                console.error("Error al cargar tipos de receta:", err);
                setErrorRecipeTypes(err.message || 'Error al cargar los tipos de receta.');
            } finally {
                setLoadingRecipeTypes(false);
            }

            try {
                setLoadingUnits(true);
                setErrorUnits(null);
                // No pasamos userToken, ya que asumes que es permitAll()
                const unitsResponse = await getUnits();
                setAvailableUnits(unitsResponse.data);
            } catch (err) {
                console.error("Error al cargar unidades:", err);
                setErrorUnits(err.message || 'Error al cargar las unidades.');
            } finally {
                setLoadingUnits(false);
            }
        };
        fetchInitialData();
    }, []); // Este efecto se ejecuta una sola vez al montar el componente, asumiendo permitAll()

    const pickMainImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso Requerido', 'Necesitamos acceso a tu galería para poder subir fotos.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 0.7,
        });
        if (!result.canceled) {
            setMainImage(result.assets[0].uri);
        }
    };

    const addIngredientField = () => {
        setIngredients([...ingredients, { name: '', quantity: '', unitId: null, unitName: '' }]);
    };

    const handleIngredientChange = (text, index, field) => {
        const newIngredients = [...ingredients];
        newIngredients[index][field] = text;
        setIngredients(newIngredients);
    };

    const removeIngredientField = (indexToRemove) => {
        setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
    };

    const handleUnitSelect = (unitObject) => {
        const newIngredients = [...ingredients];
        newIngredients[currentIngredientIndexForUnit].unitId = unitObject.id;
        newIngredients[currentIngredientIndexForUnit].unitName = unitObject.description;
        setIngredients(newIngredients);
        setIsUnitDropdownVisible(false);
    };

    const toggleUnitDropdown = (index) => {
        setCurrentIngredientIndexForUnit(index);
        dropdownRefs.current[index]?.measure((fx, fy, width, height, px, py) => {
            setUnitDropdownPosition({ top: py + height, left: px });
            setIsUnitDropdownVisible(true);
        });
    };

    const handleCloseUnitDropdown = () => {
        setIsUnitDropdownVisible(false);
    };

    const addStepField = () => {
        setSteps([...steps, { comment: '', imageUri: null }]);
    };

    const handleStepCommentChange = (text, index) => {
        const newSteps = [...steps];
        newSteps[index].comment = text;
        setSteps(newSteps);
    };

    const pickStepImage = async (index) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permiso Requerido', 'Necesitamos acceso a tu galería para poder subir fotos para los pasos.');
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 0.7,
        });
        if (!result.canceled) {
            const asset = result.assets[0];
            const newSteps = [...steps];
            newSteps[index].imageUri = asset.uri;
            setSteps(newSteps);
        }
    };

    const removeStepField = (indexToRemove) => {
        setSteps(steps.filter((_, index) => index !== indexToRemove));
    };

    const toggleRecipeTypeDropdown = () => {
        if (selectedRecipeType || loadingRecipeTypes) return;
        recipeTypeButtonRef.current?.measure((fx, fy, width, height, px, py) => {
            setRecipeTypeDropdownPosition({ top: py, left: px + width + 10 });
            setIsRecipeTypeDropdownVisible(true);
        });
    };

    const handleRecipeTypeSelect = (type) => {
        setSelectedRecipeType(type);
        setIsRecipeTypeDropdownVisible(false);
    };

    const removeRecipeType = () => {
        setSelectedRecipeType(null);
        setIsRecipeTypeDropdownVisible(false);
    };

    const handleSaveRecipe = async () => {
        setSaveError(null);
        setSaveSuccess(null);
        setIsSaving(true);

        // Validaciones
        const trimmedRecipeName = recipeName.trim();
        if (!trimmedRecipeName) {
            setSaveError('El nombre de la receta es obligatorio.');
            setIsSaving(false);
            return;
        }
        if (!mainImage) {
            setSaveError('Debe subir una foto principal para la receta.');
            setIsSaving(false);
            return;
        }
        if (!selectedRecipeType) {
            setSaveError('Debe seleccionar un tipo de receta.');
            setIsSaving(false);
            return;
        }
        const parsedPortions = parseInt(portions);
        if (isNaN(parsedPortions) || parsedPortions <= 0) {
            setSaveError('El número de porciones debe ser un número válido mayor a 0.');
            setIsSaving(false);
            return;
        }
        const parsedServings = parseInt(servings);
        if (isNaN(parsedServings) || parsedServings <= 0) {
            setSaveError('La cantidad de personas debe ser un número válido mayor a 0.');
            setIsSaving(false);
            return;
        }
        if (ingredients.some(ing => !ing.name.trim() || !ing.quantity || isNaN(ing.quantity) || parseFloat(ing.quantity) <= 0 || ing.unitId === null)) {
            setSaveError('Todos los ingredientes deben tener nombre, cantidad válida y unidad seleccionada.');
            setIsSaving(false);
            return;
        }
        if (steps.some(step => !step.comment.trim())) {
            setSaveError('Todos los pasos deben tener una descripción.');
            setIsSaving(false);
            return;
        }

        // --- VERIFICAR TOKEN ANTES DE ENVIAR LA RECETA (CRÍTICO) ---
        // userToken es del contexto. Si no hay token, no podemos guardar.
        if (!userToken) {
            setSaveError('No hay usuario autenticado. Inicie sesión para guardar la receta.');
            setIsSaving(false);
            return;
        }

        // Preparar los datos para el backend
        const recipeData = {
            recipeName: trimmedRecipeName,
            mainPicture: mainImage,
            descriptionGeneral: descriptionGeneral,
            servings: parsedPortions,
            cantidadPersonas: parsedServings,
            typeOfRecipeId: selectedRecipeType.id,
            ingredients: ingredients.map(ing => ({
                ingredientName: ing.name.trim(),
                unitId: ing.unitId,
                quantity: parseFloat(ing.quantity),
                observation: "",
            })),
            steps: steps.map((step, idx) => ({
                numberOfStep: idx + 1,
                comment: step.comment.trim(),
                imagenPaso: step.imageUri,
                videoPaso: null,
            })),
        };

        try {
            // Llamar a createRecipe. ¡Ahora el token se pasa como primer argumento!
            const response = await createRecipe(
                userToken, // <--- PASAR EL TOKEN AQUÍ
                recipeData,
                recipeData.mainPicture // Esto es mainImageUri
            );

            console.log("Receta guardada exitosamente:", response);
            setSaveSuccess('¡Receta guardada con éxito!');
            resetForm();
        } catch (err) {
            console.error("Error al guardar receta:", err);
            setSaveError(err.message || 'Error desconocido al guardar la receta. Inténtalo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setRecipeName('');
        setDescriptionGeneral('');
        setPortions('');
        setServings('');
        setIngredients([{ name: '', quantity: '', unitId: null, unitName: '' }]);
        setSteps([{ comment: '', imageUri: null }]);
        setMainImage(null);
        setSelectedRecipeType(null);
        setIsSaving(false);
        setSaveError(null);
        setSaveSuccess(null);
        setIsUnitDropdownVisible(false);
        setIsRecipeTypeDropdownVisible(false);
        setCurrentIngredientIndexForUnit(null);
    };


    if (!fontsLoaded) return null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={32} color="#333" />
                    </TouchableOpacity>
                    <View style={{ width: 32 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.logoPlaceholder}>
                        <Image source={require('../assets/logo.png')} style={styles.logoImage} />
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Ingrese el nombre de la receta</Text>
                        <TextInput style={styles.input} value={recipeName} onChangeText={setRecipeName} />

                        <Text style={[styles.label, { marginTop: 25 }]}>Foto principal</Text>
                        <TouchableOpacity
                            style={[styles.uploadButton, { paddingVertical: 15, marginBottom: 20 }]}
                            onPress={pickMainImage}
                        >
                            {mainImage ? (
                                <Image source={{ uri: mainImage }} style={styles.selectedImage} />
                            ) : (
                                <Image source={upload} style={styles.uploadIcon} />
                            )}
                        </TouchableOpacity>

                        <Text style={[styles.label, { marginTop: 20 }]}>Ingrese descripción</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            value={descriptionGeneral}
                            onChangeText={setDescriptionGeneral}
                            placeholder="Descripción general de la receta..."
                        />

                        <Text style={[styles.label, { marginTop: 20 }]}>Elija tipo de receta</Text>
                        <View style={styles.recipeTypeContainer}>
                            {loadingRecipeTypes ? (
                                <Text style={styles.loadingText}>Cargando tipos de receta...</Text>
                            ) : errorRecipeTypes ? (
                                <Text style={styles.errorText}>{errorRecipeTypes}</Text>
                            ) : selectedRecipeType ? (
                                <View style={styles.selectedRecipeTypeTag}>
                                    <Text style={styles.selectedRecipeTypeText}>{selectedRecipeType.name}</Text>
                                    <TouchableOpacity onPress={removeRecipeType} style={styles.removeRecipeTypeButton}>
                                        <Ionicons name="close-circle" size={20} color="#777" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    ref={recipeTypeButtonRef}
                                    style={styles.addRecipeTypeButton}
                                    onPress={toggleRecipeTypeDropdown}
                                    disabled={availableRecipeTypes.length === 0}
                                >
                                    <Ionicons name="add" size={24} color="#3C7E0E" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={[styles.row, { marginTop: 20, marginBottom: 10 }]}>
                            <View style={styles.inputGroup}>
                                <TextInput style={styles.input} placeholder="Porciones" value={portions} onChangeText={setPortions} keyboardType="numeric" />
                            </View>
                            <View style={styles.inputGroup}>
                                <TextInput style={styles.input} placeholder="Personas" value={servings} onChangeText={setServings} keyboardType="numeric" />
                            </View>
                        </View>

                        <Text style={[styles.label, { marginTop: 20 }]}>Ingredientes</Text>
                        {ingredients.map((ing, index) => (
                            <View style={[styles.row, { marginBottom: 10 }]} key={index}>
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Ingrediente"
                                        value={ing.name}
                                        onChangeText={(text) => handleIngredientChange(text, index, 'name')}
                                    />
                                </View>
                                <View style={styles.inputGroupWithButton}>
                                    <TextInput
                                        style={[styles.input, { flex: 1 }]}
                                        placeholder="Cantidad"
                                        value={ing.quantity}
                                        onChangeText={(text) => handleIngredientChange(text, index, 'quantity')}
                                        keyboardType="numeric"
                                    />
                                    <TouchableOpacity
                                        ref={el => dropdownRefs.current[index] = el}
                                        style={styles.dropdownToggleButton}
                                        onPress={() => toggleUnitDropdown(index)}
                                        disabled={availableUnits.length === 0 || loadingUnits}
                                    >
                                        <Text style={styles.dropdownToggleText}>
                                            {ing.unitName || (loadingUnits ? 'Cargando...' : '')}
                                        </Text>
                                        <Ionicons name="chevron-down" size={20} color="#3C7E0E" />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.addIngredientButton} onPress={addIngredientField}>
                                        <Ionicons name="add" size={24} color="#fff" />
                                    </TouchableOpacity>
                                    {ingredients.length > 1 && (
                                        <TouchableOpacity style={styles.removeButton} onPress={() => removeIngredientField(index)}>
                                            <Ionicons name="remove-circle" size={24} color="red" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}

                        {errorUnits && <Text style={[styles.errorText, {textAlign: 'left'}]}>Error al cargar unidades: {errorUnits}</Text>}


                        <Text style={[styles.label, { marginTop: 20 }]}>Pasos</Text>
                        {steps.map((step, index) => (
                            <View key={index} style={styles.stepContainer}>
                                <View style={styles.stepHeader}>
                                    <Text style={styles.stepNumber}>Paso {index + 1}</Text>
                                    {steps.length > 1 && (
                                        <TouchableOpacity onPress={() => removeStepField(index)} style={styles.removeStepButton}>
                                            <Ionicons name="close-circle" size={24} color="red" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <TextInput
                                    style={[styles.input, styles.textAreaSmall]}
                                    multiline
                                    placeholder="Descripción del paso"
                                    value={step.comment}
                                    onChangeText={(text) => handleStepCommentChange(text, index)}
                                />
                                <TouchableOpacity
                                    style={styles.uploadStepImageButton}
                                    onPress={() => pickStepImage(index)}
                                >
                                    {step.imageUri ? (
                                        <Image source={{ uri: step.imageUri }} style={styles.stepImagePreview} />
                                    ) : (
                                        <>
                                            <Ionicons name="image" size={24} color="#3C7E0E" />
                                            <Text style={styles.uploadStepImageText}>Añadir imagen (opcional)</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={[styles.actionButton, { marginTop: 10 }]} onPress={addStepField}>
                            <Text style={styles.actionButtonText}>Agregar paso</Text>
                        </TouchableOpacity>

                        {/* Mensajes de feedback de guardado */}
                        {isSaving && <Text style={styles.loadingText}>Guardando receta...</Text>}
                        {saveError && <Text style={styles.errorText}>{saveError}</Text>}
                        {saveSuccess && <Text style={styles.successText}>{saveSuccess}</Text>}

                        <TouchableOpacity
                            style={[styles.actionButton, { marginTop: 20, marginBottom: 40 }]}
                            onPress={handleSaveRecipe}
                            disabled={isSaving}
                        >
                            <Text style={styles.actionButtonText}>
                                {isSaving ? 'Guardando...' : 'Guardar receta'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                {/* --- Dropdown de Unidades (dinámico) --- */}
                {isUnitDropdownVisible && currentIngredientIndexForUnit !== null && (
                    <TouchableWithoutFeedback onPress={handleCloseUnitDropdown}>
                        <View style={styles.dropdownOverlay}>
                            <View style={[styles.dropdownContainer, { top: unitDropdownPosition.top, left: unitDropdownPosition.left }]}>
                                {availableUnits.length > 0 ? (
                                    availableUnits.map((unitObject) => (
                                        <TouchableOpacity
                                            key={unitObject.id}
                                            style={styles.dropdownItem}
                                            onPress={() => handleUnitSelect(unitObject)}
                                        >
                                            <Text style={styles.dropdownItemText}>{unitObject.description}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.dropdownItem}>
                                        <Text style={styles.dropdownItemText}>No hay unidades disponibles</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                )}
                {/* --- FIN Dropdown de Unidades --- */}

                {/* Dropdown de Tipos de Receta (dinámico) */}
                {isRecipeTypeDropdownVisible && (
                    <TouchableWithoutFeedback onPress={() => setIsRecipeTypeDropdownVisible(false)}>
                        <View style={styles.dropdownOverlay}>
                            <View style={[styles.recipeTypeDropdownContainer, { top: recipeTypeDropdownPosition.top, left: recipeTypeDropdownPosition.left }]}>
                                {availableRecipeTypes.length > 0 ? (
                                    availableRecipeTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type.id}
                                            style={styles.dropdownItem}
                                            onPress={() => handleRecipeTypeSelect(type)}
                                        >
                                            <Text style={styles.dropdownItemText}>{type.name}</Text>
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View style={styles.dropdownItem}>
                                        <Text style={styles.dropdownItemText}>No hay tipos disponibles</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 45 : 20,
        paddingBottom: 20,
        backgroundColor: '#fcc853',
        paddingHorizontal: 20
    },
    headerTitle: {
        fontFamily: 'Inika-Bold',
        fontSize: 20,
        color: '#333',
    },
    scrollContent: {
        paddingBottom: 20
    },
    logoPlaceholder: {
        alignSelf: 'center',
        marginVertical: 20
    },
    logoImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain'
    },
    formContainer: {
        paddingHorizontal: 20
    },
    label: {
        fontFamily: 'Inika-Bold',
        fontSize: 18,
        color: '#3C7E0E',
        marginTop: 10,
        marginBottom: 5
    },
    input: {
        fontFamily: 'Inika-Regular',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        borderWidth: 2,
        borderColor: '#3C7E0E'
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top'
    },
    textAreaSmall: {
        height: 80,
        textAlignVertical: 'top',
        marginBottom: 10,
    },
    uploadButton: {
        backgroundColor: '#679F40',
        borderRadius: 10,
        padding: 5,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#a5d6a7'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    inputGroup: {
        width: '48%'
    },
    inputGroupWithButton: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    addIngredientButton: {
        backgroundColor: '#679F40',
        borderRadius: 10,
        padding: 10,
        marginLeft: 5,
        justifyContent: 'center'
    },
    removeButton: {
        padding: 5,
        marginLeft: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        backgroundColor: '#679F40',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10
    },
    actionButtonText: {
        fontFamily: 'Inika-Bold',
        fontSize: 16,
        color: '#fff'
    },
    selectedImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    uploadIcon: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    dropdownToggleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: '#3C7E0E',
        flex: 1,
        marginLeft: 5,
    },
    dropdownToggleText: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: '#333',
    },
    dropdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0)',
        zIndex: 1,
    },
    dropdownContainer: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#3C7E0E',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 2,
        minWidth: 100,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    dropdownItemText: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: '#333',
    },
    recipeTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        marginBottom: 15,
    },
    addRecipeTypeButton: {
        width: 50,
        height: 50,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3C7E0E',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    selectedRecipeTypeTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderWidth: 2,
        borderColor: '#3C7E0E',
    },
    selectedRecipeTypeText: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: '#333',
        marginRight: 5,
    },
    removeRecipeTypeButton: {
        padding: 5,
    },
    recipeTypeDropdownContainer: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#3C7E0E',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 2,
        minWidth: 150,
    },
    loadingText: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: '#007BFF',
        textAlign: 'center',
        flex: 1,
        marginLeft: 10,
    },
    errorText: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
        flex: 1,
        marginLeft: 10,
    },
    successText: {
        fontFamily: 'Inika-Regular',
        fontSize: 16,
        color: 'green',
        textAlign: 'center',
        flex: 1,
        marginLeft: 10,
    },
    stepContainer: {
        borderWidth: 2,
        borderColor: '#3C7E0E',
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
    },
    stepHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    stepNumber: {
        fontFamily: 'Inika-Bold',
        fontSize: 16,
        color: '#3C7E0E',
    },
    removeStepButton: {
        padding: 5,
    },
    uploadStepImageButton: {
        backgroundColor: '#E6FFE6',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#a5d6a7',
        height: 100,
    },
    uploadStepImageText: {
        fontFamily: 'Inika-Regular',
        fontSize: 14,
        color: '#3C7E0E',
        marginTop: 5,
    },
    stepImagePreview: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
        resizeMode: 'cover',
    }
});

export default CrearReceta;