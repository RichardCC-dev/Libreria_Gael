import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  getProducts,
  deleteProduct,
  Product,
} from '@/services/productService';
import { hasProductInActiveReservations } from '@/services/reservationService';

export default function InventarioScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const data = await getProducts(token ?? undefined);
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadProducts();
    }, [loadProducts])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!token) return;
    // HU6: Validar que no existan reservas activas asociadas
    const inReservations = await hasProductInActiveReservations(product.id, token);
    if (inReservations) {
      Alert.alert(
        'No se puede eliminar',
        `El producto "${product.nombre}" está incluido en una o más reservas activas (por confirmar, pendiente o confirmada). Debe cancelar o completar esas reservas antes de eliminar el producto.`
      );
      return;
    }
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de que deseas eliminar "${product.nombre}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            const response = await deleteProduct(product.id, token);
            if (response.success) {
              loadProducts();
            } else {
              Alert.alert('Error', response.message);
            }
          },
        },
      ]
    );
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.cardContent}>
        <View style={styles.productHeader}>
          <View style={styles.productIcon}>
            <Ionicons name="cube-outline" size={28} color={Colors.primary} />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.nombre}</Text>
            <Text style={styles.productCategory}>{item.categoria}</Text>
          </View>
          {canRegister && (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() =>
                  router.push({
                    pathname: '/inventario/editar-producto',
                    params: { id: item.id },
                  })
                }
              >
                <Ionicons
                  name="pencil"
                  size={22}
                  color={Colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDeleteProduct(item)}
              >
                <Ionicons
                  name="trash-outline"
                  size={22}
                  color={Colors.error}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.descripcion || 'Sin descripción'}
        </Text>
        <View style={styles.productFooter}>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>S/ {item.precio.toFixed(2)}</Text>
          </View>
          <View style={[styles.stockBadge, item.stock === 0 && styles.stockBadgeEmpty]}>
            <Text style={styles.stockText}>Stock: {item.stock}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const canRegister = user?.role === 'administrador';
  const canManagePrestamos = user?.role === 'empleado' || user?.role === 'administrador';

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return products;
    const q = busqueda.toLowerCase();
    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.categoria.toLowerCase().includes(q) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(q))
    );
  }, [products, busqueda]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando inventario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
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

      {canManagePrestamos && (
        <View style={styles.prestamosBar}>
          <TouchableOpacity
            style={styles.prestamoBtn}
            onPress={() => router.push('/inventario/productos-prestados')}
          >
            <Ionicons name="swap-horizontal-outline" size={20} color={Colors.primary} />
            <Text style={styles.prestamoBtnText}>Productos prestados</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.prestamoBtn}
            onPress={() => router.push('/inventario/registrar-prestamo')}
          >
            <Ionicons name="add-circle-outline" size={20} color={Colors.secondary} />
            <Text style={[styles.prestamoBtnText, { color: Colors.secondary }]}>
              Registrar préstamo
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderProductCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>No hay productos</Text>
            <Text style={styles.emptyText}>
              {canRegister
                ? 'Registra tu primer producto para comenzar'
                : 'No hay productos en el inventario'}
            </Text>
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

      {canRegister && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/inventario/registrar-producto')}
        >
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.small,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    minHeight: 44,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
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
  prestamosBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  prestamoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  prestamoBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionBtn: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.small,
  },
  deleteBtn: {
    backgroundColor: `${Colors.error}15`,
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.small,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'system',
  },
  productCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    fontFamily: 'system',
  },
  productDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontFamily: 'system',
  },
  productFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  priceBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'system',
  },
  stockBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
  },
  stockBadgeEmpty: {
    backgroundColor: `${Colors.error}20`,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'system',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    fontFamily: 'system',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontFamily: 'system',
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
