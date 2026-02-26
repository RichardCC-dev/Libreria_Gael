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

interface ProductForSale {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  esPrestado?: boolean;
}
import {
  registerSale,
  RegisterSaleItem,
} from '@/services/saleService';
import { useFocusEffect } from 'expo-router';

export default function RegistrarVentaScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<ProductForSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [descuento, setDescuento] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (user && user.role !== 'empleado' && user.role !== 'administrador') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

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
      const propios: ProductForSale[] = productosPropios
        .filter((p) => p.stock > 0)
        .map((p) => ({ id: p.id, nombre: p.nombre, precio: p.precio, stock: p.stock }));
      const prestadosMapeados: ProductForSale[] = prestados.map((p) => ({
        id: p.id,
        nombre: p.nombre.replace(/\s*\(Préstamo\)\s*$/i, '').trim() || p.nombre,
        precio: p.precio,
        stock: p.stock,
        esPrestado: true,
      }));
      setProducts([...propios, ...prestadosMapeados]);
    } catch {
      /* silencioso */
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

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return products;
    const q = busqueda.toLowerCase();
    return products.filter((p) => p.nombre.toLowerCase().includes(q));
  }, [products, busqueda]);

  const itemsConCantidad = useMemo(() => {
    const result: { product: ProductForSale; cantidad: number }[] = [];
    productosFiltrados.forEach((p) => {
      const val = cantidades[p.id] ?? '';
      const n = parseInt(val, 10);
      if (!isNaN(n) && n > 0) {
        result.push({ product: p, cantidad: Math.min(n, p.stock) });
      }
    });
    return result;
  }, [productosFiltrados, cantidades]);

  const subtotal = useMemo(() => {
    return itemsConCantidad.reduce(
      (sum, { product, cantidad }) => sum + product.precio * cantidad,
      0
    );
  }, [itemsConCantidad]);

  const descuentoNum = Math.min(Math.max(0, parseFloat(descuento) || 0), subtotal);
  const total = Math.max(0, subtotal - descuentoNum);

  const setCantidad = (productId: string, value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setCantidades((prev) => ({ ...prev, [productId]: value }));
    }
  };

  const handleRegistrarVenta = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Debes iniciar sesión para registrar una venta.');
      return;
    }
    if (itemsConCantidad.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un producto.');
      return;
    }

    const items: RegisterSaleItem[] = itemsConCantidad.map(({ product, cantidad }) => ({
      productId: product.id,
      cantidad,
    }));

    const descuentoVal = Math.min(Math.max(0, parseFloat(descuento) || 0), subtotal);

    if (!token) return;
    setSubmitting(true);
    const res = await registerSale({
      empleadoId: user.id,
      empleadoName: user.name || user.email,
      items,
      descuento: descuentoVal,
    }, token);
    setSubmitting(false);

    if (res.success && res.sale) {
      setCantidades({});
      router.push({
        pathname: '/ventas/comprobante',
        params: { sale: JSON.stringify(res.sale) },
      });
    } else {
      Alert.alert('Error', res.message || 'No se pudo registrar la venta.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.secondary} />
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
          No hay productos con stock para vender en este momento.
        </Text>
        <Button title="Volver" onPress={() => router.back()} variant="outline" />
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
        {user?.role === 'administrador' && (
          <TouchableOpacity
            style={styles.historialBtn}
            onPress={() => router.push('/ventas/historial')}
          >
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.historialBtnText}>Ver historial de ventas</Text>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}

        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar producto..."
            placeholderTextColor={Colors.textSecondary}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="receipt-outline" size={24} color={Colors.secondary} />
          <Text style={styles.infoText}>
            Selecciona los productos vendidos. El stock se descontará automáticamente.
          </Text>
        </View>

        {itemsConCantidad.length > 0 && (
          <View style={styles.descuentoRow}>
            <Text style={styles.descuentoInputLabel}>Descuento (opcional)</Text>
            <TextInput
              style={styles.descuentoInput}
              placeholder="0.00"
              value={descuento}
              onChangeText={(t) => {
                if (t === '' || /^\d*\.?\d*$/.test(t)) setDescuento(t);
              }}
              keyboardType="decimal-pad"
            />
          </View>
        )}

        <Text style={styles.sectionTitle}>Productos en venta</Text>
        {productosFiltrados.length === 0 ? (
          <View style={styles.emptySearch}>
            <Ionicons name="search-outline" size={40} color={Colors.textSecondary} />
            <Text style={styles.emptySearchText}>Sin resultados para tu búsqueda</Text>
            <Text style={styles.emptySearchHint}>Intenta con otro término</Text>
          </View>
        ) : (
          <>
          {productosFiltrados.map((p) => (
            <View key={p.id} style={styles.productRow}>
              <View style={styles.productInfo}>
                <View style={styles.productNameRow}>
                  <Text style={styles.productName}>{p.nombre}</Text>
                  {p.esPrestado && (
                    <View style={styles.prestadoBadge}>
                      <Text style={styles.prestadoBadgeText}>Prestado</Text>
                    </View>
                  )}
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
                  <Ionicons name="remove" size={20} color={Colors.secondary} />
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
                  <Ionicons name="add" size={20} color={Colors.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          </>
        )}

        {descuentoNum > 0 && (
          <View style={styles.descuentoSection}>
            <Text style={styles.descuentoLabel}>Descuento</Text>
            <Text style={styles.descuentoValue}>- S/ {descuentoNum.toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>S/ {total.toFixed(2)}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerLabel}>Total a cobrar</Text>
          <Text style={styles.footerValue}>S/ {total.toFixed(2)}</Text>
        </View>
        {descuentoNum > 0 && (
          <Text style={styles.footerDescuento}>Incluye descuento de S/ {descuentoNum.toFixed(2)}</Text>
        )}
        <View style={styles.footerActions}>
          <Button
            title="Ver boleta previa"
            onPress={() => {
              const itemsData = itemsConCantidad.map(({ product, cantidad }) => ({
                productId: product.id,
                productName: product.nombre,
                cantidad,
                precioUnitario: product.precio,
              }));
              router.push({
                pathname: '/ventas/boleta-previa',
                params: { items: JSON.stringify(itemsData) },
              });
            }}
            disabled={itemsConCantidad.length === 0}
            variant="outline"
          />
          <Button
            title="Registrar venta"
            onPress={handleRegistrarVenta}
            disabled={itemsConCantidad.length === 0}
            loading={submitting}
            variant="secondary"
          />
        </View>
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
  historialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: `${Colors.primary}15`,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.primary}40`,
    gap: Spacing.sm,
  },
  historialBtnText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    minHeight: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.secondary}15`,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.secondary}40`,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
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
  descuentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  descuentoInputLabel: { fontSize: 14, color: Colors.textSecondary },
  descuentoInput: {
    width: 100,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.small,
    fontSize: 16,
    textAlign: 'right',
  },
  descuentoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  descuentoLabel: { fontSize: 14, color: Colors.textSecondary },
  descuentoValue: { fontSize: 14, color: Colors.error, fontWeight: '600' },
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
    color: Colors.secondary,
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
  footerActions: {
    gap: Spacing.sm,
  },
  footerLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footerValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.secondary,
  },
  footerDescuento: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: -Spacing.sm,
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptySearchText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  emptySearchHint: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
