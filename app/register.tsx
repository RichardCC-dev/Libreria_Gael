import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { registerUser, RegisterData } from '@/services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData, string>>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterData, string>> = {};

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'El formato del correo electrónico no es válido';
      }
    }

    // Validar password
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await registerUser(formData);

      if (response.success) {
        // Mostrar mensaje de confirmación
        Alert.alert(
          'Registro Exitoso',
          `¡Bienvenido! Tu cuenta ha sido creada exitosamente.\n\nTu rol asignado es: ${response.user?.role || 'Cliente'}\n\nAhora puedes iniciar sesión con tus credenciales.`,
          [
            {
              text: 'Iniciar Sesión',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        Alert.alert('Error de Registro', response.message);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Ocurrió un error al registrarse. Por favor, inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof RegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo/Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="school" size={48} color={Colors.white} />
          </View>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>
            Regístrate para acceder a la plataforma
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <Input
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            value={formData.email}
            onChangeText={(value) => updateField('email', value)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
          />

          <Input
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            value={formData.password}
            onChangeText={(value) => updateField('password', value)}
            error={errors.password}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
          />

          <Input
            label="Nombre (Opcional)"
            placeholder="Tu nombre completo"
            value={formData.name || ''}
            onChangeText={(value) => updateField('name', value)}
            autoCapitalize="words"
            leftIcon={<Ionicons name="person-outline" size={20} color={Colors.textSecondary} />}
          />

          <Button
            title="Registrarse"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.registerButton}
          />

          {/* Info Box con credenciales de prueba */}
          <View style={styles.infoBox}>
            <Text style={styles.infoBoxTitle}>Información de Prueba</Text>
            <Text style={styles.infoBoxText}>
              Todos los usuarios se registran con rol de "Cliente" por defecto.
            </Text>
          </View>

          {/* Link a Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/login')}
            >
              Iniciar Sesión
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl * 2,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontFamily: 'system',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'system',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  registerButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBox: {
    backgroundColor: '#EBF5FF',
    borderRadius: BorderRadius.small,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontFamily: 'system',
  },
  infoBoxText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'system',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'system',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: 'system',
  },
});
