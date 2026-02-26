import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  registerBorrowedProduct,
  RegisterBorrowedProductData,
} from '@/services/borrowedProductService';

export default function RegistrarPrestamoScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    stock: '',
    precio: '',
    codigoTienda: '',
    fechaPrestamo: new Date().toISOString().slice(0, 10),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (authLoading) return;
    if (user && user.role !== 'empleado' && user.role !== 'administrador') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!formData.codigoTienda.trim()) e.codigoTienda = 'El código de tienda es obligatorio';
    const stock = parseInt(formData.stock, 10);
    if (formData.stock === '' || isNaN(stock) || stock < 0)
      e.stock = 'Stock debe ser un número ≥ 0';
    const precio = parseFloat(formData.precio);
    if (formData.precio === '' || isNaN(precio) || precio < 0)
      e.precio = 'Precio debe ser un número ≥ 0';
    if (!formData.fechaPrestamo) e.fechaPrestamo = 'La fecha es obligatoria';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!user?.id || !validate()) return;

    const data: RegisterBorrowedProductData = {
      nombre: formData.nombre.trim(),
      stock: parseInt(formData.stock, 10) || 0,
      precio: parseFloat(formData.precio) || 0,
      codigoTienda: formData.codigoTienda.trim(),
      fechaPrestamo: formData.fechaPrestamo,
      empleadoId: user.id,
      empleadoName: user.name || user.email || 'Empleado',
    };

    if (!token) return;
    setSaving(true);
    const res = await registerBorrowedProduct(data, token);
    setSaving(false);

    if (res.success) {
      Alert.alert(
        'Registrado',
        'El producto prestado ha sido agregado al catálogo.',
        [
          { text: 'Ver préstamos', onPress: () => router.replace('/inventario/productos-prestados') },
          {
            text: 'Otro registro',
            onPress: () => {
              setFormData({
                nombre: '',
                stock: '',
                precio: '',
                codigoTienda: '',
                fechaPrestamo: new Date().toISOString().slice(0, 10),
              });
              setErrors({});
            },
          },
        ]
      );
    } else {
      Alert.alert('Error', res.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
        <Text style={styles.infoText}>
          Los productos prestados se mostrarán en el catálogo y en la lista de útiles.
        </Text>
      </View>

      <Input
        label="Nombre del producto"
        placeholder="Ej: Cuaderno universitario"
        value={formData.nombre}
        onChangeText={(t) => setFormData((p) => ({ ...p, nombre: t }))}
        error={errors.nombre}
      />
      <Input
        label="Stock"
        placeholder="0"
        value={formData.stock}
        onChangeText={(t) => setFormData((p) => ({ ...p, stock: t }))}
        keyboardType="number-pad"
        error={errors.stock}
      />
      <Input
        label="Precio (S/)"
        placeholder="0.00"
        value={formData.precio}
        onChangeText={(t) => setFormData((p) => ({ ...p, precio: t }))}
        keyboardType="decimal-pad"
        error={errors.precio}
      />
      <Input
        label="Código o número de tienda"
        placeholder="Ej: TIENDA-001"
        value={formData.codigoTienda}
        onChangeText={(t) => setFormData((p) => ({ ...p, codigoTienda: t }))}
        error={errors.codigoTienda}
      />
      <Input
        label="Fecha de préstamo"
        placeholder="YYYY-MM-DD"
        value={formData.fechaPrestamo}
        onChangeText={(t) => setFormData((p) => ({ ...p, fechaPrestamo: t }))}
        error={errors.fechaPrestamo}
      />
      {Platform.OS === 'web' && (
        <Text style={styles.hint}>Formato: AAAA-MM-DD (ej: 2025-02-05)</Text>
      )}

      <Button
        title="Registrar préstamo"
        onPress={handleSubmit}
        loading={saving}
        style={styles.submitBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.textPrimary },
  hint: { fontSize: 12, color: Colors.textSecondary, marginBottom: Spacing.md },
  submitBtn: { marginTop: Spacing.md },
});
