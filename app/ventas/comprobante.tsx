import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors, BorderRadius, Spacing } from '@/constants/theme';
import Button from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import type { Sale } from '@/services/saleService';

function getSaleFromParams(params: Record<string, string | string[] | undefined>): Sale | null {
  try {
    const saleStr = params.sale as string;
    if (!saleStr) return null;
    return JSON.parse(saleStr) as Sale;
  } catch {
    return null;
  }
}

function formatFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function generateComprobanteHTML(sale: Sale): string {
  const rows = sale.items
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

  const subtotal = sale.subtotal ?? sale.items.reduce((s, i) => s + i.cantidad * i.precioUnitario, 0);
  const descuento = sale.descuento ?? 0;
  const mostrarDescuento = descuento > 0;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Boleta de Venta ${sale.id}</title>
  <style>
    body { font-family: sans-serif; padding: 20px; max-width: 400px; margin: 0 auto; }
    .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1A73E8; padding-bottom: 12px; }
    h1 { font-size: 18px; color: #1A73E8; margin: 0; }
    .fecha, .empleado { font-size: 12px; color: #64748B; margin-top: 4px; }
    .comprobante-id { font-size: 11px; color: #64748B; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    th, td { padding: 8px; border-bottom: 1px solid #E2E8F0; }
    th { text-align: left; font-size: 12px; color: #64748B; background: #F8F9FA; }
    .totales { margin-top: 16px; font-size: 14px; }
    .totales div { display: flex; justify-content: space-between; padding: 4px 0; }
    .total-final { font-size: 18px; font-weight: bold; margin-top: 12px; padding-top: 12px; border-top: 2px solid #1A73E8; color: #1A73E8; }
  </style>
</head>
<body>
  <div class="header">
    <h1>BOLETA DE VENTA</h1>
    <div class="comprobante-id">${sale.id}</div>
    <div class="fecha">${formatFecha(sale.fecha)}</div>
    <div class="empleado">Atendido por: ${sale.empleadoName}</div>
  </div>
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
    ${mostrarDescuento ? `<div><span>Subtotal</span><span>S/ ${subtotal.toFixed(2)}</span></div>
    <div><span>Descuento</span><span>- S/ ${descuento.toFixed(2)}</span></div>` : ''}
    <div class="total-final"><span>Total</span><span>S/ ${sale.total.toFixed(2)}</span></div>
  </div>
</body>
</html>`;
}

export default function ComprobanteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [sale, setSale] = useState<Sale | null>(null);
  const [printing, setPrinting] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);

  const saleParam = params.sale;

  useEffect(() => {
    const parsed = getSaleFromParams(params);
    setSale(parsed);
    if (!parsed) {
      Alert.alert('Sin datos', 'No se encontró la información de la venta.', [
        { text: 'Volver', onPress: () => router.replace('/ventas') },
      ]);
    }
  }, [saleParam]);

  const handleImprimir = async () => {
    if (!sale) return;
    setPrinting(true);
    try {
      const html = generateComprobanteHTML(sale);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const ventana = (window as any).open('', '_blank');
        if (ventana) {
          ventana.document.write(html);
          ventana.document.close();
          ventana.print();
          ventana.close();
          Alert.alert('Listo', 'Boleta enviada a impresión.');
        } else {
          Alert.alert(
            'Bloqueador',
            'Permite ventanas emergentes para imprimir.'
          );
        }
      } else {
        const { printAsync } = await import('expo-print');
        await printAsync({ html });
        Alert.alert('Listo', 'Boleta enviada a impresión. Puedes imprimir por Bluetooth o Wi-Fi según tu impresora.');
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

  const handleGuardarPDF = async () => {
    if (!sale) return;
    setSavingPdf(true);
    try {
      const html = generateComprobanteHTML(sale);
      if (Platform.OS === 'web') {
        // En web, abrir en nueva ventana y permitir Ctrl+P > Guardar como PDF
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const ventana = (window as any).open(url, '_blank');
        if (ventana) {
          Alert.alert(
            'Guardar PDF',
            'En la nueva ventana: usa Imprimir (Ctrl+P) y selecciona "Guardar como PDF" para descargar el comprobante.'
          );
        } else {
          Alert.alert(
            'Bloqueador',
            'Permite ventanas emergentes. Luego usa Imprimir (Ctrl+P) y "Guardar como PDF".'
          );
        }
      } else {
        const Print = await import('expo-print');
        const Share = await import('expo-sharing');
        const { uri } = await Print.printToFileAsync({
          html,
          base64: false,
        });
        const canShare = await Share.isAvailableAsync();
        if (canShare) {
          await Share.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Guardar boleta de venta',
            UTI: 'com.adobe.pdf',
          });
          Alert.alert('Listo', 'PDF generado. Puedes guardarlo en tu dispositivo desde la opción de compartir.');
        } else {
          Alert.alert(
            'PDF generado',
            `El archivo se guardó en: ${uri}. Puedes acceder a él desde el gestor de archivos.`
          );
        }
      }
    } catch (err: any) {
      Alert.alert(
        'Error al generar PDF',
        err?.message || 'No se pudo generar el PDF.'
      );
    } finally {
      setSavingPdf(false);
    }
  };

  const handleNuevaVenta = () => {
    router.replace('/ventas');
  };

  if (!sale) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando comprobante...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.successBox}>
        <Ionicons name="checkmark-circle" size={40} color={Colors.success} />
        <Text style={styles.successTitle}>Venta registrada correctamente</Text>
        <Text style={styles.successText}>
          El stock se ha actualizado. A continuación puedes imprimir la boleta o guardar el PDF.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comprobante de venta</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Fecha</Text>
          <Text style={styles.metaValue}>{formatFecha(sale.fecha)}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>ID</Text>
          <Text style={styles.metaValue}>{sale.id}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Empleado</Text>
          <Text style={styles.metaValue}>{sale.empleadoName}</Text>
        </View>
        {sale.reservationId && (
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Reserva</Text>
            <Text style={styles.metaValue}>{sale.reservationId}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalle de productos</Text>
        {sale.items.map((i) => (
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
        {(sale.subtotal ?? 0) > 0 && (sale.descuento ?? 0) > 0 && (
          <>
            <View style={styles.totalRow}>
              <Text style={styles.totalFinalLabel}>Subtotal</Text>
              <Text style={styles.totalFinalValue}>S/ {(sale.subtotal ?? sale.total).toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.descuentoLabel}>Descuento</Text>
              <Text style={styles.descuentoValue}>- S/ {(sale.descuento ?? 0).toFixed(2)}</Text>
            </View>
          </>
        )}
        <View style={[styles.totalRow, styles.totalFinal]}>
          <Text style={styles.totalFinalLabel}>Total</Text>
          <Text style={styles.totalFinalValue}>S/ {sale.total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Imprimir boleta"
          onPress={handleImprimir}
          loading={printing}
          disabled={printing || savingPdf}
          variant="outline"
        />
        <Button
          title="Guardar PDF"
          onPress={handleGuardarPDF}
          loading={savingPdf}
          disabled={printing || savingPdf}
        />
        <Button
          title="Nueva venta"
          onPress={handleNuevaVenta}
          variant="secondary"
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
  successBox: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: `${Colors.success}15`,
    padding: Spacing.lg,
    borderRadius: BorderRadius.medium,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: `${Colors.success}40`,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
    marginTop: Spacing.sm,
  },
  successText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
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
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  metaLabel: { fontSize: 13, color: Colors.textSecondary },
  metaValue: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
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
  totalFinal: {
    paddingTop: Spacing.md,
    borderTopWidth: 2,
    borderTopColor: Colors.primary,
  },
  totalFinalLabel: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  totalFinalValue: { fontSize: 20, fontWeight: '700', color: Colors.primary },
  descuentoLabel: { fontSize: 14, color: Colors.textSecondary },
  descuentoValue: { fontSize: 14, color: Colors.error, fontWeight: '600' },
  actions: { gap: Spacing.md },
});
