import React, { useState, useEffect, useRef, useContext } from 'react';
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
    ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { AuthContext } from '../context/AuthContext';
// ** Solo importamos las funciones necesarias para EDITAR **
import { getRecipeTypes, getUnits, updateRecipe } from './recipeService';

const upload = require("../assets/upload-white.png");
const DEFAULT_PLACEHOLDER_IMAGE = require('../assets/imagenNodisponible.png');

// ** COMPONENTE DEDICADO A LA EDICIÓN DE RECETAS **
const EditarReceta = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // ** OBTENER LA RECETA A EDITAR Y ASUMIR MODO 'edit' **
    // `recipeToEdit` debería contener toda la información de la receta seleccionada en 'MisRecetas'.
    const { recipeToEdit, mode } = route.params || {};

    // Validación temprana: Este componente solo funciona en modo 'edit' y con una receta válida
    useEffect(() => {
        if (!recipeToEdit || mode !== 'edit') {
            Alert.alert("Error", "No se encontró una receta válida para editar.");
            navigation.goBack(); // Redirige si no se cumplen las condiciones
        }
    }, [recipeToEdit, mode, navigation]);

    const { userToken, user } = useContext(AuthContext);

    // ** ESTADOS INICIALIZADOS CON LOS DATOS DE `recipeToEdit` **
    const [recipeName, setRecipeName] = useState(recipeToEdit?.recipeName || '');
    const [descriptionGeneral, setDescriptionGeneral] = useState(recipeToEdit?.descriptionGeneral || '');
    
    const [portions, setPortions] = useState(recipeToEdit?.servings?.toString() || '');
    const [servings, setServings] = useState(recipeToEdit?.comensales?.toString() || ''); 

    const [ingredients, setIngredients] = useState(() => {
        if (recipeToEdit?.ingredients && recipeToEdit.ingredients.length > 0) {
            return recipeToEdit.ingredients.map(ing => ({
                id: ing.id, // ¡Mantener el ID es crucial para la actualización en el backend!
                name: ing.ingredient?.name || '', 
                quantity: ing.quantity?.toString() || '',
                unitId: ing.unity?.id || null,
                unitName: ing.unity?.description || ''
            }));
        }
        return [{ name: '', quantity: '', unitId: null, unitName: '' }]; // Proporciona un campo inicial vacío
    });

    const [steps, setSteps] = useState(() => {
        if (recipeToEdit?.description && recipeToEdit.description.length > 0) {
            return recipeToEdit.description.map(step => ({ 
                id: step.id, // ¡Mantener el ID es crucial para la actualización en el backend!
                comment: step.comment || '',
                imageUri: step.imagenPaso || null
            }));
        }
        return [{ comment: '', imageUri: null }]; // Proporciona un campo inicial vacío
    });
    
    const [mainImage, setMainImage] = useState(recipeToEdit?.mainPicture || null);

    const [isUnitDropdownVisible, setIsUnitDropdownVisible] = useState(false);
    const [unitDropdownPosition, setUnitDropdownPosition] = useState({ top: 0, left: 0 });
    const [currentIngredientIndexForUnit, setCurrentIngredientIndexForUnit] = useState(null);
    const [availableUnits, setAvailableUnits] = useState([]);
    const [loadingUnits, setLoadingUnits] = useState(true);
    const [errorUnits, setErrorUnits] = useState(null);
    const dropdownRefs = useRef([]);

    const [selectedRecipeType, setSelectedRecipeType] = useState(recipeToEdit?.typeOfRecipe || null); 
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
        const fetchInitialData = async () => {
            // Cargar tipos de receta y unidades
            try {
                setLoadingRecipeTypes(true);
                setErrorRecipeTypes(null);
                const typesResponse = await getRecipeTypes();
                setAvailableRecipeTypes(typesResponse.data);
                // Pre-seleccionar el tipo de receta si estamos editando
                if (recipeToEdit && typesResponse.data && recipeToEdit.typeOfRecipe) {
                    const foundType = typesResponse.data.find(type => type.id === recipeToEdit.typeOfRecipe.id);
                    if (foundType) {
                        setSelectedRecipeType(foundType);
                    }
                }
            } catch (err) {
                console.error("Error al cargar tipos de receta:", err);
                setErrorRecipeTypes(err.message || 'Error al cargar los tipos de receta.');
            } finally {
                setLoadingRecipeTypes(false);
            }

            try {
                setLoadingUnits(true);
                setErrorUnits(null);
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
    }, [recipeToEdit]); // `recipeToEdit` como dependencia para inicializar al recibir los datos

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
            base64: true,
        });
        if (!result.canceled) {
            setMainImage(`data:image/jpeg;base64,${result.assets[0].base64}`); 
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
            base64: true,
        });
        if (!result.canceled) {
            const asset = result.assets[0];
            const newSteps = [...steps];
            newSteps[index].imageUri = `data:image/jpeg;base64,${asset.base64}`; 
            setSteps(newSteps);
        }
    };

    const removeStepField = (indexToRemove) => {
        setSteps(steps.filter((_, index) => index !== indexToRemove));
    };

    const toggleRecipeTypeDropdown = () => {
        if (selectedRecipeType || loadingRecipeTypes) return; // Si ya hay uno seleccionado o está cargando, no abre
        recipeTypeButtonRef.current?.measure((fx, fy, width, height, px, py) => {
            setRecipeTypeDropdownPosition({ top: py, left: px + width + 10 }); // Posiciona el dropdown
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

    // ** FUNCIÓN DEDICADA EXCLUSIVAMENTE A LA ACTUALIZACIÓN DE RECETAS **
    const handleUpdateRecipe = async () => {
        setSaveError(null);
        setSaveSuccess(null);
        setIsSaving(true);

        // Validaciones (esenciales para asegurar datos correctos antes de enviar al backend)
        const trimmedRecipeName = recipeName.trim();
        if (!trimmedRecipeName) { setSaveError('El nombre de la receta es obligatorio.'); setIsSaving(false); return; }
        if (!mainImage) { setSaveError('Debe subir una foto principal para la receta.'); setIsSaving(false); return; }
        if (!selectedRecipeType) { setSaveError('Debe seleccionar un tipo de receta.'); setIsSaving(false); return; }
        const parsedPortions = parseInt(portions);
        if (isNaN(parsedPortions) || parsedPortions <= 0) { setSaveError('El número de porciones debe ser un número válido mayor a 0.'); setIsSaving(false); return; }
        const parsedServings = parseInt(servings);
        if (isNaN(parsedServings) || parsedServings <= 0) { setSaveError('La cantidad de personas debe ser un número válido mayor a 0.'); setIsSaving(false); return; }
        if (ingredients.some(ing => !ing.name.trim() || !ing.quantity || isNaN(ing.quantity) || parseFloat(ing.quantity) <= 0 || ing.unitId === null)) { setSaveError('Todos los ingredientes deben tener nombre, cantidad válida y unidad seleccionada.'); setIsSaving(false); return; }
        if (steps.some(step => !step.comment.trim())) { setSaveError('Todos los pasos deben tener una descripción.'); setIsSaving(false); return; }
        if (!userToken) { setSaveError('No hay usuario autenticado. Inicie sesión para actualizar la receta.'); setIsSaving(false); return; }
        console.log("Token de usuario enviado:", userToken);
        
        // ** Construcción del payload para el backend **
        const recipePayload = {
            id: recipeToEdit.id, // ¡ESENCIAL! El ID de la receta para el backend
            recipeName: trimmedRecipeName,
            mainPicture: mainImage, // La imagen principal ya debería estar en base64 si fue seleccionada
            descriptionGeneral: descriptionGeneral,
            servings: parsedPortions,
            cantidadPersonas: parsedServings,
            typeOfRecipeId: selectedRecipeType.id,
            
            ingredients: ingredients.map(ing => ({
                id: ing.id, // Envía el ID existente si lo tiene (para actualizar o mantener)
                ingredientName: ing.name.trim(), // `ingredientName` para tu backend
                unitId: ing.unitId,
                quantity: parseFloat(ing.quantity),
                observation: "", // Si no se maneja en el frontend, se envía vacío
            })),
            
            steps: steps.map((step, idx) => ({
                id: step.id, // Envía el ID existente si lo tiene (para actualizar o mantener)
                numberOfStep: idx + 1, // El orden se define por el índice actual
                comment: step.comment.trim(),
                imagenPaso: step.imageUri, // La imagen del paso ya debería estar en base64
                videoPaso: null, // Si no se maneja en el frontend, se envía null
            })),
        };

        try {
            console.log("Enviando actualización de receta (JSON):", recipePayload);
            // ** LLAMADA A LA FUNCIÓN `updateRecipe` DEL recipeService **
            const response = await updateRecipe(recipeToEdit.id, recipePayload, userToken);
            setSaveSuccess('¡Receta actualizada con éxito!');
            console.log("Respuesta del backend:", response);
            navigation.goBack(); // Regresar a la pantalla anterior (MisRecetas)
        } catch (err) {
            console.error("Error al actualizar receta:", err.response?.data || err.message || err);
            setSaveError(err.response?.data?.message || err.message || 'Error desconocido al actualizar. Inténtalo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const getDisplayImageSource = (imageUri) => {
        if (imageUri && (imageUri.startsWith('data:image') || imageUri.startsWith('http'))) {
            return { uri: imageUri };
        }
        return DEFAULT_PLACEHOLDER_IMAGE;
    };

    if (!fontsLoaded || !recipeToEdit) { // Asegurarse de que las fuentes estén cargadas y la receta esté disponible
        return <ActivityIndicator size="large" color="#6b8e23" style={styles.loadingScreen} />;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={32} color="#333" />
                    </TouchableOpacity>
                    {/* ** Título específico para Editar Receta ** */}
                    <Text style={styles.headerTitle}>
                        Editar Receta
                    </Text> 
                    <View style={{ width: 32 }} /> 
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.logoPlaceholder}>
                        <Image source={require('../assets/logo.png')} style={styles.logoImage} />
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.label}>Nombre de la receta</Text>
                        <TextInput style={styles.input} value={recipeName} onChangeText={setRecipeName} />

                        <Text style={[styles.label, { marginTop: 25 }]}>Foto principal</Text>
                        <TouchableOpacity
                            style={[styles.uploadButton, { paddingVertical: 15, marginBottom: 20 }]}
                            onPress={pickMainImage}
                        >
                            {mainImage ? (
                                <Image source={getDisplayImageSource(mainImage)} style={styles.selectedImage} />
                            ) : (
                                <Image source={upload} style={styles.uploadIcon} />
                            )}
                        </TouchableOpacity>

                        <Text style={[styles.label, { marginTop: 20 }]}>Descripción general</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            multiline
                            value={descriptionGeneral}
                            onChangeText={setDescriptionGeneral}
                            placeholder="Descripción general de la receta..."
                        />

                        <Text style={[styles.label, { marginTop: 20 }]}>Tipo de receta</Text>
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
                                            {ing.unitName || (loadingUnits ? 'Cargando...' : 'Unidad')}
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
                                        <Image source={getDisplayImageSource(step.imageUri)} style={styles.stepImagePreview} />
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
                        {isSaving && <Text style={styles.loadingText}>Actualizando receta...</Text>}
                        {saveError && <Text style={styles.errorText}>{saveError}</Text>}
                        {saveSuccess && <Text style={styles.successText}>{saveSuccess}</Text>}

                        <TouchableOpacity
                            style={[styles.actionButton, { marginTop: 20, marginBottom: 40 }]}
                            onPress={handleUpdateRecipe} // ** Llamada a la función de ACTUALIZACIÓN **
                            disabled={isSaving}
                        >
                            <Text style={styles.actionButtonText}>
                                {isSaving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    'Actualizar receta' // ** Texto para el botón **
                                )}
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
    loadingScreen: { // Estilo para la pantalla de carga inicial
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
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
    // ** ESTILO PARA EL DROPDOWN DE TIPO DE RECETA SCROLLEABLE **
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
        maxHeight: 180, // Limita la altura del dropdown a 6 elementos (aprox 30px por item + padding)
        overflow: 'scroll', // Hace que el dropdown sea scrolleable
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

export default EditarReceta;