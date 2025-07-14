import axios from 'axios';
import { API_BASE_URL } from '@env';

const RECIPE_API_URL = `${API_BASE_URL}/apiRecipes`;

/**
 * Función auxiliar para construir URLs de forma segura,
 * codificando los parámetros para evitar errores con caracteres especiales.
 */
const buildUrl = (base, params) => {
  const query = Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return `${base}?${query}`;
};

export const getAllRecipes = (sortOrder = 'alpha_asc', page = 0, size = 10) => {
  const url = buildUrl(RECIPE_API_URL, { sort: sortOrder, page, size });
  return axios.get(url);
};

export const findRecipesByName = (name, sortOrder = 'alpha_asc', page = 0, size = 10) => {
  const url = buildUrl(`${RECIPE_API_URL}/search/by-name`, { name, sort: sortOrder, page, size });
  return axios.get(url);
};

export const findRecipesByAuthor = (username, sortOrder = 'alpha_asc', page = 0, size = 10) => {
  const url = buildUrl(`${RECIPE_API_URL}/search/by-author`, { username, sort: sortOrder, page, size });
  return axios.get(url);
};

export const findRecipesByType = (typeId, sortOrder = 'alpha_asc', page = 0, size = 10) => {
  const url = buildUrl(`${RECIPE_API_URL}/search/by-type`, { typeId, sort: sortOrder, page, size });
  return axios.get(url);
};

export const findRecipesByIngredient = (name, contains = true, sortOrder = 'alpha_asc', page = 0, size = 10) => {
    const url = buildUrl(`${RECIPE_API_URL}/search/by-ingredient`, { name, contains, sort: sortOrder, page, size });
    return axios.get(url);
};

export const getRecipeTypes = () => {
  return axios.get(`${RECIPE_API_URL}/types`);
};

export const getUnits = () => {
    return axios.get(`${RECIPE_API_URL}/units`);
};

export const getRecipeById = (id) => {
  return axios.get(`${RECIPE_API_URL}/${id}`);
};

const convertFileToBase64 = async (uri) => {
    try {
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("Error al convertir archivo a Base64:", uri, error);
        throw new Error("No se pudo procesar la imagen para subirla.");
    }
};

/**
 * Envía los datos de una nueva receta al backend, incluyendo imágenes en Base64.
 * Recibe el token como primer argumento.
 * @param {string} token - El token JWT del usuario autenticado. // <--- AHORA SÍ RECIBE EL TOKEN
 * @param {Object} recipeData - Objeto con los datos de la receta.
 * @param {string} mainImageUri - URI local de la imagen principal.
 * @returns {Promise<Object>} La respuesta del backend.
 */
export const createRecipe = async (token, recipeData, mainImageUri) => { // La función ahora espera el token
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            // Este caso debería ser manejado en el componente antes de llamar a esta función
            throw new Error("No se encontró token de autenticación. Por favor, inicie sesión.");
        }

        // Convertir imagen principal a Base64
        let base64MainPicture = null;
        if (mainImageUri) {
            base64MainPicture = await convertFileToBase64(mainImageUri);
        }

        // Convertir imágenes de pasos a Base64
        const stepsWithBase64Images = await Promise.all(recipeData.steps.map(async (step) => {
            let base64ImagenPaso = null;
            if (step.imageUri) {
                base64ImagenPaso = await convertFileToBase64(step.imageUri);
            }
            return {
                ...step,
                imagenPaso: base64ImagenPaso,
                imageUri: undefined,
                imageFile: undefined,
            };
        }));

        // Construir el payload final para enviar
        const payload = {
            recipeName: recipeData.recipeName,
            mainPicture: base64MainPicture,
            descriptionGeneral: recipeData.descriptionGeneral,
            servings: recipeData.servings,
            cantidadPersonas: recipeData.cantidadPersonas,
            typeOfRecipeId: recipeData.typeOfRecipeId,
            ingredients: recipeData.ingredients,
            steps: stepsWithBase64Images,
        };

        const response = await axios.post(RECIPE_API_URL, payload, { headers });
        return response.data;
    } catch (error) {
        console.error("Error al crear la receta:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'Error al crear la receta.';
        throw new Error(errorMessage);
    }
};

// Esta función ya no es necesaria si la verificación es solo del lado del backend.
// Si aún la necesitas, deberá recibir el token si su endpoint es protegido.
export const checkRecipeNameExists = async (token, recipeName) => {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.get(`${RECIPE_API_URL}/check-name?name=${encodeURIComponent(recipeName)}`, { headers });
        return response.data;
    } catch (error) {
        console.error("Error al verificar el nombre de la receta:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Error al verificar la disponibilidad del nombre. Asegúrese de tener permisos.");
    }
};

//Receta para mis recetas
export const misRecetas = (username, sortOrder = 'alpha_asc', page = 0, size = 10) => {
    return findRecipesByAuthor(username, sortOrder, page, size);
};

/**
 * Envía una nueva reseña para una receta específica.
 * @param {string} token - El token JWT del usuario autenticado.
 * @param {number} recipeId - El ID de la receta que se está reseñando.
 * @param {object} reviewData - Un objeto con { rating, comment }.
 * @returns {Promise<Object>} La reseña creada.
 */
export const createReview = async (token, recipeId, reviewData) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const response = await axios.post(`${RECIPE_API_URL}/${recipeId}/reviews`, reviewData, { headers });
        return response.data;
    } catch (error) {
        console.error("Error al crear la reseña:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'No se pudo publicar la reseña.');
    }
};

export const updateRecipe = async (recipeId, recipeData, token) => { // recipeData ya es JSON
    try {
        const headers = {
            'Content-Type': 'application/json', // <-- Â¡CAMBIADO A application/json!
            'Authorization': `Bearer ${token}`,
        };
        const response = await axios.put(`${RECIPE_API_URL}/${recipeId}`, recipeData, { // <-- recipeData directamente, no recipeDataFormData
            headers: headers, // Usar los headers definidos arriba
        });
        return response.data;
    } catch (error) {
        console.error('Error updating recipe:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al actualizar la receta.');
    }
};

export const checkIfRecipeIsSaved = async (token, userId, recipeId) => {
    try {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        // Este endpoint no requiere Content-Type application/json para GET
        const response = await axios.get(`${RECIPE_API_URL}/is-saved/${userId}/${recipeId}`, { headers });
        return response.data; // El backend devuelve directamente true o false
    } catch (error) {
        console.error("Error al verificar si la receta está guardada:", error.response?.data || error.message);
        // Si hay un error (ej. 404 por usuario/receta no encontrados), asumimos que no está guardada
        return false;
    }
};

export const toggleSaveRecipe = async (token, userId, recipeId) => {
    try {
        const headers = {}; // No se requiere Content-Type para un POST sin body
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.post(`${RECIPE_API_URL}/toggle-save/${userId}/${recipeId}`, {}, { headers });
        return response.data; // Debería ser "Receta guardada exitosamente." o "Receta desguardada exitosamente."
    } catch (error) {
        console.error("Error al guardar/desguardar la receta:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Error al guardar/desguardar la receta.');
    }
};

export const getSavedRecipesByUser = async (token, userId) => {
    try {
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.get(`${RECIPE_API_URL}/saved-by-user/${userId}`, { headers });
        return response.data;
    } catch (error) {
        console.error("Error al obtener recetas guardadas:", error.response?.data || error.message);
        return []; // Devolvemos un array vacío en caso de error
    }
};