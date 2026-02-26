import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { verifyRecoveryCode, VerifyCodeData } from '@/services/authService';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      Alert.alert('Error', 'Correo electrónico no encontrado', [
        {
          text: 'Volver',
          onPress: () => router.back(),
        },
      ]);
    }
  }, [email]);

  const validateCode = (): boolean => {
    if (!code.trim()) {
      setError('El código es obligatorio');
      return false;
    }

    if (code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return false;
    }

    setError('');
    return true;
  };

  const handleVerifyCode = async () => {
    if (!validateCode()) {
      return;
    }

    setLoading(true);
    try {
      const response = await verifyRecoveryCode({ email, code });

      if (response.success) {
        Alert.alert(
          'Código Verificado',
          'El código es correcto. Ahora puedes establecer una nueva contraseña.',
          [
            {
              text: 'Continuar',
              onPress: () => {
                router.push({
                  pathname: '/reset-password',
                  params: { email, code },
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message);
        setError(response.message);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Ocurrió un error al verificar el código. Por favor, inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (value: string) => {
    // Solo permitir números y limitar a 6 dígitos
    const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(numericValue);
    if (error) setError('');
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
            <Ionicons name="key" size={48} color={Colors.white} />
          </View>
          <Text style={styles.title}>Verificar Código</Text>
          <Text style={styles.subtitle}>
            Ingresa el código de 6 dígitos que recibiste en tu correo electrónico
          </Text>
          {email && (
            <Text style={styles.emailText}>{email}</Text>
          )}
        </View>

        {/* Formulario */}
        <View style={styles.formContainer}>
          <Input
            label="Código de Recuperación"
            placeholder="000000"
            value={code}
            onChangeText={formatCode}
            error={error}
            keyboardType="number-pad"
            maxLength={6}
            style={styles.codeInput}
            leftIcon={<Ionicons name="shield-checkmark-outline" size={20} color={Colors.textSecondary} />}
          />

          <Button
            title="Verificar Código"
            onPress={handleVerifyCode}
            loading={loading}
            disabled={loading || code.length !== 6}
            style={styles.verifyButton}
          />

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.secondary} />
            <Text style={styles.infoBoxText}>
              El código expira en 15 minutos. Si no lo recibiste, puedes solicitar uno nuevo.
            </Text>
          </View>

          {/* Links */}
          <View style={styles.footer}>
            <Text
              style={styles.footerLink}
              onPress={() => router.back()}
            >
              Solicitar nuevo código
            </Text>
            <Text style={styles.footerSeparator}> • </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.replace('/login')}
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
    backgroundColor: Colors.secondary,
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
  emailText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: Spacing.sm,
    fontFamily: 'system',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  verifyButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
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
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: 'system',
  },
  footerSeparator: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'system',
  },
});
