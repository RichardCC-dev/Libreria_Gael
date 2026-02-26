import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout, isLoading, isAuthenticated } = useAuth();

  // Proteger la ruta: redirigir al login si no está autenticado
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'administrador':
        return Colors.primary;
      case 'empleado':
        return Colors.secondary;
      case 'cliente':
        return '#10B981';
      default:
        return Colors.textSecondary;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'administrador':
        return 'Administrador';
      case 'empleado':
        return 'Empleado';
      case 'cliente':
        return 'Cliente';
      default:
        return 'Usuario';
    }
  };

  const getDashboardActions = () => {
    switch (user?.role) {
      case 'administrador':
        return [
          { icon: 'person-outline', label: 'Mi Perfil', route: '/perfil', color: Colors.primary },
          { icon: 'cube-outline', label: 'Inventario', route: '/inventario', color: Colors.primary },
          { icon: 'receipt-outline', label: 'Ventas', route: '/ventas', color: Colors.secondary },
          { icon: 'time-outline', label: 'Historial ventas', route: '/ventas/historial', color: Colors.primary },
          { icon: 'calendar-outline', label: 'Reservas', route: '/reservas', color: '#10B981' },
          { icon: 'people-outline', label: 'Empleados', route: '/admin/empleados', color: '#8B5CF6' },
          { icon: 'time-outline', label: 'Control asistencia', route: '/admin/asistencia', color: '#F59E0B' },
        ];
      case 'empleado':
        return [
          { icon: 'person-outline', label: 'Mi Perfil', route: '/perfil', color: Colors.primary },
          { icon: 'cube-outline', label: 'Inventario', route: '/inventario', color: Colors.primary },
          { icon: 'receipt-outline', label: 'Ventas', route: '/ventas', color: Colors.secondary },
          { icon: 'calendar-outline', label: 'Reservas', route: '/reservas', color: '#10B981' },
        ];
      case 'cliente':
        return [
          { icon: 'person-outline', label: 'Mi Perfil', route: '/perfil', color: Colors.primary },
          { icon: 'storefront-outline', label: 'Catálogo', route: '/catalogo', color: Colors.primary },
          { icon: 'calendar-outline', label: 'Mis Reservas', route: '/mis-reservas', color: Colors.secondary },
          { icon: 'star-outline', label: 'Reseñas', route: '/resenas', color: Colors.secondary },
        ];
      default:
        return [];
    }
  };

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Si no está autenticado, no mostrar contenido (será redirigido)
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con información del usuario */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => router.push('/perfil')}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: getRoleColor() }]}>
            <Ionicons name="person" size={32} color={Colors.white} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name || user.email}</Text>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor() }]}>
              <Text style={styles.roleText}>{getRoleLabel()}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Título del Dashboard */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Panel de Control</Text>
        <Text style={styles.subtitle}>
          Bienvenido, {user.name || 'Usuario'}
        </Text>
      </View>

      {/* Grid de Acciones */}
      <View style={styles.actionsGrid}>
        {getDashboardActions().map((action, index) => {
          const knownRoutes = ['/perfil', '/inventario', '/inventario/productos-prestados', '/inventario/registrar-prestamo', '/catalogo', '/mis-reservas', '/resenas', '/reservas', '/ventas', '/ventas/historial', '/ventas/boleta-previa', '/admin/empleados', '/admin/asistencia'];
          const isAvailable = knownRoutes.includes(action.route);

          return isAvailable ? (
            <Link key={index} href={action.route} asChild>
              <TouchableOpacity style={styles.actionCard}>
                <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={32} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            </Link>
          ) : (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() =>
                Alert.alert(
                  'Próximamente',
                  `La funcionalidad de ${action.label} se implementará en futuras historias de usuario.`
                )
              }
            >
              <View style={[styles.actionIconContainer, { backgroundColor: `${action.color}20` }]}>
                <Ionicons name={action.icon as any} size={32} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Información adicional según rol */}
      {user.role === 'administrador' && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary} />
          <Text style={styles.infoText}>
            Como administrador, tienes acceso completo al sistema de gestión.
          </Text>
        </View>
      )}

      {user.role === 'empleado' && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.secondary} />
          <Text style={styles.infoText}>
            Como empleado, puedes gestionar inventario, ventas y reservas.
          </Text>
        </View>
      )}

      {user.role === 'cliente' && (
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color="#10B981" />
          <Text style={styles.infoText}>
            Como cliente, puedes explorar el catálogo y gestionar tus reservas.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'system',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontFamily: 'system',
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.small,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    fontFamily: 'system',
  },
  logoutButton: {
    padding: Spacing.sm,
  },
  titleContainer: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    fontFamily: 'system',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: 'system',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  actionCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 120,
    justifyContent: 'center',
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    fontFamily: 'system',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.md,
    margin: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontFamily: 'system',
  },
});
