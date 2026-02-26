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
import { forgotPassword, ForgotPasswordData } from '@/services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('El formato del correo electrónico no es válido');
      return false;
    }

    setError('');
    return true;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) {
      return;
    }

    setLoading(true);
    try {
      const response = await forgotPassword({ email });

      if (response.success) {
        setCodeSent(true);
        // En desarrollo, mostramos el código en un Alert
        // En producción, esto se enviaría por email
        if (response.recoveryCode) {
          setRecoveryCode(response.recoveryCode);
          Alert.alert(
            'Código Enviado',
            `Código de recuperación: ${response.recoveryCode}\n\n(En producción, este código se enviaría por email)`,
            [
              {
                text: 'Continuar',
                onPress: () => {
                  router.push({
                    pathname: '/verify-code',
                    params: { email },
                  });
                },
              },
            ]
          );
        } else {
          router.push({
            pathname: '/verify-code',
            params: { email },
          });
        }
      } else {
        Alert.alert('Error', response.message);
        setError(response.message);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Ocurrió un error al solicitar la recuperación. Por favor, inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
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
            <Ionicons name="lock-closed" size={48} color={Colors.white} />
          </View>
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico para recibir un código de recuperación
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <Input
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) setError('');
            }}
            error={error}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!codeSent}
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
          />

          {codeSent && recoveryCode && (
            <View style={styles.codeBox}>
              <Text style={styles.codeBoxTitle}>Código de Recuperación</Text>
              <Text style={styles.codeBoxCode}>{recoveryCode}</Text>
              <Text style={styles.codeBoxText}>
                (En producción, este código se enviaría por email)
              </Text>
            </View>
          )}

          <Button
            title={codeSent ? "Reenviar Código" : "Enviar Código"}
            onPress={handleSendCode}
            loading={loading}
            disabled={loading || codeSent}
            style={styles.sendButton}
          />

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoBoxText}>
              El código de recuperación tiene una validez de 15 minutos.
            </Text>
          </View>

          {/* Link a Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Recordaste tu contraseña? </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.back()}
            >
              Volver al Login
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
  codeBox: {
    backgroundColor: '#EBF5FF',
    borderRadius: BorderRadius.small,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  codeBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontFamily: 'system',
  },
  codeBoxCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    letterSpacing: 8,
    marginBottom: Spacing.xs,
    fontFamily: 'monospace',
  },
  codeBoxText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'system',
  },
  sendButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF5FF',
    borderRadius: BorderRadius.small,
    padding: Spacing.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'flex-start',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
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
