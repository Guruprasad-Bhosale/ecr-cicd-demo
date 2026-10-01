export { designTokens, type DesignTokens } from './designTokens';

import { designTokens } from './designTokens';

export const theme = {
  colors: designTokens.colors,
  radius: designTokens.radius,
  shadow: designTokens.shadow,
  spacing: designTokens.spacing,
  animation: designTokens.animation,
  typography: designTokens.typography,
} as const;

export type Theme = typeof theme;
