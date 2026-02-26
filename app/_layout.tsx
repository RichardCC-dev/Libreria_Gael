import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '@/contexts/AuthContext';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1A73E8',
    background: '#F8F9FA',
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider value={theme}>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="register" 
            options={{ 
              headerShown: true,
              title: 'Registro',
              presentation: 'card',
              headerStyle: {
                backgroundColor: '#1A73E8',
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }} 
          />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: true,
            title: 'Iniciar Sesión',
            presentation: 'card',
            headerStyle: {
              backgroundColor: '#1A73E8',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <Stack.Screen 
          name="forgot-password" 
          options={{ 
            headerShown: true,
            title: 'Recuperar Contraseña',
            presentation: 'card',
            headerStyle: {
              backgroundColor: '#1A73E8',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <Stack.Screen 
          name="verify-code" 
          options={{ 
            headerShown: true,
            title: 'Verificar Código',
            presentation: 'card',
            headerStyle: {
              backgroundColor: '#F59E0B',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <Stack.Screen 
          name="reset-password" 
          options={{ 
            headerShown: true,
            title: 'Nueva Contraseña',
            presentation: 'card',
            headerStyle: {
              backgroundColor: '#10B981',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }} 
        />
        <Stack.Screen 
          name="dashboard" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="inventario" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="catalogo" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="mis-reservas" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="reservas" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="ventas" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="resenas" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="perfil" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="admin" 
          options={{ 
            headerShown: false,
          }} 
        />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
