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
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, CatalogProduct, CATEGORIAS } from '@/services/productService';
import { getBorrowedProductsForCatalog } from '@/services/borrowedProductService';
import { useAuth } from '@/contexts/AuthContext';

const TODAS = 'Todas';

export default function CatalogoScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(TODAS);

  const loadProducts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const [productosPropios, prestados] = await Promise.all([
        getProducts(token),
        getBorrowedProductsForCatalog(token),
      ]);
      const prestadosMapeados: CatalogProduct[] = prestados.map((p) => ({
        id: p.id,
        nombre: p.nombre.replace(/\s*\(Préstamo\)\s*$/i, '').trim() || p.nombre,
        categoria: 'Otros',
        descripcion: p.nombre.replace(/\s*\(Préstamo\)\s*$/i, '').trim() || p.nombre,
        precio: p.precio,
        stock: p.stock,
        createdAt: p.createdAt,
        esPrestado: true,
        codigoTienda: p.codigoTienda,
      }));
      setProducts([...productosPropios, ...prestadosMapeados]);
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

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  // Categorías con conteo de productos
  const categoriasConConteo = useMemo(() => {
    const conteo: Record<string, number> = {};
    products.forEach((p) => {
      conteo[p.categoria] = (conteo[p.categoria] || 0) + 1;
    });
    return conteo;
  }, [products]);

  const productosFiltrados = useMemo(() => {
    return products.filter((p) => {
      const coincideBusqueda =
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria =
        categoriaSeleccionada === TODAS || p.categoria === categoriaSeleccionada;
      return coincideBusqueda && coincideCategoria;
    });
  }, [products, busqueda, categoriaSeleccionada]);

  const disponibles = productosFiltrados.filter((p) => p.stock > 0).length;
  const agotados = productosFiltrados.filter((p) => p.stock === 0).length;

  const renderProductCard = ({ item }: { item: CatalogProduct }) => {
    const agotado = item.stock === 0;
    return (
      <View style={[styles.productCard, agotado && styles.productCardAgotado]}>
        {/* Badge de estado (no se muestra "Prestado" al cliente) */}
        <View
          style={[
            styles.estadoBadge,
            agotado ? styles.estadoAgotado : styles.estadoDisponible,
          ]}
        >
          <Ionicons
            name={agotado ? 'close-circle' : 'checkmark-circle'}
            size={12}
            color={Colors.white}
            style={styles.estadoIcon}
          />
          <Text style={styles.estadoText}>
            {agotado ? 'Agotado' : 'Disponible'}
          </Text>
        </View>

        {/* Header del producto */}
        <View style={styles.productHeader}>
          <View
            style={[
              styles.productIcon,
              agotado && styles.productIconAgotado,
            ]}
          >
            <Ionicons
              name="storefront-outline"
              size={28}
              color={agotado ? Colors.textSecondary : Colors.success}
            />
          </View>
          <View style={styles.productInfo}>
            <Text
              style={[styles.productName, agotado && styles.productNameAgotado]}
            >
              {item.nombre}
            </Text>
            <View style={styles.categoryRow}>
              <Ionicons
                name="pricetag-outline"
                size={12}
                color={Colors.textSecondary}
              />
              <Text style={styles.productCategory}> {item.categoria}</Text>
            </View>
          </View>
        </View>

        {/* Descripción */}
        <Text
          style={[styles.productDescription, agotado && styles.textMuted]}
          numberOfLines={2}
        >
          {item.descripcion}
        </Text>

        {/* Footer: precio + stock */}
        <View style={styles.productFooter}>
          <View
            style={[
              styles.priceBadge,
              agotado && styles.priceBadgeAgotado,
            ]}
          >
            <Text style={styles.priceText}>S/ {item.precio.toFixed(2)}</Text>
          </View>

          {agotado ? (
            <View style={styles.stockAgotadoBadge}>
              <Ionicons
                name="alert-circle-outline"
                size={14}
                color={Colors.error}
              />
              <Text style={styles.stockAgotadoText}>Sin stock</Text>
            </View>
          ) : (
            <View style={styles.stockBadge}>
              <Ionicons name="cube-outline" size={14} color={Colors.success} />
              <Text style={styles.stockText}>{item.stock} en stock</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const categoriasDisponibles = [TODAS, ...CATEGORIAS.filter((c) => categoriasConConteo[c])];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.success} />
        <Text style={styles.loadingText}>Cargando catálogo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botón nueva reserva (solo clientes) */}
      {user?.role === 'cliente' && (
        <TouchableOpacity
          style={styles.reservaBtn}
          onPress={() => router.push('/mis-reservas/crear')}
        >
          <Ionicons name="calendar-outline" size={20} color={Colors.white} />
          <Text style={styles.reservaBtnText}>Nueva reserva</Text>
        </TouchableOpacity>
      )}

      {/* Buscador */}
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

      {/* Chips de categoría (sección agrandada) */}
      <View style={styles.categoriasSection}>
        <Text style={styles.categoriasSectionTitle}>Filtrar por categoría</Text>
        <FlatList
          horizontal
          data={categoriasDisponibles}
          keyExtractor={(cat) => cat}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                categoriaSeleccionada === cat && styles.chipSelected,
              ]}
              onPress={() => setCategoriaSeleccionada(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  categoriaSeleccionada === cat && styles.chipTextSelected,
                ]}
              >
                {cat}
                {cat !== TODAS && categoriasConConteo[cat]
                  ? ` (${categoriasConConteo[cat]})`
                  : ''}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Resumen */}
      <View style={styles.resumenRow}>
        <View style={styles.resumenItem}>
          <View style={[styles.resumenDot, { backgroundColor: Colors.success }]} />
          <Text style={styles.resumenText}>{disponibles} disponibles</Text>
        </View>
        <View style={styles.resumenItem}>
          <View style={[styles.resumenDot, { backgroundColor: Colors.error }]} />
          <Text style={styles.resumenText}>{agotados} agotados</Text>
        </View>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderProductCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={56}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              No se encontraron productos con los filtros aplicados
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.success]}
          />
        }
      />
    </View>
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

  /* Botón reserva */
  reservaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
  },
  reservaBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },

  /* Buscador */
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
    fontFamily: 'system',
    paddingVertical: Spacing.sm,
  },

  /* Chips de categoría - sección agrandada */
  categoriasSection: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoriasSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  chipsContainer: {
    paddingBottom: Spacing.xs,
    gap: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontFamily: 'system',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },

  /* Resumen */
  resumenRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  resumenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  resumenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  resumenText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'system',
  },

  /* Lista */
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 32,
  },

  /* Card */
  productCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  productCardAgotado: {
    backgroundColor: '#FAFAFA',
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  estadoBadge: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.medium,
    gap: 3,
  },
  estadoDisponible: {
    backgroundColor: Colors.success,
  },
  estadoAgotado: {
    backgroundColor: Colors.error,
  },
  estadoPrestado: {
    backgroundColor: Colors.secondary,
  },
  estadoIcon: {},
  estadoText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'system',
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingRight: 80,           // espacio para el badge de estado
  },
  productIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.small,
    backgroundColor: `${Colors.success}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  productIconAgotado: {
    backgroundColor: `${Colors.textSecondary}15`,
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
  productNameAgotado: {
    color: Colors.textSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  productCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'system',
  },
  productDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    fontFamily: 'system',
  },
  textMuted: {
    color: '#94A3B8',
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
  priceBadgeAgotado: {
    backgroundColor: Colors.textSecondary,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'system',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.success}20`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
    fontFamily: 'system',
  },
  stockAgotadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: `${Colors.error}15`,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
  },
  stockAgotadoText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
    fontFamily: 'system',
  },

  /* Estado vacío */
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    fontFamily: 'system',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'system',
  },
});
