import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { submitReview } from '@/services/reviewService';

const MAX_COMENTARIO = 500;

export default function ResenasScreen() {
  const router = useRouter();
  const { user, token, isLoading: authLoading } = useAuth();
  const [comentario, setComentario] = useState('');
  const [calificacion, setCalificacion] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async () => {
    if (!user?.id) {
      Alert.alert('Sesión requerida', 'Debes iniciar sesión para enviar una reseña.');
      return;
    }

    const comentarioTrimmed = comentario.trim();
    if (!comentarioTrimmed) {
      Alert.alert('Comentario vacío', 'Escribe tu opinión o comentario antes de enviar.');
      return;
    }

    if (calificacion < 1 || calificacion > 5) {
      Alert.alert('Calificación requerida', 'Selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    if (!token) return;
    setSubmitting(true);
    const res = await submitReview({
      userId: user.id,
      userName: user.name || user.email,
      comentario: comentarioTrimmed,
      calificacion,
    }, token);
    setSubmitting(false);

    if (res.success) {
      Alert.alert(
        '¡Gracias!',
        res.message,
        [{ text: 'Aceptar', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Error', res.message);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBox}>
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={Colors.primary} />
          <Text style={styles.infoText}>
            Tu opinión nos ayuda a mejorar. Comparte tu experiencia con la aplicación.
          </Text>
        </View>

        <Text style={styles.label}>Calificación de satisfacción</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setCalificacion(n)}
              style={styles.starTouch}
              activeOpacity={0.7}
            >
              <Ionicons
                name={n <= calificacion ? 'star' : 'star-outline'}
                size={40}
                color={n <= calificacion ? Colors.secondary : Colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.starHint}>
          {calificacion === 0 && 'Toca para seleccionar'}
          {calificacion === 1 && 'Muy insatisfecho'}
          {calificacion === 2 && 'Insatisfecho'}
          {calificacion === 3 && 'Neutral'}
          {calificacion === 4 && 'Satisfecho'}
          {calificacion === 5 && 'Muy satisfecho'}
        </Text>

        <Text style={styles.label}>Comentario u opinión</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Escribe aquí tu reseña, sugerencias o comentarios..."
          placeholderTextColor={Colors.textSecondary}
          value={comentario}
          onChangeText={(t) => setComentario(t.slice(0, MAX_COMENTARIO))}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={MAX_COMENTARIO}
        />
        <Text style={styles.charCount}>
          {comentario.length} / {MAX_COMENTARIO}
        </Text>

        <Button
          title="Enviar reseña"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting || !comentario.trim() || calificacion < 1}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: '#EBF5FF',
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  starTouch: { padding: Spacing.xs },
  starHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 120,
    marginBottom: Spacing.xs,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
});
