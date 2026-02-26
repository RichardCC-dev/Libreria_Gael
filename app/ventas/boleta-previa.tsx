import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export interface BoletaItemParam {
  productId: string;
  productName: string;
  cantidad: number;
  precioUnitario: number;
}

function getItemsFromParams(params: Record<string, string | string[] | undefined>): BoletaItemParam[] {
  try {
    const itemsStr = params.items as string;
    if (!itemsStr) return [];
    return JSON.parse(itemsStr) as BoletaItemParam[];
  } catch {
    return [];
  }
}

function generateBoletaHTML(
  items: BoletaItemParam[],
  subtotal: number,
  descuento: number,
  total: number
): string {
  const rows = items
    .map(
      (i) =>
        `<tr>
        <td>${i.productName}</td>
        <td style="text-align:center">${i.cantidad}</td>
        <td style="text-align:right">S/ ${i.precioUnitario.toFixed(2)}</td>
        <td style="text-align:right">S/ ${(i.cantidad * i.precioUnitario).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Boleta Previa</title>
  <style>
    body { font-family: sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
    h1 { font-size: 18px; text-align: center; margin-bottom: 8px; }
    .aviso { background: #FEE2E2; color: #991B1B; padding: 10px; text-align: center; font-weight: bold; font-size: 12px; margin-bottom: 16px; border-radius: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { padding: 8px; border-bottom: 1px solid #E5E7EB; }
    th { text-align: left; font-size: 12px; color: #6B7280; }
    .totales { margin-top: 16px; font-size: 14px; }
    .totales div { display: flex; justify-content: space-between; padding: 4px 0; }
    .total-final { font-size: 18px; font-weight: bold; margin-top: 12px; padding-top: 12px; border-top: 2px solid #000; }
  </style>
</head>
<body>
  <h1>BOLETA PREVIA</h1>
  <div class="aviso">Documento no válido como comprobante de venta</div>
  <table>
    <thead>
      <tr>
        <th>Producto</th>
        <th style="text-align:center">Cant</th>
        <th style="text-align:right">P.Unit</th>
        <th style="text-align:right">Subtotal</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totales">
    <div><span>Subtotal</span><span>S/ ${subtotal.toFixed(2)}</span></div>
    ${descuento > 0 ? `<div><span>Descuento</span><span>- S/ ${descuento.toFixed(2)}</span></div>` : ''}
    <div class="total-final"><span>Total</span><span>S/ ${total.toFixed(2)}</span></div>
  </div>
</body>
</html>`;
}

export default function BoletaPreviaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [items, setItems] = useState<BoletaItemParam[]>([]);
  const [descuento, setDescuento] = useState('');
  const [printing, setPrinting] = useState(false);

  // Usar params.items como dependencia estable (primitivo) para evitar loop infinito
  const itemsParam = params.items;

  useEffect(() => {
    const parsed = getItemsFromParams(params);
    setItems(parsed);
    if (parsed.length === 0) {
      Alert.alert('Sin datos', 'No hay productos seleccionados.', [
        { text: 'Volver', onPress: () => router.back() },
      ]);
    }
  }, [itemsParam]);

  const subtotal = items.reduce(
    (sum, i) => sum + i.cantidad * i.precioUnitario,
    0
  );
  const descuentoNum = Math.min(
    Math.max(0, parseFloat(descuento) || 0),
    subtotal
  );
  const total = Math.max(0, subtotal - descuentoNum);
  const descuentoValido = descuentoNum <= subtotal && descuentoNum >= 0;

  const handleImprimir = async () => {
    if (items.length === 0) return;
    setPrinting(true);
    try {
      const html = generateBoletaHTML(items, subtotal, descuentoNum, total);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const ventana = (window as any).open('', '_blank');
        if (ventana) {
          ventana.document.write(html);
          ventana.document.close();
          ventana.print();
          ventana.close();
          Alert.alert('Listo', 'La ventana de impresión se ha abierto.');
        } else {
          Alert.alert(
            'Bloqueador',
            'Permite ventanas emergentes para imprimir.'
          );
        }
      } else {
        const { printAsync } = await import('expo-print');
        await printAsync({ html });
        Alert.alert('Listo', 'Boleta enviada a impresión.');
      }
    } catch (err: any) {
      Alert.alert(
        'Error al imprimir',
        err?.message || 'No se pudo realizar la impresión. Verifica que expo-print esté instalado.'
      );
    } finally {
      setPrinting(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avisoBox}>
        <Ionicons name="warning-outline" size={24} color={Colors.error} />
        <Text style={styles.avisoText}>
          Documento no válido como comprobante de venta
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalle</Text>
        {items.map((i) => (
          <View key={i.productId} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{i.productName}</Text>
              <Text style={styles.itemMeta}>
                {i.cantidad} × S/ {i.precioUnitario.toFixed(2)}
              </Text>
            </View>
            <Text style={styles.itemSubtotal}>
              S/ {(i.cantidad * i.precioUnitario).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.totalesSection}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal general</Text>
          <Text style={styles.totalValue}>S/ {subtotal.toFixed(2)}</Text>
        </View>

        <View style={styles.descuentoRow}>
          <Text style={styles.descuentoLabel}>Descuento (opcional)</Text>
          <TextInput
            style={[
              styles.descuentoInput,
              !descuentoValido && descuento !== '' && styles.inputError,
            ]}
            placeholder="0.00"
            value={descuento}
            onChangeText={setDescuento}
            keyboardType="decimal-pad"
          />
        </View>
        {descuento !== '' && parseFloat(descuento) > subtotal && (
          <Text style={styles.errorText}>
            El descuento no puede ser mayor al subtotal
          </Text>
        )}

        {descuentoNum > 0 && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Monto descuento</Text>
            <Text style={styles.descuentoValue}>- S/ {descuentoNum.toFixed(2)}</Text>
          </View>
        )}

        <View style={[styles.totalRow, styles.totalFinal]}>
          <Text style={styles.totalFinalLabel}>Total final</Text>
          <Text style={styles.totalFinalValue}>S/ {total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Volver a modificar"
          onPress={() => router.back()}
          variant="outline"
        />
        <Button
          title="Imprimir boleta previa"
          onPress={handleImprimir}
          loading={printing}
          disabled={printing}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  loadingText: {
    textAlign: 'center',
    marginTop: Spacing.xxl,
    color: Colors.textSecondary,
  },
  avisoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: `${Colors.error}15`,
    padding: Spacing.md,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.error}40`,
  },
  avisoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.error,
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  itemMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  itemSubtotal: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  totalesSection: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.medium,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  totalLabel: { fontSize: 14, color: Colors.textSecondary },
  totalValue: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary },
  descuentoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  descuentoLabel: { fontSize: 14, color: Colors.textSecondary },
  descuentoInput: {
    width: 100,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.small,
    fontSize: 16,
    textAlign: 'right',
  },
  inputError: { borderColor: Colors.error },
  descuentoValue: { fontSize: 14, color: Colors.error, fontWeight: '600' },
  errorText: { fontSize: 12, color: Colors.error, marginTop: 2 },
  totalFinal: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.textPrimary,
  },
  totalFinalLabel: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  totalFinalValue: { fontSize: 20, fontWeight: '700', color: Colors.secondary },
  actions: { gap: Spacing.md },
});
