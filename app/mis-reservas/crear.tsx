import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getProducts, Product } from '@/services/productService';
import { getBorrowedProductsForCatalog } from '@/services/borrowedProductService';
import {
  createReservation,
  CreateReservationItem,
  MONTO_MINIMO,
} from '@/services/reservationService';

// Productos reservables: propios + prestados (HU15)
interface ReservableProduct {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  esPrestado?: boolean;
}
import { useFocusEffect } from 'expo-router';

export default function CrearReservaScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && user.role !== 'cliente') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);
  const [products, setProducts] = useState<ReservableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [productosPropios, prestados] = await Promise.all([
        getProducts(token),
        getBorrowedProductsForCatalog(token),
      ]);
      const propios: ReservableProduct[] = productosPropios
        .filter((p) => p.stock > 0)
        .map((p) => ({ id: p.id, nombre: p.nombre, precio: p.precio, stock: p.stock }));
      const prestadosMapeados: ReservableProduct[] = prestados.map((p) => ({
        id: p.id,
        nombre: p.nombre.replace(/\s*\(Préstamo\)\s*$/i, '').trim() || p.nombre,
        precio: p.precio,
        stock: p.stock,
        esPrestado: true,
      }));
      setProducts([...propios, ...prestadosMapeados]);
    } catch {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProducts();
    }, [loadProducts])
  );

  const itemsConCantidad = useMemo(() => {
    const result: { product: ReservableProduct; cantidad: number }[] = [];
    products.forEach((p) => {
      const val = cantidades[p.id] ?? '';
      const n = parseInt(val, 10);
      if (!isNaN(n) && n > 0) {
        result.push({ product: p, cantidad: Math.min(n, p.stock) });
      }
    });
    return result;
  }, [products, cantidades]);

  const total = useMemo(() => {
    return itemsConCantidad.reduce(
      (sum, { product, cantidad }) => sum + product.precio * cantidad,
      0
    );
  }, [itemsConCantidad]);

  const cumpleMinimo = total >= MONTO_MINIMO;

  const setCantidad = (productId: string, value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setCantidades((prev) => ({ ...prev, [productId]: value }));
    }
  };

  const handleCrearReserva = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para crear una reserva.');
      return;
    }
    if (itemsConCantidad.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un producto.');
      return;
    }
    if (!cumpleMinimo) {
      Alert.alert(
        'Monto insuficiente',
        `El monto mínimo es S/ ${MONTO_MINIMO.toFixed(2)}. Total: S/ ${total.toFixed(2)}`
      );
      return;
    }

    const items: CreateReservationItem[] = itemsConCantidad.map(({ product, cantidad }) => ({
      productId: product.id, // Incluye prod_ y prestado_
      cantidad,
    }));

    setSubmitting(true);
    setError(null);
    if (!token) return;
    const res = await createReservation({ clienteId: user.id, items }, token);
    setSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Reserva creada',
        'Tu reserva está en estado "Por confirmar". Un empleado la revisará pronto.',
        [{ text: 'Ver mis reservas', onPress: () => router.replace('/mis-reservas') }]
      );
    } else {
      Alert.alert('Error', res.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cube-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.emptyTitle}>Sin productos disponibles</Text>
        <Text style={styles.emptyText}>
          No hay productos con stock para reservar en este momento.
        </Text>
        <Button title="Volver al catálogo" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

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
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.infoText}>
            Monto mínimo: S/ {MONTO_MINIMO.toFixed(2)}. Solo productos con stock disponible.
          </Text>
        </View>

        {products.map((p) => (
          <View key={p.id} style={styles.productRow}>
            <View style={styles.productInfo}>
              <View style={styles.productNameRow}>
                <Text style={styles.productName}>{p.nombre}</Text>
              </View>
              <Text style={styles.productMeta}>
                S/ {p.precio.toFixed(2)} × {p.stock} en stock
              </Text>
            </View>
            <View style={styles.quantityRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => {
                  const v = cantidades[p.id] ?? '0';
                  const n = parseInt(v, 10) || 0;
                  if (n > 1) setCantidad(p.id, String(n - 1));
                  else setCantidad(p.id, '');
                }}
              >
                <Ionicons name="remove" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <TextInput
                style={styles.qtyInput}
                value={cantidades[p.id] ?? ''}
                onChangeText={(t) => setCantidad(p.id, t)}
                placeholder="0"
                keyboardType="number-pad"
                maxLength={4}
              />
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => {
                  const v = cantidades[p.id] ?? '0';
                  const n = parseInt(v, 10) || 0;
                  if (n < p.stock) setCantidad(p.id, String(n + 1));
                }}
              >
                <Ionicons name="add" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text>
        </View>
        {total > 0 && !cumpleMinimo && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            <Text style={styles.warningText}>
              Faltan S/ {(MONTO_MINIMO - total).toFixed(2)} para el monto mínimo
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={[styles.footerValue, !cumpleMinimo && styles.footerValueInvalid]}>
            S/ {total.toFixed(2)}
          </Text>
        </View>
        <Button
          title="Crear reserva"
          onPress={handleCrearReserva}
          disabled={itemsConCantidad.length === 0 || !cumpleMinimo}
          loading={submitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
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
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productInfo: {
    flex: 1,
  },
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  prestadoBadge: {
    backgroundColor: `${Colors.secondary}25`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.small,
  },
  prestadoBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
  productMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyInput: {
    width: 48,
    height: 36,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
  },
  warningText: {
    fontSize: 13,
    color: Colors.warning,
  },
  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  footerLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  footerValueInvalid: {
    color: Colors.error,
  },
});
