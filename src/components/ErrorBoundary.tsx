import React, { Component, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AmazighText } from '@/components/AmazighText';
import { useTheme } from '@/theme';
import { logError, mapFirebaseError } from '@/utils/errors';
import i18n from '@/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Top-level error boundary: renders a fallback screen instead of a white screen
 * of death, and logs the error in development.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error): void {
    logError('ErrorBoundary', error);
  }

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return <ErrorFallback error={this.state.error} />;
  }
}

function ErrorFallback({ error }: { error: Error | null }) {
  const theme = useTheme();
  const message = error ? mapFirebaseError(error) : i18n.t('errors.default');

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <AmazighText variant="heading">ⴰⵣⵓⵍ</AmazighText>
      <AmazighText style={styles.message}>{message}</AmazighText>
      {__DEV__ && error ? (
        <AmazighText
          style={[styles.details, { color: theme.colors.textSecondary }]}
        >
          {error.message}
        </AmazighText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  message: {
    marginTop: 12,
    textAlign: 'center',
  },
  details: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});
