export const designTokens = {
  colors: {
    bg: {
      base: '#07090D',
      subtle: '#0B0F15',
      elevated: '#10151D',
      bento: '#121923',
      hover: '#161F2B',
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.08)',
      strong: 'rgba(255, 255, 255, 0.13)',
      active: 'rgba(255, 255, 255, 0.20)',
    },
    text: {
      primary: '#F4F4F5',
      secondary: '#A1A1AA',
      muted: '#71717A',
    },
    accent: {
      cyan: '#38BDF8',
      violet: '#8B5CF6',
    },
    semantic: {
      success: '#34D399',
      warning: '#FBBF24',
      danger: '#F87171',
      info: '#60A5FA',
    },
  },
  typography: {
    fontFamilySans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
    fontFamilyMono: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, Monaco, Consolas, monospace',
    fontSize: {
      pageTitle: '32px',
      sectionTitle: '20px',
      cardTitle: '15px',
      body: '13px',
      metadata: '11px',
      technical: '11px',
    },
    fontWeight: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  radius: {
    bento: '18px',
    card: '14px',
    button: '8px',
    badge: '6px',
    full: '9999px',
  },
  shadow: {
    bento: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    bentoHover: '0 12px 30px -4px rgba(0, 0, 0, 0.65), 0 0 20px -5px rgba(56, 189, 248, 0.08)',
    glowCyan: '0 0 15px rgba(56, 189, 248, 0.15)',
    glowAmber: '0 0 15px rgba(251, 191, 36, 0.15)',
  },
  spacing: {
    cardPadding: '20px',
    cardGap: '16px',
  },
  animation: {
    durationFast: '180ms',
    durationNormal: '220ms',
    durationSlow: '300ms',
    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
} as const;

export type DesignTokens = typeof designTokens;
