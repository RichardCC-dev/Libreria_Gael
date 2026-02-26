import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProductById,
  updateProduct,
  UpdateProductData,
} from '@/services/productService';

export default function EditarProductoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const productId = params.id as string;

  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateProductData>({
    descripcion: '',
    precio: '',
    stock: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProductData, string>>>({});
  const [productName, setProductName] = useState('');

  useEffect(() => {
    if (user?.role !== 'administrador') {
      Alert.alert(
        'Acceso denegado',
        'Solo los administradores pueden editar productos.',
        [{ text: 'Volver', onPress: () => router.back() }]
      );
      return;
    }

    const load = async () => {
      if (!productId) {
        Alert.alert('Error', 'Producto no especificado');
        router.back();
        return;
      }
      const product = await getProductById(productId, token ?? undefined);
      if (!product) {
        Alert.alert('Error', 'Producto no encontrado');
        router.back();
        return;
      }
      setProductName(product.nombre);
      setFormData({
        descripcion: product.descripcion,
        precio: String(product.precio),
        stock: String(product.stock),
      });
      setLoading(false);
    };
    load();
  }, [productId, user, token, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateProductData, string>> = {};

    const precioNum =
      typeof formData.precio === 'string'
        ? parseFloat(formData.precio)
        : formData.precio;
    if (
      formData.precio === '' ||
      formData.precio === null ||
      formData.precio === undefined
    ) {
      newErrors.precio = 'El precio es obligatorio';
    } else if (isNaN(precioNum) || precioNum < 0) {
      newErrors.precio = 'El precio debe ser un número válido mayor o igual a 0';
    }

    const stockNum =
      typeof formData.stock === 'string'
        ? parseInt(formData.stock, 10)
        : formData.stock;
    if (
      formData.stock === '' ||
      formData.stock === null ||
      formData.stock === undefined
    ) {
      newErrors.stock = 'El stock es obligatorio';
    } else if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      newErrors.stock = 'El stock debe ser un número entero mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (!token) return;
      const response = await updateProduct(productId, formData, token);

      if (response.success) {
        Alert.alert('Producto Actualizado', response.message, [
          { text: 'OK', onPress: () => router.replace('/inventario') },
        ]);
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Ocurrió un error al actualizar el producto. Inténtalo nuevamente.'
      );
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof UpdateProductData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (user?.role !== 'administrador') {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

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
        <View style={styles.formContainer}>
          <View style={styles.productHeader}>
            <Ionicons name="cube-outline" size={24} color={Colors.primary} />
            <Text style={styles.productName}>{productName}</Text>
          </View>

          <Input
            label="Descripción"
            placeholder="Descripción del producto"
            value={String(formData.descripcion || '')}
            onChangeText={(v) => updateField('descripcion', v)}
            error={errors.descripcion}
            multiline
            numberOfLines={3}
            style={styles.textArea}
            leftIcon={
              <Ionicons
                name="document-text-outline"
                size={20}
                color={Colors.textSecondary}
              />
            }
          />

          <Input
            label="Precio (S/)"
            placeholder="0.00"
            value={String(formData.precio)}
            onChangeText={(v) => updateField('precio', v)}
            error={errors.precio}
            keyboardType="decimal-pad"
            leftIcon={
              <Ionicons
                name="cash-outline"
                size={20}
                color={Colors.textSecondary}
              />
            }
          />

          <Input
            label="Stock"
            placeholder="0"
            value={String(formData.stock)}
            onChangeText={(v) => updateField('stock', v)}
            error={errors.stock}
            keyboardType="number-pad"
            leftIcon={
              <Ionicons
                name="pricetags-outline"
                size={20}
                color={Colors.textSecondary}
              />
            }
          />

          <Button
            title="Guardar Cambios"
            onPress={handleSubmit}
            loading={saving}
            disabled={saving}
            style={styles.submitButton}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'system',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  formContainer: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'system',
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
