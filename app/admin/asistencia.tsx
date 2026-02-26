import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { getEmployees } from '@/services/authService';
import {
  getAttendanceRecords,
  getAttendanceSummary,
  registerAttendance,
  updateAttendanceRecord,
  deleteAttendanceRecord,
  getDateRangePreset,
  getTodayStr,
  getTimeStr,
  AttendanceRecord,
  AttendanceSummary,
} from '@/services/employeeAttendanceService';

const PRESETS = [
  { key: 'hoy' as const, label: 'Hoy' },
  { key: 'semana' as const, label: 'Semana' },
  { key: 'mes' as const, label: 'Mes' },
];

export default function AsistenciaScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading, isAuthenticated } = useAuth();
  const [employees, setEmployees] = useState<{ id: string; name: string; email: string }[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'resumen' | 'registros'>('resumen');
  const [expandedSummaryId, setExpandedSummaryId] = useState<string | null>(null);
  const [filtroEmpleado, setFiltroEmpleado] = useState<string>('');
  const [fechaDesde, setFechaDesde] = useState(getTodayStr());
  const [fechaHasta, setFechaHasta] = useState(getTodayStr());
  const [formEmpleadoId, setFormEmpleadoId] = useState('');
  const [formFecha, setFormFecha] = useState(getTodayStr());
  const [formHoraEntrada, setFormHoraEntrada] = useState(getTimeStr());
  const [formHoraSalida, setFormHoraSalida] = useState('');
  const [editHoraEntrada, setEditHoraEntrada] = useState('');
  const [editHoraSalida, setEditHoraSalida] = useState('');

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const empList = await getEmployees(token);
      const employeesMap = empList.map((e) => ({
        id: e.id,
        name: e.name || e.email,
        email: e.email,
      }));
      setEmployees(employeesMap);

      const [sumData, recData] = await Promise.all([
        getAttendanceSummary({
          empleadoId: filtroEmpleado || undefined,
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
          allEmployeeIds: empList.map((e) => ({ id: e.id, name: e.name || e.email })),
        }, token),
        getAttendanceRecords({
          empleadoId: filtroEmpleado || undefined,
          fechaDesde: fechaDesde || undefined,
          fechaHasta: fechaHasta || undefined,
        }, token),
      ]);
      setSummary(sumData);
      setRecords(recData);
    } catch {
      setSummary([]);
      setRecords([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, filtroEmpleado, fechaDesde, fechaHasta]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'administrador')) {
      router.replace('/dashboard');
    }
  }, [user?.role, isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'administrador') {
      loadData();
    }
  }, [user?.role, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const applyPreset = (preset: 'hoy' | 'semana' | 'mes') => {
    const { desde, hasta } = getDateRangePreset(preset);
    setFechaDesde(desde);
    setFechaHasta(hasta);
  };

  const handleRegistrar = async () => {
    if (!formEmpleadoId || !user?.id) {
      Alert.alert('Error', 'Selecciona un empleado.');
      return;
    }
    const emp = employees.find((e) => e.id === formEmpleadoId);
    if (!emp) return;

    if (!token) return;
    setSubmitting(true);
    const res = await registerAttendance({
      empleadoId: formEmpleadoId,
      empleadoName: emp.name,
      fecha: formFecha,
      horaEntrada: formHoraEntrada,
      horaSalida: formHoraSalida || undefined,
      adminId: user.id,
    }, token);
    setSubmitting(false);

    if (res.success) {
      setShowModal(false);
      setFormEmpleadoId('');
      setFormFecha(getTodayStr());
      setFormHoraEntrada(getTimeStr());
      setFormHoraSalida('');
      loadData();
      Alert.alert('Listo', res.message);
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleEntradaAhora = () => {
    setFormFecha(getTodayStr());
    setFormHoraEntrada(getTimeStr());
    setFormHoraSalida('');
  };

  const handleSalidaAhora = () => {
    setFormHoraSalida(getTimeStr());
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditHoraEntrada(record.horaEntrada);
    setEditHoraSalida(record.horaSalida || '');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord || !token) return;
    setSubmitting(true);
    const res = await updateAttendanceRecord(editingRecord.id, {
      horaEntrada: editHoraEntrada,
      horaSalida: editHoraSalida || undefined,
    }, token);
    setSubmitting(false);
    if (res.success) {
      setShowEditModal(false);
      setEditingRecord(null);
      loadData();
      Alert.alert('Listo', res.message);
    } else {
      Alert.alert('Error', res.message);
    }
  };

  const handleDeleteRecord = (record: AttendanceRecord) => {
    Alert.alert(
      'Eliminar registro',
      `¿Eliminar el registro del ${formatDate(record.fecha)} para ${record.empleadoName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteAttendanceRecord(record.id, token);
            if (res.success) {
              loadData();
              Alert.alert('Listo', res.message);
            } else {
              Alert.alert('Error', res.message);
            }
          },
        },
      ]
    );
  };

  const formatDate = (f: string) => {
    const d = new Date(f + 'T12:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (!user || user.role !== 'administrador') return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setFormFecha(getTodayStr());
          setFormHoraEntrada(getTimeStr());
          setFormHoraSalida('');
          setShowModal(true);
        }}
        activeOpacity={0.8}
      >
        <Ionicons name="time-outline" size={24} color={Colors.white} />
        <Text style={styles.fabText}>Registrar asistencia</Text>
      </TouchableOpacity>

      {/* Filtros */}
      <View style={styles.filters}>
        <Text style={[styles.filterLabel, styles.filterLabelFirst]}>Rango de fechas</Text>
        <View style={styles.presetRow}>
          {PRESETS.map((p) => (
            <TouchableOpacity
              key={p.key}
              style={[
                styles.presetBtn,
                fechaDesde === getDateRangePreset(p.key).desde && styles.presetBtnActive,
              ]}
              onPress={() => applyPreset(p.key)}
            >
              <Text
                style={[
                  styles.presetText,
                  fechaDesde === getDateRangePreset(p.key).desde && styles.presetTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={styles.filterFieldLabel}>Desde</Text>
            <Input
              value={fechaDesde}
              onChangeText={setFechaDesde}
              placeholder="YYYY-MM-DD"
              containerStyle={styles.dateInput}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={styles.filterFieldLabel}>Hasta</Text>
            <Input
              value={fechaHasta}
              onChangeText={setFechaHasta}
              placeholder="YYYY-MM-DD"
              containerStyle={styles.dateInput}
            />
          </View>
        </View>
        <Text style={styles.filterLabel}>Empleado</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <TouchableOpacity
            style={[styles.chip, !filtroEmpleado && styles.chipSelected]}
            onPress={() => setFiltroEmpleado('')}
          >
            <Text style={[styles.chipText, !filtroEmpleado && styles.chipTextSelected]}>
              Todos
            </Text>
          </TouchableOpacity>
          {employees.map((e) => (
            <TouchableOpacity
              key={e.id}
              style={[styles.chip, filtroEmpleado === e.id && styles.chipSelected]}
              onPress={() => setFiltroEmpleado(e.id)}
            >
              <Text
                style={[styles.chipText, filtroEmpleado === e.id && styles.chipTextSelected]}
                numberOfLines={1}
              >
                {e.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'resumen' && styles.toggleBtnActive]}
            onPress={() => setViewMode('resumen')}
          >
            <Text style={[styles.toggleText, viewMode === 'resumen' && styles.toggleTextActive]}>
              Resumen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'registros' && styles.toggleBtnActive]}
            onPress={() => setViewMode('registros')}
          >
            <Text style={[styles.toggleText, viewMode === 'registros' && styles.toggleTextActive]}>
              Registros
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      ) : viewMode === 'resumen' ? (
        <FlatList
          data={summary}
          keyExtractor={(item) => item.empleadoId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Sin registros</Text>
              <Text style={styles.emptyText}>
                Registra la entrada y salida de los empleados.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isExpanded = expandedSummaryId === item.empleadoId;
            return (
              <View style={styles.summaryCard}>
                <TouchableOpacity
                  style={styles.summaryHeader}
                  onPress={() =>
                    setExpandedSummaryId(isExpanded ? null : item.empleadoId)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.summaryHeaderLeft}>
                    <View style={styles.summaryAvatar}>
                      <Ionicons name="person" size={20} color={Colors.white} />
                    </View>
                    <View>
                      <Text style={styles.summaryName}>{item.empleadoName}</Text>
                      <View style={styles.summaryStats}>
                        <View style={styles.statItem}>
                          <Ionicons name="calendar" size={14} color={Colors.primary} />
                          <Text style={styles.statValue}>{item.diasAsistidos}</Text>
                          <Text style={styles.statLabel}>días</Text>
                        </View>
                        <View style={styles.statItem}>
                          <Ionicons name="time" size={14} color={Colors.secondary} />
                          <Text style={styles.statValue}>{item.totalHoras}h</Text>
                          <Text style={styles.statLabel}>total</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
                {isExpanded && item.registros.length > 0 && (
                  <View style={styles.expandedRecords}>
                    {item.registros.map((r) => (
                      <TouchableOpacity
                        key={r.id}
                        style={styles.expandedRecordRow}
                        onPress={() => handleEditRecord(r)}
                      >
                        <Text style={styles.expandedDate}>{formatDate(r.fecha)}</Text>
                        <View style={styles.expandedTimes}>
                          <Text style={styles.expandedTime}>{r.horaEntrada}</Text>
                          <Ionicons name="arrow-forward" size={12} color={Colors.textSecondary} />
                          <Text style={styles.expandedTime}>
                            {r.horaSalida || '—'}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyTitle}>Sin registros</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recordCard}
              onPress={() => handleEditRecord(item)}
              onLongPress={() => handleDeleteRecord(item)}
              activeOpacity={0.7}
            >
              <View style={styles.recordHeader}>
                <Text style={styles.recordName}>{item.empleadoName}</Text>
                <View style={styles.recordActions}>
                  <TouchableOpacity
                    onPress={() => handleEditRecord(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="create-outline" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteRecord(item)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.recordDate}>{formatDate(item.fecha)}</Text>
              <View style={styles.recordTimes}>
                <View style={styles.timeBadge}>
                  <Ionicons name="log-in-outline" size={14} color={Colors.success} />
                  <Text style={styles.timeText}>{item.horaEntrada}</Text>
                </View>
                {item.horaSalida ? (
                  <View style={styles.timeBadge}>
                    <Ionicons name="log-out-outline" size={14} color={Colors.error} />
                    <Text style={styles.timeText}>{item.horaSalida}</Text>
                  </View>
                ) : (
                  <Text style={styles.timePendiente}>Sin salida</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal Registrar */}
      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar asistencia</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.quickButtons}>
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={handleEntradaAhora}
                >
                  <Ionicons name="log-in-outline" size={20} color={Colors.success} />
                  <Text style={styles.quickBtnText}>Entrada ahora</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickBtn, styles.quickBtnSecondary]}
                  onPress={handleSalidaAhora}
                >
                  <Ionicons name="log-out-outline" size={20} color={Colors.error} />
                  <Text style={styles.quickBtnText}>Salida ahora</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Empleado</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.empScroll}>
                {employees.map((e) => (
                  <TouchableOpacity
                    key={e.id}
                    style={[styles.empChip, formEmpleadoId === e.id && styles.empChipSelected]}
                    onPress={() => setFormEmpleadoId(e.id)}
                  >
                    <Text
                      style={[
                        styles.empChipText,
                        formEmpleadoId === e.id && styles.empChipTextSelected,
                      ]}
                    >
                      {e.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Input
                label="Fecha"
                value={formFecha}
                onChangeText={setFormFecha}
                placeholder="YYYY-MM-DD"
              />
              <Input
                label="Hora entrada"
                value={formHoraEntrada}
                onChangeText={setFormHoraEntrada}
                placeholder="HH:mm"
              />
              <Input
                label="Hora salida (opcional)"
                value={formHoraSalida}
                onChangeText={setFormHoraSalida}
                placeholder="HH:mm"
              />
              <Button
                title="Registrar"
                onPress={handleRegistrar}
                loading={submitting}
                disabled={submitting || !formEmpleadoId}
                style={styles.modalBtn}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal Editar */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar registro</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {editingRecord && (
              <>
                <Text style={styles.editRecordInfo}>
                  {editingRecord.empleadoName} · {formatDate(editingRecord.fecha)}
                </Text>
                <Input
                  label="Hora entrada"
                  value={editHoraEntrada}
                  onChangeText={setEditHoraEntrada}
                  placeholder="HH:mm"
                />
                <Input
                  label="Hora salida"
                  value={editHoraSalida}
                  onChangeText={setEditHoraSalida}
                  placeholder="HH:mm"
                />
                <View style={styles.quickButtons}>
                  <TouchableOpacity
                    style={styles.quickBtn}
                    onPress={() => setEditHoraEntrada(getTimeStr())}
                  >
                    <Text style={styles.quickBtnText}>Hora actual entrada</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.quickBtn, styles.quickBtnSecondary]}
                    onPress={() => setEditHoraSalida(getTimeStr())}
                  >
                    <Text style={styles.quickBtnText}>Hora actual salida</Text>
                  </TouchableOpacity>
                </View>
                <Button
                  title="Guardar cambios"
                  onPress={handleSaveEdit}
                  loading={submitting}
                  disabled={submitting}
                  style={styles.modalBtn}
                />
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  loadingText: { fontSize: 14, color: Colors.textSecondary },
  filters: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  filterLabelFirst: { marginTop: 0 },
  presetRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  presetBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  presetText: { fontSize: 13, color: Colors.textPrimary },
  presetTextActive: { color: Colors.white, fontWeight: '600' },
  dateRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  dateField: { flex: 1 },
  dateInput: { marginBottom: 0 },
  chipScroll: { marginBottom: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textPrimary },
  chipTextSelected: { color: Colors.white, fontWeight: '600' },
  viewToggle: { flexDirection: 'row', gap: Spacing.sm },
  toggleBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.small,
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: Colors.secondary },
  toggleText: { fontSize: 13, color: Colors.textSecondary },
  toggleTextActive: { color: Colors.white, fontWeight: '600' },
  listContent: { padding: Spacing.lg, paddingBottom: 100 },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  summaryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  summaryName: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  summaryStats: { flexDirection: 'row', gap: Spacing.lg, marginTop: 4 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textSecondary },
  expandedRecords: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  expandedRecordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  expandedDate: { fontSize: 13, color: Colors.textPrimary },
  expandedTimes: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  expandedTime: { fontSize: 13, color: Colors.textSecondary },
  recordCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  recordActions: { flexDirection: 'row', gap: Spacing.md },
  recordDate: { fontSize: 13, color: Colors.textSecondary, marginBottom: Spacing.sm },
  recordTimes: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  timeText: { fontSize: 14, color: Colors.textPrimary },
  timePendiente: { fontSize: 12, color: Colors.textSecondary, fontStyle: 'italic' },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary },
  emptyText: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center' },
  fab: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#F59E0B',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  fabText: { fontSize: 16, fontWeight: '600', color: Colors.white },
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  empScroll: { marginBottom: Spacing.lg },
  empChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  empChipSelected: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  empChipText: { fontSize: 13, color: Colors.textPrimary },
  empChipTextSelected: { color: Colors.white, fontWeight: '600' },
  quickButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.medium,
    backgroundColor: `${Colors.success}20`,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  quickBtnSecondary: {
    backgroundColor: `${Colors.error}15`,
    borderColor: Colors.error,
  },
  quickBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary },
  editRecordInfo: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  modalBtn: { marginTop: Spacing.lg, marginBottom: Spacing.xxl },
});
