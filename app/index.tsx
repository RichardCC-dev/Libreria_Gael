import Button from "@/components/ui/Button";
import { BorderRadius, Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Si el usuario está autenticado, redirigir al dashboard
        router.replace("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Si está autenticado, no mostrar esta pantalla (será redirigido)
  if (isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Ionicons name="school" size={64} color={Colors.white} />
        </View>

        {/* Título */}
        <Text style={styles.title}>Librería Gael</Text>
        <Text style={styles.subtitle}>Útiles escolares</Text>

        {/* Botones de navegación */}
        <View style={styles.buttonContainer}>
          <Button
            title="Registrarse"
            onPress={() => router.push("/register")}
            style={styles.button}
          />
          <Button
            title="Iniciar Sesión"
            onPress={() => router.push("/login")}
            variant="outline"
            style={styles.button}
          />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingContainer: {
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontFamily: "system",
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontFamily: "system",
  },
  subtitle: {
    fontSize: 20,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl * 2,
    fontFamily: "system",
  },
  buttonContainer: {
    width: "100%",
    gap: Spacing.md,
  },
  button: {
    width: "100%",
  },
  infoText: {
    marginTop: Spacing.xxl,
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    fontFamily: "system",
  },
});
