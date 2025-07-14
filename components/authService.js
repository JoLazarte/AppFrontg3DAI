import axios from 'axios';
import { API_BASE_URL } from '@env'; 

console.log('URL Base cargada desde .env:', API_BASE_URL);

const AUTH_API_URL = `${API_BASE_URL}/apiUser`;

export const checkAliasExists = async (alias) => {
    try {
        const response = await axios.get(`${AUTH_API_URL}/check-alias?alias=${alias}`);
        return response.data;
    } catch (error) { //...
        console.error("Error al verificar el alias:", error);
        throw error;
    }
};

export const checkEmailExists = async (email) => {
    try {
        const response = await axios.get(`${AUTH_API_URL}/check-email?email=${email}`);
        return response.data;
    } catch (error) { //...
        console.error("Error al verificar el email:", error);
        throw error;
    }
};

export const generateAliasSuggestions = (baseAlias) => {
    const suggestions = [];
    const suffixes = ['_pro', '123', '25'];

    for (const suffix of suffixes) {
        const newAlias = `${baseAlias}${suffix}`;
        suggestions.push(newAlias);
    }
    return suggestions.slice(0, 2);
};

export const iniciarRegistro = async (userData) => {
    // La misión de esta función es enviar TODOS los datos del usuario
    // al backend para que los guarde temporalmente.
    try {
        // El objeto 'userData' ya contiene todo lo que necesitamos:
        // { alias, email, password, firstName, lastName, ..., permissionGranted, etc. }
        // Lo renombramos a 'payload' para claridad y lo enviamos.
        const payload = {
            username: userData.alias,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            address: userData.address,
            urlAvatar: userData.urlAvatar,
            permissionGranted: userData.permissionGranted,
            // Campos de estudiante (si no es estudiante, estos serán undefined y se ignorarán)
            cardNumber: userData.cardNumber,
            nroTramite: userData.nroTramite,
            dniFrente: userData.dniFrente,
            dniDorso: userData.dniDorso,
            nroDocumento: userData.nroDocumento,
            tipoTarjeta: userData.tipoTarjeta,
        };

        const response = await axios.post(`${AUTH_API_URL}/iniciar-registro`, payload);
        return { success: true, message: response.data };
    } catch (error) {
        const errorMessage = error.response?.data || "No se pudo conectar con el servidor.";
        console.error("Error al iniciar el registro:", errorMessage);
        return { success: false, message: errorMessage };
    }
};

// --- FUNCIÓN CORREGIDA ---
export const finalizarRegistro = async (email, code) => {
    try {
        // Usamos AUTH_API_URL en lugar de API_URL
        const response = await axios.post(`${AUTH_API_URL}/finalizar-registro`, { email, code });
        return { success: true, message: response.data };
    } catch (error) {
        console.error("Error al finalizar el registro:", error.response?.data || error.message);
        return { success: false, message: error.response?.data || "El código es incorrecto o ha expirado." };
    }
};

export const registerUser = async (userData) => {
    try {
        const payload = {
            username: userData.alias,
            email: userData.email,
            password: userData.password,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            address: userData.address,
            urlAvatar: userData.urlAvatar,
            
            // LÓGICA EXPLÍCITA: Si 'esEstudiante' es verdadero, permissionGranted es false.
            // Si es falso o no existe, permissionGranted es true.
            permissionGranted: userData.esEstudiante ? false : true,
            
            // Campos de estudiante (solo se enviarán si existen en el objeto userData)
            cardNumber: userData.cardNumber,
            nroTramite: userData.nroTramite,
            dniFrente: userData.dniFrente,
            dniDorso: userData.dniDorso,
            nroDocumento: userData.nroDocumento,
            tipoTarjeta: userData.tipoTarjeta,
        };

        console.log("Enviando payload de registro final:", payload);

        const response = await axios.post(`${AUTH_API_URL}/registerUser`, payload);
        return { success: true, message: response.data };
        
    } catch (error) {
        const errorMessage = error.response ? error.response.data : "Error de conexión";
        console.error("Error en el registro final:", errorMessage);
        return { success: false, message: errorMessage };
    }
};

export const loginUser = async (alias, password) => {
    try {
        const payload = {
            username: alias,
            password: password
        };
        const response = await axios.post(`${AUTH_API_URL}/loginUser`, payload);
        
        if (response.data && response.data.token) {
            return { success: true, token: response.data.token };
        } else {
            return { success: false, message: 'Respuesta inesperada del servidor.' };
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message || 'Credenciales incorrectas' : "Error de conexión con el servidor.";
        return { success: false, message: errorMessage };
    }
};

export const upgradeToStudent = async (studentData, token) => {
    try {
        // El endpoint es el que creamos en el backend
        const response = await axios.post(
            `${API_BASE_URL}/apiUser/become-student`, 
            studentData, // El cuerpo de la petición son los datos del formulario
            {
                headers: {
                    // Adjuntamos el token del usuario para la autorización
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return { success: true, data: response.data };
    } catch (error) {
        const errorMessage = error.response?.data || "No se pudo completar la solicitud.";
        console.error("Error al convertir a estudiante:", errorMessage);
        return { success: false, message: errorMessage };
    }
};