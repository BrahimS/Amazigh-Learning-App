import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { AmazighText } from '@/components/AmazighText';
import { Card } from '@/components/Card';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { listVocabulary } from '@/services/firebase/vocabulary';
import { useTheme } from '@/theme';
import type { LocalizedText, VocabularyItem } from '@/types';

function localized(text: LocalizedText | undefined): string {
  return text?.en ?? text?.fr ?? '';
}

export function LibraryScreen() {
  const theme = useTheme();
  const [words, setWords] = useState<VocabularyItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listVocabulary({ maxResults: 100 }).then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setWords(result.data);
      } else {
        setError(result.error.message);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (error !== null || words === null) {
    return (
      <PlaceholderScreen
        title="Vocabulary"
        subtitle={error ?? 'Loading words…'}
      />
    );
  }

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text
        style={[
          styles.heading,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.bold,
            fontSize: theme.fontSize.xl,
          },
        ]}
      >
        Vocabulary
      </Text>
      {words.length === 0 ? (
        <Text style={{ color: theme.colors.textSecondary }}>
          No validated words yet.
        </Text>
      ) : null}
      {words.map(word => (
        <Card key={word.id} style={styles.card}>
          <AmazighText
            script="tifinagh"
            style={{
              color: theme.colors.textPrimary,
              fontSize: theme.fontSize.xl,
            }}
          >
            {word.text.tifinagh}
          </AmazighText>
          {word.text.latin ? (
            <Text
              style={{
                color: theme.colors.textSecondary,
                fontFamily: theme.fonts.latin.regular,
                fontSize: theme.fontSize.md,
                marginTop: theme.spacing.xs,
              }}
            >
              {word.text.latin}
            </Text>
          ) : null}
          <Text
            style={{
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.latin.semiBold,
              fontSize: theme.fontSize.md,
              marginTop: theme.spacing.sm,
            }}
          >
            {localized(word.translations)}
          </Text>
          <Text
            style={{
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.regular,
              fontSize: theme.fontSize.xs,
              marginTop: theme.spacing.xs,
            }}
          >
            {word.category} · {word.dialect}
          </Text>
        </Card>
      ))}
    </ScrollView>
  );
}

export function WordDetailsScreen() {
  return <PlaceholderScreen title="Word details" />;
}

export function FlashcardsScreen() {
  return <PlaceholderScreen title="Flashcards" />;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12 },
  heading: { marginBottom: 4 },
  card: { padding: 16 },
});
