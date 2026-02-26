import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  registerProduct,
  RegisterProductData,
  CATEGORIAS,
} from '@/services/productService';

export default function RegistrarProductoScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [formData, setFormData] = useState<RegisterProductData>({
    nombre: '',
    categoria: '',
    descripcion: '',
    precio: '',
    stock: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterProductData, string>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== 'administrador') {
      Alert.alert(
        'Acceso denegado',
        'Solo los administradores pueden registrar productos.',
        [{ text: 'Volver', onPress: () => router.back() }]
      );
    }
  }, [user, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterProductData, string>> = {};

    if (!String(formData.nombre || '').trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (!String(formData.categoria || '').trim()) {
      newErrors.categoria = 'La categoría es obligatoria';
    }

    const precioNum =
      typeof formData.precio === 'string'
        ? parseFloat(formData.precio)
        : formData.precio;
    if (formData.precio === '' || formData.precio === null || formData.precio === undefined) {
      newErrors.precio = 'El precio es obligatorio';
    } else if (isNaN(precioNum) || precioNum < 0) {
      newErrors.precio = 'El precio debe ser un número válido mayor o igual a 0';
    }

    const stockNum =
      typeof formData.stock === 'string'
        ? parseInt(formData.stock, 10)
        : formData.stock;
    if (formData.stock === '' || formData.stock === null || formData.stock === undefined) {
      newErrors.stock = 'El stock es obligatorio';
    } else if (isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      newErrors.stock = 'El stock debe ser un número entero mayor o igual a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (!token) return;
      const response = await registerProduct(formData, token);

      if (response.success) {
        Alert.alert(
          'Producto Registrado',
          response.message,
          [
            {
              text: 'Registrar otro',
              onPress: () => {
                setFormData({
                  nombre: '',
                  categoria: '',
                  descripcion: '',
                  precio: '',
                  stock: '',
                });
                setErrors({});
              },
            },
            {
              text: 'Ver inventario',
              onPress: () => router.replace('/inventario'),
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Ocurrió un error al registrar el producto. Inténtalo nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof RegisterProductData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (user?.role !== 'administrador') {
    return null;
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
          <Input
            label="Nombre del Producto"
            placeholder="Ej: Cuaderno College 100 hojas"
            value={formData.nombre}
            onChangeText={(v) => updateField('nombre', v)}
            error={errors.nombre}
            leftIcon={
              <Ionicons
                name="cube-outline"
                size={20}
                color={Colors.textSecondary}
              />
            }
          />

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Categoría</Text>
            <View style={styles.categoriesGrid}>
              {CATEGORIAS.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    formData.categoria === cat && styles.categoryChipSelected,
                  ]}
                  onPress={() => updateField('categoria', cat)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      formData.categoria === cat && styles.categoryTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.categoria && (
              <Text style={styles.errorText}>{errors.categoria}</Text>
            )}
          </View>

          <Input
            label="Descripción"
            placeholder="Descripción del producto (opcional)"
            value={formData.descripcion}
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
            title="Registrar Producto"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.submitButton}
          />

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.infoBoxText}>
              Los productos registrados se almacenan en el inventario y estarán
              disponibles en el catálogo.
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
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  formContainer: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  fieldContainer: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontFamily: 'system',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontFamily: 'system',
  },
  categoryTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: Spacing.xs,
    fontFamily: 'system',
  },
  textArea: {
    minHeight: 80,
    paddingTop: Spacing.md,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EBF5FF',
    borderRadius: BorderRadius.small,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontFamily: 'system',
  },
});
