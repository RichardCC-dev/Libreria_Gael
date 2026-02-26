import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  getBorrowedProducts,
  updateBorrowedProductStatus,
  getStatusLabel,
  BorrowedProduct,
} from '@/services/borrowedProductService';

const FILTRO_TODOS = 'Todos';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProductosPrestadosScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<BorrowedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<string>(FILTRO_TODOS);
  const [busqueda, setBusqueda] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (user && user.role !== 'empleado' && user.role !== 'administrador') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const loadProducts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await getBorrowedProducts(token);
      setProducts(data);
    } catch {
      /* silencioso */
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

  const productosFiltrados = useMemo(() => {
    let result = filtro === FILTRO_TODOS
      ? products
      : products.filter((p) => p.estado === filtro);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.codigoTienda.toLowerCase().includes(q)
      );
    }
    return result;
  }, [products, filtro, busqueda]);

  const handleCambiarEstado = (item: BorrowedProduct) => {
    if (item.estado === 'pendiente') {
      Alert.alert(
        'Cancelar préstamo',
        `¿Marcar "${item.nombre}" como cancelado?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí, cancelar',
            style: 'destructive',
            onPress: async () => {
              setUpdatingId(item.id);
              const res = await updateBorrowedProductStatus(item.id, 'cancelado', token);
              setUpdatingId(null);
              if (res.success) loadProducts();
              else Alert.alert('Error', res.message);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Reactivar préstamo',
        `¿Marcar "${item.nombre}" como pendiente?`,
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Sí',
            onPress: async () => {
              setUpdatingId(item.id);
              const res = await updateBorrowedProductStatus(item.id, 'pendiente', token);
              setUpdatingId(null);
              if (res.success) loadProducts();
              else Alert.alert('Error', res.message);
            },
          },
        ]
      );
    }
  };

  const renderCard = ({ item }: { item: BorrowedProduct }) => {
    const esPendiente = item.estado === 'pendiente';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.productName}>{item.nombre}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: esPendiente ? `${Colors.success}25` : `${Colors.error}25` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: esPendiente ? Colors.success : Colors.error },
              ]}
            >
              {getStatusLabel(item.estado)}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <Ionicons name="storefront-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.rowText}>Tienda: {item.codigoTienda}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.rowText}>{item.empleadoName}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.precio}>S/ {item.precio.toFixed(2)}</Text>
          <Text style={styles.stock}>Stock: {item.stock}</Text>
          <Text style={styles.fecha}>{formatDate(item.fechaPrestamo)}</Text>
        </View>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleCambiarEstado(item)}
          disabled={!!updatingId}
        >
          {updatingId === item.id ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Ionicons
                name={esPendiente ? 'close-circle-outline' : 'refresh-outline'}
                size={18}
                color={esPendiente ? Colors.error : Colors.primary}
              />
              <Text
                style={[styles.actionText, { color: esPendiente ? Colors.error : Colors.primary }]}
              >
                {esPendiente ? 'Cancelar' : 'Reactivar'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando préstamos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o código tienda..."
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
      <View style={styles.filtrosRow}>
        {[FILTRO_TODOS, 'pendiente', 'cancelado'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filtro === f && styles.chipSelected]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.chipText, filtro === f && styles.chipTextSelected]}>
              {f === FILTRO_TODOS ? 'Todos' : getStatusLabel(f as 'pendiente' | 'cancelado')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="swap-horizontal-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin préstamos</Text>
            <Text style={styles.emptyText}>
              {filtro !== FILTRO_TODOS
                ? 'No hay préstamos en este estado.'
                : 'Registra un producto prestado para comenzar.'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProducts(); }} colors={[Colors.primary]} />
        }
      />
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
  loadingText: { fontSize: 16, color: Colors.textSecondary },
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
  filtrosRow: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 13, color: Colors.textPrimary, fontWeight: '500' },
  chipTextSelected: { color: Colors.white, fontWeight: '600' },
  listContent: { padding: Spacing.lg, paddingBottom: 32 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  productName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  rowText: { fontSize: 14, color: Colors.textSecondary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  precio: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  stock: { fontSize: 13, color: Colors.textSecondary },
  fecha: { fontSize: 12, color: Colors.textSecondary, marginLeft: 'auto' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionText: { fontSize: 14, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
});
