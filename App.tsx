/**
 * Amazigh Learning App
 * https://github.com/BrahimS/Amazigh-Learning-App
 *
 * @format
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RootNavigator } from '@/navigation/RootNavigator';
import { initAuthSessionGuard } from '@/services/firebase/sessionGuard';

function App() {
  // Drop the persisted session when the auth backend no longer recognizes it
  // (e.g. the local Auth emulator was restarted and its users wiped).
  React.useEffect(() => initAuthSessionGuard() ?? undefined, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ErrorBoundary>
        <View style={styles.container}>
          <RootNavigator />
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;