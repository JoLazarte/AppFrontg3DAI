import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode'; // <-- Importamos la librería

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);
    const [user, setUser] = useState(null); // <-- 1. NUEVO ESTADO PARA GUARDAR LOS DATOS DEL USUARIO

    const login = async (token, remember) => {
        setIsLoading(true);
        try {
            setUserToken(token);
            if (remember) {
                await AsyncStorage.setItem('userToken', token);
            }
            // 2. DECODIFICAMOS EL TOKEN Y GUARDAMOS LA INFO DEL USUARIO
            const decodedToken = jwtDecode(token);
            setUser(decodedToken); 
        } catch (e) {
            console.log('Error en la función de login', e);
        }
        setIsLoading(false);
    };

    const logout = async () => {
        setIsLoading(true);
        setUserToken(null);
        setUser(null); // <-- 3. LIMPIAMOS LOS DATOS DEL USUARIO AL CERRAR SESIÓN
        try {
            await AsyncStorage.removeItem('userToken');
        } catch(e) {
            console.log('Error al borrar el token de AsyncStorage', e);
        }
        setIsLoading(false);
    };

    const isLoggedIn = async () => {
        try {
            setIsLoading(true);
            let token = await AsyncStorage.getItem('userToken');
            setUserToken(token);

            if (token) {
                // 4. SI HAY UN TOKEN GUARDADO, TAMBIÉN LO DECODIFICAMOS AL INICIAR LA APP
                const decodedToken = jwtDecode(token);
                setUser(decodedToken);
            }
        } catch(e) {
            console.log('Error al verificar si el usuario está logueado', e);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        // 5. EXPONEMOS EL NUEVO ESTADO 'user' AL RESTO DE LA APP
        <AuthContext.Provider value={{ login, logout, isLoading, userToken, user }}>
            {children}
        </AuthContext.Provider>
    );
};