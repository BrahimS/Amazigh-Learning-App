import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WelcomeCardProps {
  title: string;
  description?: string;
}

export function WelcomeCard({ title, description }: WelcomeCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    color: '#1f2937',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: '#6b7280',
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
});
