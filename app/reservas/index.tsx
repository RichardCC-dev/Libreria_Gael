import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  getReservationsForStaff,
  getStatusLabel,
  Reservation,
  ReservationStatus,
} from '@/services/reservationService';
import { useEffect } from 'react';

const FILTRO_TODOS = 'Todos';

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

function getStatusColor(status: ReservationStatus) {
  switch (status) {
    case 'por_confirmar':
      return Colors.warning;
    case 'pendiente':
      return Colors.primary;
    case 'confirmada':
      return Colors.success;
    case 'cancelado':
      return Colors.error;
    default:
      return Colors.textSecondary;
  }
}

export default function ReservasScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>(FILTRO_TODOS);

  useEffect(() => {
    if (authLoading) return;
    if (user && user.role !== 'empleado' && user.role !== 'administrador') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);

  const loadReservations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getReservationsForStaff(token);
      setReservations(data);
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
      loadReservations();
    }, [loadReservations])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const reservasFiltradas = useMemo(() => {
    if (filtroEstado === FILTRO_TODOS) return reservations;
    return reservations.filter((r) => r.estado === filtroEstado);
  }, [reservations, filtroEstado]);

  const estadosParaFiltro: string[] = [
    FILTRO_TODOS,
    'por_confirmar',
    'pendiente',
    'confirmada',
    'cancelado',
  ];

  const renderCard = ({ item }: { item: Reservation }) => {
    const statusColor = getStatusColor(item.estado);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/reservas/${item.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardId}>#{item.id.replace('res_', '')}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}25` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusLabel(item.estado)}
            </Text>
          </View>
        </View>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
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
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filtros por estado */}
      <FlatList
        horizontal
        data={estadosParaFiltro}
        keyExtractor={(e) => e}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtrosContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filtroChip,
              filtroEstado === item && styles.filtroChipSelected,
            ]}
            onPress={() => setFiltroEstado(item)}
          >
            <Text
              style={[
                styles.filtroChipText,
                filtroEstado === item && styles.filtroChipTextSelected,
              ]}
            >
              {item === FILTRO_TODOS ? 'Todos' : getStatusLabel(item as ReservationStatus)}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={reservasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Sin reservas</Text>
            <Text style={styles.emptyText}>
              {filtroEstado !== FILTRO_TODOS
                ? 'No hay reservas en este estado.'
                : 'Aún no hay reservas registradas.'}
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
  filtrosContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  filtroChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filtroChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filtroChipText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  filtroChipTextSelected: {
    color: Colors.white,
    fontWeight: '600',
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  itemsPreview: {
    marginBottom: Spacing.md,
  },
  itemLine: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
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
