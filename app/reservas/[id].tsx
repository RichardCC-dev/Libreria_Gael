import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import {
  getReservationByIdForStaff,
  acceptReservation,
  cancelReservationByEmployee,
  confirmPayment,
  getStatusLabel,
  Reservation,
} from '@/services/reservationService';
import { registerSaleFromReservation } from '@/services/saleService';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
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

export default function ReservaDetalleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { user, token, isLoading: authLoading } = useAuth();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal aceptar
  const [showAceptarModal, setShowAceptarModal] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tiempoEntregaDias, setTiempoEntregaDias] = useState('2');

  // Modal cancelar
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [mensajeCancelar, setMensajeCancelar] = useState('');

  const loadReservation = useCallback(async () => {
    if (!id || !token) return;
    try {
      const r = await getReservationByIdForStaff(id, token);
      setReservation(r ?? null);
    } catch {
      setReservation(null);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    if (user?.role !== 'empleado' && user?.role !== 'administrador' && !authLoading) {
      if (user) router.replace('/dashboard');
      return;
    }
    if (!authLoading) loadReservation();
  }, [user, authLoading, router, loadReservation]);

  const handleAceptar = async () => {
    if (!user?.id || !reservation) return;
    const dias = parseInt(tiempoEntregaDias, 10);
    if (isNaN(dias) || dias < 1 || dias > 4) {
      Alert.alert('Error', 'El tiempo de entrega debe ser entre 1 y 4 días.');
      return;
    }
    setActionLoading(true);
    if (!token) return;
    const res = await acceptReservation({
      reservationId: reservation.id,
      empleadoId: user.id,
      mensaje: mensaje.trim() || undefined,
      tiempoEntregaDias: dias,
    }, token);
    setActionLoading(false);
    setShowAceptarModal(false);
    setMensaje('');
    setTiempoEntregaDias('2');
    if (res.success) {
      Alert.alert('Listo', res.message);
      loadReservation();
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleCancelar = async () => {
    if (!user?.id || !reservation) return;
    setActionLoading(true);
    if (!token) return;
    const res = await cancelReservationByEmployee(
      reservation.id,
      user.id,
      token,
      mensajeCancelar.trim() || undefined
    );
    setActionLoading(false);
    setShowCancelarModal(false);
    setMensajeCancelar('');
    if (res.success) {
      Alert.alert('Listo', res.message);
      loadReservation();
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleConfirmarPago = async () => {
    if (!user?.id || !reservation) return;
    Alert.alert(
      'Confirmar pago',
      '¿El cliente ya realizó el pago en tienda? Se registrará la venta, la reserva pasará a "Confirmada" y se generará el comprobante.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, confirmar',
          onPress: async () => {
            setActionLoading(true);
            if (!token) return;
            const saleRes = await registerSaleFromReservation({
              reservation,
              empleadoId: user.id,
              empleadoName: user.name || user.email,
            }, token);
            if (!saleRes.success || !saleRes.sale) {
              setActionLoading(false);
              Alert.alert('Error', saleRes.message);
              return;
            }
            const confRes = await confirmPayment(reservation.id, user.id, token);
            setActionLoading(false);
            if (confRes.success) {
              router.push({
                pathname: '/ventas/comprobante',
                params: { sale: JSON.stringify(saleRes.sale) },
              });
            } else {
              Alert.alert('Error', confRes.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!reservation) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Reserva no encontrada</Text>
        <Button title="Volver" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const statusColor = getStatusColor(reservation.estado);
  const puedeAceptar = reservation.estado === 'por_confirmar';
  const puedeCancelar =
    reservation.estado === 'por_confirmar' || reservation.estado === 'pendiente';
  const puedeConfirmarPago = reservation.estado === 'pendiente';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.reservaId}>#{reservation.id.replace('res_', '')}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}25` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(reservation.estado)}
              </Text>
            </View>
          </View>
          <Text style={styles.fecha}>{formatDate(reservation.createdAt)}</Text>
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos</Text>
          {reservation.items.map((item) => (
            <View key={item.productId} style={styles.itemRow}>
              <Text style={styles.itemNombre}>
                {item.productName} × {item.cantidad}
              </Text>
              <Text style={styles.itemSubtotal}>
                S/ {(item.precioUnitario * item.cantidad).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>S/ {reservation.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Info adicional (si existe) */}
        {(reservation.mensajeEmpleado || reservation.tiempoEntregaDias) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información adicional</Text>
            {reservation.tiempoEntregaDias && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={18} color={Colors.textSecondary} />
                <Text style={styles.infoText}>
                  Entrega en {reservation.tiempoEntregaDias} día
                  {reservation.tiempoEntregaDias > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {reservation.mensajeEmpleado && (
              <View style={styles.mensajeBox}>
                <Ionicons name="chatbox-outline" size={18} color={Colors.primary} />
                <Text style={styles.mensajeText}>{reservation.mensajeEmpleado}</Text>
              </View>
            )}
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actionsSection}>
          {puedeAceptar && (
            <Button
              title="Aceptar reserva"
              onPress={() => setShowAceptarModal(true)}
              disabled={actionLoading}
              loading={actionLoading}
            />
          )}
          {puedeConfirmarPago && (
            <Button
              title="Confirmar pago en tienda"
              onPress={handleConfirmarPago}
              disabled={actionLoading}
              loading={actionLoading}
            />
          )}
          {puedeCancelar && (
            <Button
              title="Cancelar reserva"
              onPress={() => setShowCancelarModal(true)}
              variant="outline"
              disabled={actionLoading}
              loading={actionLoading}
              textStyle={{ color: Colors.error }}
            />
          )}
        </View>
      </ScrollView>

      {/* Modal Aceptar */}
      <Modal
        visible={showAceptarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAceptarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aceptar reserva</Text>
            <Text style={styles.modalSubtitle}>
              La reserva pasará a estado "Pendiente" (por pagar). Puedes agregar un mensaje y el
              tiempo de entrega.
            </Text>
            <Input
              label="Mensaje para el cliente (opcional)"
              placeholder="Ej: Productos listos para recoger..."
              value={mensaje}
              onChangeText={setMensaje}
              multiline
            />
            <Input
              label="Tiempo de entrega (1-4 días)"
              placeholder="2"
              value={tiempoEntregaDias}
              onChangeText={setTiempoEntregaDias}
              keyboardType="number-pad"
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancelar"
                onPress={() => setShowAceptarModal(false)}
                variant="outline"
                style={styles.modalBtn}
              />
              <Button
                title="Aceptar reserva"
                onPress={handleAceptar}
                loading={actionLoading}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Cancelar */}
      <Modal
        visible={showCancelarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCancelarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancelar reserva</Text>
            <Text style={styles.modalSubtitle}>
              Los productos volverán al stock del catálogo. Puedes agregar un mensaje explicativo.
            </Text>
            <Input
              label="Mensaje (opcional)"
              placeholder="Ej: Cliente no recogió a tiempo..."
              value={mensajeCancelar}
              onChangeText={setMensajeCancelar}
              multiline
            />
            <View style={styles.modalActions}>
              <Button
                title="Volver"
                onPress={() => setShowCancelarModal(false)}
                variant="outline"
                style={styles.modalBtn}
              />
              <TouchableOpacity
                style={[styles.cancelarBtn, styles.modalBtn]}
                onPress={handleCancelar}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.cancelarBtnText}>Cancelar reserva</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reservaId: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: Colors.textSecondary,
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
  fecha: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemNombre: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textPrimary,
  },
  mensajeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: `${Colors.primary}10`,
    padding: Spacing.md,
    borderRadius: BorderRadius.small,
  },
  mensajeText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  actionsSection: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.large,
    borderTopRightRadius: BorderRadius.large,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalBtn: {
    flex: 1,
  },
  cancelarBtn: {
    flex: 1,
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
  },
  cancelarBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
