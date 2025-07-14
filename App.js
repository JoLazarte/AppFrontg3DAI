import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { AuthContext, AuthProvider } from './context/AuthContext'; 

// Importaciones de tus pantallas existentes
import Home from './components/Home';
import BuscarCursos from './components/buscarCursos';
import InformacionCurso from './components/informacionCurso';
import RecetasGuardadas from './components/recetasGuardadas';
import MisCursos from './components/misCursos';
import InicioSesion from './components/InicioSesion';
import Registrarse from './components/Registrarse';
import Inicio from './components/Inicio';
import InformacionMisCursos from './components/informacionMisCursos';
import CuentaCorriente from './components/cuentaCorriente';
import MisRecetas from './components/misRecetas';
import CrearReceta from './components/crearReceta';
import RegistrarseUsuario from './components/RegistrarseUsuario';
import RegistrarseEstudiante from './components/RegistrarseEstudiante';
import RegistrarseDatosPersonales from './components/RegistrarseDatosPersonales';
import RegistrarseVerificacion from './components/RegistrarseVerificacion.';
import FinRegistro from './components/FinRegistro';
import Invitados from './components/Invitados';
import RegistrarseEstudianteDatos from './components/RegistrarseEstudianteDatos';
import InformacionReceta from './components/informacionReceta';
import EditarReceta from './components/EditarReceta';


// ▼▼▼ PASO 1: IMPORTAMOS EL NUEVO COMPONENTE ▼▼▼
import CambiarUsuarioAEstudiante from './components/CambiarUsuarioAEstudiante';

const Stack = createStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Invitados" component={Invitados} />
    <Stack.Screen name="Inicio" component={Inicio} />
    <Stack.Screen name="InicioSesion" component={InicioSesion} />
    <Stack.Screen name="Registrarse" component={Registrarse} />
    <Stack.Screen name="RegistrarseUsuario" component={RegistrarseUsuario} />
    <Stack.Screen name="RegistrarseDatosPersonales" component={RegistrarseDatosPersonales} />
    <Stack.Screen name="RegistrarseEstudiante" component={RegistrarseEstudiante} />
    <Stack.Screen name="RegistrarseEstudianteDatos" component={RegistrarseEstudianteDatos} />
    <Stack.Screen name="Verificar" component={RegistrarseVerificacion} />
    <Stack.Screen name="FinRegistro" component={FinRegistro} />
    <Stack.Screen name="InformacionReceta" component={InformacionReceta} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const AppStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={Home} />
    <Stack.Screen name="BuscarCursos" component={BuscarCursos} />
    <Stack.Screen name="InformacionCurso" component={InformacionCurso} />
    <Stack.Screen name="RecetasGuardadas" component={RecetasGuardadas}/>
    <Stack.Screen name="MisCursos" component={MisCursos} />
    <Stack.Screen name="InformacionMisCursos" component={InformacionMisCursos} />
    <Stack.Screen name="CuentaCorriente" component={CuentaCorriente} />
    <Stack.Screen name="MisRecetas" component={MisRecetas} />
    <Stack.Screen name="CrearReceta" component={CrearReceta} />
    <Stack.Screen name="EditarReceta" component={EditarReceta} />
    <Stack.Screen name="InformacionReceta" component={InformacionReceta} options={{ headerShown: false }} />

    {/* ▼▼▼ PASO 2: AÑADIMOS LA NUEVA PANTALLA AL STACK PROTEGIDO ▼▼▼ */}
    <Stack.Screen name="CambiarUsuarioAEstudiante" component={CambiarUsuarioAEstudiante} options={{ headerShown: false }} />
  </Stack.Navigator>
);

const AppNav = () => {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size={'large'} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      { userToken !== null ? <AppStack /> : <AuthStack /> }
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNav />
    </AuthProvider>
  );
}
