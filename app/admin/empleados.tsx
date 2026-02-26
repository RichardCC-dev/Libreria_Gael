import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  getEmployees,
  createEmployee,
  CreateEmployeeData,
  EmployeeInfo,
} from '@/services/authService';

export default function EmpleadosScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateEmployeeData>({
    email: '',
    password: '',
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateEmployeeData, string>>>({});

  const loadEmployees = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getEmployees(token);
      setEmployees(data);
    } catch {
      setEmployees([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'administrador')) {
      router.replace('/dashboard');
    }
  }, [user?.role, isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'administrador') {
      loadEmployees();
    }
  }, [user?.role, loadEmployees]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEmployees();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateEmployeeData, string>> = {};
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de correo inválido';
    }
    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateEmployee = async () => {
    if (!validateForm() || !token) return;

    setSubmitting(true);
    const res = await createEmployee(formData, token);
    setSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Empleado registrado',
        `Credenciales para el empleado:\n\nCorreo: ${formData.email}\nContraseña: (la que ingresaste)\n\nComparte estas credenciales con el empleado para su primer acceso.`,
        [
          {
            text: 'Aceptar',
            onPress: () => {
              setShowModal(false);
              setFormData({ email: '', password: '', name: '', phone: '' });
              setErrors({});
              loadEmployees();
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const updateField = (field: keyof CreateEmployeeData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (!user || user.role !== 'administrador') return null;

  const renderEmployee = ({ item }: { item: EmployeeInfo }) => (
    <View style={styles.card}>
      <View style={styles.cardAvatar}>
        <Ionicons name="person" size={24} color={Colors.white} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardName}>{item.name || item.email}</Text>
        <Text style={styles.cardEmail}>{item.email}</Text>
        {item.phone ? (
          <Text style={styles.cardPhone}>{item.phone}</Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
        <Text style={styles.fabText}>Agregar empleado</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando empleados...</Text>
        </View>
      ) : (
        <FlatList
          data={employees}
          keyExtractor={(item) => item.id}
          renderItem={renderEmployee}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Sin empleados</Text>
              <Text style={styles.emptyText}>
                Agrega empleados para que puedan acceder a la plataforma.
              </Text>
              <Button
                title="Agregar primer empleado"
                onPress={() => setShowModal(true)}
                style={styles.emptyBtn}
              />
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo empleado</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Input
                label="Correo electrónico"
                placeholder="empleado@ejemplo.com"
                value={formData.email}
                onChangeText={(t) => updateField('email', t)}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
              />
              <Input
                label="Nombre completo"
                placeholder="Nombre del empleado"
                value={formData.name}
                onChangeText={(t) => updateField('name', t)}
                error={errors.name}
                leftIcon={<Ionicons name="person-outline" size={20} color={Colors.textSecondary} />}
              />
              <Input
                label="Teléfono (opcional)"
                placeholder="Ej: 997123456"
                value={formData.phone || ''}
                onChangeText={(t) => updateField('phone', t)}
                keyboardType="phone-pad"
                leftIcon={<Ionicons name="call-outline" size={20} color={Colors.textSecondary} />}
              />
              <Input
                label="Contraseña inicial"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChangeText={(t) => updateField('password', t)}
                secureTextEntry
                error={errors.password}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
              />
              <View style={styles.modalHint}>
                <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                <Text style={styles.modalHintText}>
                  Comparte las credenciales con el empleado para su primer acceso.
                </Text>
              </View>
              <Button
                title="Registrar empleado"
                onPress={handleCreateEmployee}
                loading={submitting}
                disabled={submitting}
                style={styles.modalBtn}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: { fontSize: 14, color: Colors.textSecondary },
  listContent: { padding: Spacing.lg, paddingBottom: 100 },
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cardAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardContent: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  cardEmail: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  cardPhone: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  emptyBtn: { marginTop: Spacing.md },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#8B5CF6',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  fabText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.large,
    borderTopRightRadius: BorderRadius.large,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  modalHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#EBF5FF',
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
    marginBottom: Spacing.lg,
  },
  modalHintText: { flex: 1, fontSize: 12, color: Colors.textSecondary },
  modalBtn: { marginBottom: Spacing.xxl },
});
