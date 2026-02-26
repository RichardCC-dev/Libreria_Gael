import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { getSales, Sale, SalesFilter } from '@/services/saleService';

const FILTRO_TODOS = 'todos';
const FILTRO_HOY = 'hoy';
const FILTRO_SEMANA = 'semana';
const FILTRO_MES = 'mes';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMesesParaFiltro(): { value: string; label: string }[] {
  const meses: { value: string; label: string }[] = [{ value: FILTRO_TODOS, label: 'Todos' }];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const value = `${y}-${String(m).padStart(2, '0')}`;
    const label = d.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
    meses.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return meses;
}

export default function HistorialVentasScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<string>(FILTRO_TODOS);

  useEffect(() => {
    if (authLoading) return;
    if (user && user.role !== 'administrador') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const buildFilter = useCallback((): SalesFilter | undefined => {
    const now = new Date();
    if (filtro === FILTRO_TODOS) return undefined;
    if (filtro === FILTRO_HOY) {
      const hoy = now.toISOString().slice(0, 10);
      return { desde: hoy, hasta: hoy };
    }
    if (filtro === FILTRO_SEMANA) {
      const inicio = new Date(now);
      inicio.setDate(inicio.getDate() - inicio.getDay());
      const fin = new Date(inicio);
      fin.setDate(fin.getDate() + 6);
      return {
        desde: inicio.toISOString().slice(0, 10),
        hasta: fin.toISOString().slice(0, 10),
      };
    }
    if (filtro === FILTRO_MES) {
      const y = now.getFullYear();
      const m = now.getMonth() + 1;
      return { temporada: `${y}-${String(m).padStart(2, '0')}` };
    }
    if (filtro.includes('-') && filtro.length === 7) {
      return { temporada: filtro };
    }
    return undefined;
  }, [filtro]);

  const loadSales = useCallback(async () => {
    if (!token) return;
    try {
      const filter = buildFilter();
      const data = await getSales(filter, token);
      setSales(data);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildFilter, token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadSales();
    }, [loadSales])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadSales();
  };

  const totalGeneral = useMemo(
    () => sales.reduce((sum, s) => sum + s.total, 0),
    [sales]
  );

  const chipsRapidos = [
    { value: FILTRO_TODOS, label: 'Todos' },
    { value: FILTRO_HOY, label: 'Hoy' },
    { value: FILTRO_SEMANA, label: 'Esta semana' },
    { value: FILTRO_MES, label: 'Este mes' },
  ];

  const mesesTemporada = getMesesParaFiltro();

  const renderSaleCard = ({ item }: { item: Sale }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardId}>#{item.id.replace('venta_', '')}</Text>
        <Text style={styles.cardFecha}>{formatDate(item.fecha)}</Text>
      </View>
      <View style={styles.vendedorRow}>
        <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
        <Text style={styles.vendedorText}>{item.empleadoName}</Text>
      </View>
      <View style={styles.itemsPreview}>
        {item.items.slice(0, 2).map((i) => (
          <Text key={i.productId} style={styles.itemLine} numberOfLines={1}>
            • {i.productName} × {i.cantidad}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.itemLine}>• +{item.items.length - 2} más</Text>
        )}
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.totalText}>S/ {item.total.toFixed(2)}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtros rápidos */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsContainer}
        style={styles.chipsScroll}
      >
        {chipsRapidos.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[styles.chip, filtro === c.value && styles.chipSelected]}
            onPress={() => setFiltro(c.value)}
          >
            <Text
              style={[
                styles.chipText,
                filtro === c.value && styles.chipTextSelected,
              ]}
            >
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Temporada (mes/año) */}
      <View style={styles.temporadaSection}>
        <Text style={styles.temporadaLabel}>Temporada (mes/año)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mesesContainer}
        >
          {mesesTemporada.map((m) => (
            <TouchableOpacity
              key={m.value}
              style={[
                styles.mesChip,
                filtro === m.value && styles.mesChipSelected,
              ]}
              onPress={() => setFiltro(m.value)}
            >
              <Text
                style={[
                  styles.mesChipText,
                  filtro === m.value && styles.mesChipTextSelected,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Resumen del periodo */}
      <View style={styles.resumenBox}>
        <Ionicons name="stats-chart-outline" size={24} color={Colors.primary} />
        <View style={styles.resumenContent}>
          <Text style={styles.resumenLabel}>Total del periodo</Text>
          <Text style={styles.resumenValue}>
            S/ {totalGeneral.toFixed(2)} ({sales.length} venta{sales.length !== 1 ? 's' : ''})
          </Text>
        </View>
      </View>

      {/* Lista de ventas */}
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        renderItem={renderSaleCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>Sin ventas</Text>
            <Text style={styles.emptyText}>
              {filtro !== FILTRO_TODOS
                ? 'No hay ventas en el periodo seleccionado.'
                : 'Aún no hay ventas registradas.'}
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
  },
  chipsScroll: {
    maxHeight: 48,
  },
  chipsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  chipText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  temporadaSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  temporadaLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  mesesContainer: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  mesChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mesChipSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  mesChipText: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  mesChipTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  resumenBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  resumenContent: {
    flex: 1,
  },
  resumenLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  resumenValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 32,
  },
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
    marginBottom: Spacing.xs,
  },
  cardId: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  cardFecha: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  vendedorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  vendedorText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  itemsPreview: {
    marginBottom: Spacing.md,
  },
  itemLine: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.sm,
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
});
