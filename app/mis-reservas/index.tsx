import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  getReservationsByClient,
  cancelReservation,
  getStatusLabel,
  canClientCancel,
  Reservation,
} from '@/services/reservationService';

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

function getStatusColor(status: string) {
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

export default function MisReservasScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && user.role !== 'cliente') {
      router.replace('/dashboard');
    }
  }, [user, authLoading, router]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const data = await getReservationsByClient(user.id, token);
      setReservations(data);
    } catch {
      /* silencioso */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, token]);

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

  const handleCancel = (r: Reservation) => {
    if (!user?.id) return;
    if (!canClientCancel(r)) {
      Alert.alert(
        'No se puede cancelar',
        'Solo puedes cancelar reservas en estado "Por confirmar" y dentro de las primeras 24 horas.'
      );
      return;
    }
    Alert.alert(
      'Cancelar reserva',
      '¿Estás seguro? Los productos volverán al catálogo.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancellingId(r.id);
            const res = await cancelReservation(r.id, user.id, token);
            setCancellingId(null);
            if (res.success) {
              loadReservations();
              Alert.alert('Listo', res.message);
            } else {
              Alert.alert('Error', res.message);
            }
          },
        },
      ]
    );
  };

  const renderReservationCard = ({ item }: { item: Reservation }) => {
    const statusColor = getStatusColor(item.estado);
    const puedeCancelar = canClientCancel(item);

    return (
      <View style={styles.card}>
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
        {(item.tiempoEntregaDias || item.mensajeEmpleado) && (
          <View style={styles.extraInfo}>
            {item.tiempoEntregaDias && (
              <Text style={styles.extraText}>
                Entrega: {item.tiempoEntregaDias} día{item.tiempoEntregaDias > 1 ? 's' : ''}
              </Text>
            )}
            {item.mensajeEmpleado && (
              <Text style={styles.extraText} numberOfLines={2}>
                {item.mensajeEmpleado}
              </Text>
            )}
          </View>
        )}
        <View style={styles.cardFooter}>
          <Text style={styles.totalText}>S/ {item.total.toFixed(2)}</Text>
          {puedeCancelar && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => handleCancel(item)}
              disabled={!!cancellingId}
            >
              {cancellingId === item.id ? (
                <ActivityIndicator size="small" color={Colors.error} />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
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
      <FlatList
        data={reservations}
        keyExtractor={(item) => item.id}
        renderItem={renderReservationCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={Colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>Sin reservas</Text>
            <Text style={styles.emptyText}>
              Crea una reserva desde el catálogo para asegurar tus productos.
            </Text>
            <Button
              title="Crear reserva"
              onPress={() => router.push('/mis-reservas/crear')}
            />
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
      {reservations.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => router.push('/mis-reservas/crear')}
          >
            <Ionicons name="add" size={28} color={Colors.white} />
            <Text style={styles.fabText}>Nueva reserva</Text>
          </TouchableOpacity>
        </View>
      )}
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
  listContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
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
  extraInfo: {
    marginBottom: Spacing.sm,
  },
  extraText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  cancelBtnText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
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
  fabContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.medium,
    paddingVertical: Spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
