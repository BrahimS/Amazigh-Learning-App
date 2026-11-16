import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { listVocabulary } from '@/services/firebase/vocabulary';
import { useTheme } from '@/theme';
import type { VocabularyItem, VocabularyStackParamList } from '@/types';
import { IS_DEV_BUILD } from '@/utils/devMode';
import { localizedText } from '@/utils/localized';

type VocabularyNavigation = NativeStackNavigationProp<VocabularyStackParamList>;

const DECK_SIZE = 20;

export function FlashcardsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<VocabularyNavigation>();
  const [words, setWords] = useState<VocabularyItem[] | null>(null);
  const [error, setError] = useState(false);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let active = true;
    listVocabulary({
      maxResults: 200,
      includeUnvalidated: IS_DEV_BUILD,
    }).then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setWords(result.data);
      } else {
        setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const deck = useMemo(() => (words ?? []).slice(0, DECK_SIZE), [words]);
  const current = deck[index];
  const total = deck.length;

  function advance(markKnown: boolean) {
    const nextKnown = known + (markKnown ? 1 : 0);
    if (index + 1 >= total) {
      setKnown(nextKnown);
      setFinished(true);
    } else {
      setKnown(nextKnown);
      setIndex(index + 1);
      setFlipped(false);
    }
  }

  function restart() {
    setIndex(0);
    setFlipped(false);
    setKnown(0);
    setFinished(false);
  }

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={t('vocabulary.flashcardsTitle')}
        onBack={() => navigation.goBack()}
      />

      {error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t('vocabulary.loadError')}
        />
      ) : words === null ? (
        <Skeleton height={260} borderRadius={16} />
      ) : total === 0 ? (
        <EmptyState
          icon="albums-outline"
          title={t('vocabulary.emptyDeckTitle')}
          message={t('vocabulary.emptyDeckMessage')}
        />
      ) : finished ? (
        <View style={styles.finished}>
          <Ionicons
            name="trophy-outline"
            size={56}
            color={theme.colors.accent}
          />
          <Text
            style={[
              styles.finishedTitle,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.fonts.latin.bold,
                fontSize: theme.fontSize.xl,
              },
            ]}
          >
            {t('vocabulary.deckCompleteTitle')}
          </Text>
          <Text
            style={[
              styles.finishedMessage,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.fonts.latin.regular,
              },
            ]}
          >
            {t('vocabulary.deckCompleteMessage', { total, known })}
          </Text>
          <Button
            title={t('vocabulary.restart')}
            onPress={restart}
            style={styles.restartButton}
          />
        </View>
      ) : (
        <>
          <ProgressBar
            progress={(index + 1) / total}
            label={t('vocabulary.flashcardProgress', {
              current: index + 1,
              total,
            })}
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              flipped
                ? localizedText(current.translations)
                : current.text.tifinagh
            }
            onPress={() => setFlipped(value => !value)}
          >
            <Card style={styles.card}>
              {!flipped ? (
                <View style={styles.cardFace}>
                  <AmazighText
                    script="tifinagh"
                    style={[
                      styles.cardTifinagh,
                      {
                        color: theme.colors.textPrimary,
                        fontFamily: theme.fonts.tifinagh.regular,
                      },
                    ]}
                  >
                    {current.text.tifinagh}
                  </AmazighText>
                  <Text
                    style={[
                      styles.cardHint,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.fonts.latin.regular,
                      },
                    ]}
                  >
                    {t('vocabulary.revealAnswer')}
                  </Text>
                </View>
              ) : (
                <View style={styles.cardFace}>
                  {current.text.latin ? (
                    <Text
                      style={[
                        styles.cardLatin,
                        {
                          color: theme.colors.textSecondary,
                          fontFamily: theme.fonts.latin.regular,
                        },
                      ]}
                    >
                      {current.text.latin}
                    </Text>
                  ) : null}
                  <Text
                    style={[
                      styles.cardTranslation,
                      {
                        color: theme.colors.textPrimary,
                        fontFamily: theme.fonts.latin.semiBold,
                      },
                    ]}
                  >
                    {localizedText(current.translations)}
                  </Text>
                  <Text
                    style={[
                      styles.cardHint,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.fonts.latin.regular,
                      },
                    ]}
                  >
                    {t('vocabulary.hideAnswer')}
                  </Text>
                </View>
              )}
            </Card>
          </Pressable>

          <View style={styles.actions}>
            {!flipped ? null : (
              <>
                <Button
                  title={t('vocabulary.review')}
                  variant="outline"
                  onPress={() => advance(false)}
                  style={styles.actionButton}
                />
                <Button
                  title={t('vocabulary.knewIt')}
                  onPress={() => advance(true)}
                  style={styles.actionButton}
                />
              </>
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
  },
  card: {
    minHeight: 260,
    padding: 24,
  },
  cardFace: {
    alignItems: 'center',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  cardTifinagh: {
    fontSize: 48,
    textAlign: 'center',
  },
  cardLatin: {
    fontSize: 18,
  },
  cardTranslation: {
    fontSize: 22,
    textAlign: 'center',
  },
  cardHint: {
    fontSize: 13,
    marginTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  finished: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  finishedTitle: {},
  finishedMessage: {
    fontSize: 15,
    textAlign: 'center',
  },
  restartButton: {
    marginTop: 12,
    minWidth: 200,
  },
});
