/**
 * Sistema de Diseño: Útiles Escolares
 * Colores y estilos según diseño.md
 */

import { Platform } from 'react-native';

// Colores del Sistema de Diseño
export const Colors = {
  // Colores Principales
  primary: '#1A73E8',      // Azul primario
  secondary: '#F59E0B',    // Naranja secundario
  background: '#F8F9FA',   // Fondo de la app
  surface: '#FFFFFF',       // Tarjetas y contenedores
  textPrimary: '#0F172A',   // Texto principal
  textSecondary: '#64748B', // Texto suave
  border: '#E2E8F0',     // Bordes
  white: '#FFFFFF',
  black: '#000000',
  
  // Estados
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  
  // Compatibilidad con tema claro/oscuro
  light: {
    text: '#0F172A',
    background: '#F8F9FA',
    tint: '#1A73E8',
    icon: '#64748B',
    tabIconDefault: '#64748B',
    tabIconSelected: '#1A73E8',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#1A73E8',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#1A73E8',
  },
};

// Radios de Borde
export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
};

// Espaciado
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

// Tipografía
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
