import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, changePassword, changeEmail, EMAIL_SOPORTE } from '@/services/authService';

function getRoleLabel(role: string) {
  switch (role) {
    case 'administrador': return 'Administrador';
    case 'empleado': return 'Empleado';
    case 'cliente': return 'Cliente';
    default: return 'Usuario';
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'administrador': return Colors.primary;
    case 'empleado': return Colors.secondary;
    case 'cliente': return '#10B981';
    default: return Colors.textSecondary;
  }
}

export default function PerfilScreen() {
  const router = useRouter();
  const { user, token, updateUser, isLoading: authLoading } = useAuth();
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmar, setPasswordConfirmar] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [nuevoCorreo, setNuevoCorreo] = useState('');
  const [passwordParaCorreo, setPasswordParaCorreo] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    if (user) {
      setNombre(user.name || '');
      setNumero(user.phone || '');
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleGuardarPerfil = async () => {
    if (!user?.id) return;

    setSavingProfile(true);
    if (!token) return;
    const res = await updateProfile(user.id, {
      name: nombre.trim() || undefined,
      phone: numero.trim() || undefined,
    }, token);
    setSavingProfile(false);

    if (res.success && res.user) {
      await updateUser(res.user);
      Alert.alert('Listo', 'Tu perfil se ha actualizado correctamente.');
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleCambiarCorreo = async () => {
    if (!user?.id) return;
    if (!nuevoCorreo.trim()) {
      Alert.alert('Error', 'Ingresa tu nuevo correo electrónico.');
      return;
    }
    if (!passwordParaCorreo.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña actual para confirmar el cambio.');
      return;
    }

    if (!token) return;
    setSavingEmail(true);
    const res = await changeEmail({
      userId: user.id,
      newEmail: nuevoCorreo.trim(),
      currentPassword: passwordParaCorreo,
    }, token);
    setSavingEmail(false);

    if (res.success && res.user) {
      await updateUser(res.user);
      Alert.alert('Listo', 'Tu correo electrónico se ha actualizado correctamente.');
      setNuevoCorreo('');
      setPasswordParaCorreo('');
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleCambiarContrasena = async () => {
    if (!user?.id) return;
    if (!passwordActual.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña actual.');
      return;
    }
    if (passwordNueva.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (passwordNueva !== passwordConfirmar) {
      Alert.alert('Error', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    if (!token) return;
    setSavingPassword(true);
    const res = await changePassword({
      userId: user.id,
      currentPassword: passwordActual,
      newPassword: passwordNueva,
    }, token);
    setSavingPassword(false);

    if (res.success) {
      Alert.alert('Listo', 'Contraseña actualizada correctamente.');
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmar('');
    } else {
      Alert.alert('Error', res.message);
    }
  };

  if (!user) return null;

  const roleColor = getRoleColor(user.role);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar y rol */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: roleColor }]}>
            <Ionicons name="person" size={48} color={Colors.white} />
          </View>
          <View style={[styles.roleBadge, { backgroundColor: `${roleColor}25` }]}>
            <Text style={[styles.roleText, { color: roleColor }]}>
              {getRoleLabel(user.role)}
            </Text>
          </View>
        </View>

        {/* Datos del perfil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información personal</Text>
          <Input
            label="Nombre"
            placeholder="Tu nombre"
            value={nombre}
            onChangeText={setNombre}
            leftIcon={<Ionicons name="person-outline" size={20} color={Colors.textSecondary} />}
          />
          <Input
            label="Número"
            placeholder="Ej: 997123489"
            value={numero}
            onChangeText={(t) => {
              if (t === '' || /^\d*$/.test(t)) setNumero(t);
            }}
            keyboardType="phone-pad"
            maxLength={12}
            leftIcon={<Ionicons name="call-outline" size={20} color={Colors.textSecondary} />}
          />
          <Input
            label="Correo electrónico actual"
            value={user.email}
            editable={false}
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
          />
          <View style={styles.soporteBox}>
            <Ionicons name="headset-outline" size={18} color={Colors.primary} />
            <Text style={styles.soporteText}>
              ¿Necesitas ayuda? Contacta a soporte:{' '}
              <Text style={styles.soporteEmail}>{EMAIL_SOPORTE}</Text>
            </Text>
          </View>
          <Button
            title="Guardar cambios"
            onPress={handleGuardarPerfil}
            loading={savingProfile}
            disabled={savingProfile}
          />
        </View>

        {/* Cambiar correo electrónico */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cambiar correo electrónico</Text>
          <Input
            label="Nuevo correo"
            placeholder="tu_nuevo@correo.com"
            value={nuevoCorreo}
            onChangeText={setNuevoCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
          />
          <Input
            label="Contraseña actual (para confirmar)"
            placeholder="Tu contraseña actual"
            value={passwordParaCorreo}
            onChangeText={setPasswordParaCorreo}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
          />
          <Button
            title="Cambiar correo"
            onPress={handleCambiarCorreo}
            loading={savingEmail}
            disabled={savingEmail || !nuevoCorreo.trim() || !passwordParaCorreo}
            variant="outline"
          />
        </View>

        {/* Cambiar contraseña */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cambiar contraseña</Text>
          <Input
            label="Contraseña actual"
            placeholder="Tu contraseña actual"
            value={passwordActual}
            onChangeText={setPasswordActual}
            secureTextEntry
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
          />
          <Input
            label="Nueva contraseña"
            placeholder="Mínimo 6 caracteres"
            value={passwordNueva}
            onChangeText={setPasswordNueva}
            secureTextEntry
            leftIcon={<Ionicons name="key-outline" size={20} color={Colors.textSecondary} />}
          />
          <Input
            label="Confirmar nueva contraseña"
            placeholder="Repite la nueva contraseña"
            value={passwordConfirmar}
            onChangeText={setPasswordConfirmar}
            secureTextEntry
            leftIcon={<Ionicons name="key-outline" size={20} color={Colors.textSecondary} />}
          />
          <Button
            title="Cambiar contraseña"
            onPress={handleCambiarContrasena}
            loading={savingPassword}
            disabled={savingPassword || !passwordActual || !passwordNueva || !passwordConfirmar}
            variant="outline"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.medium,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  soporteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#EBF5FF',
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    marginBottom: Spacing.md,
  },
  soporteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  soporteEmail: {
    fontWeight: '600',
    color: Colors.primary,
  },
});
