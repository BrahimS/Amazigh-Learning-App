/**
 * Amazigh Learning App
 * https://github.com/BrahimS/Amazigh-Learning-App
 *
 * @format
 */

import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WelcomeCard } from '@/components/WelcomeCard';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <WelcomeCard
          title="ⴰⵣⵓⵍ — Amazigh Learning"
          description="Learn Moroccan Amazigh: courses, audio, Tifinagh and culture."
        />
        <Text style={styles.footer}>Sprint 1 foundation</Text>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 24,
  },
});

export default App;
