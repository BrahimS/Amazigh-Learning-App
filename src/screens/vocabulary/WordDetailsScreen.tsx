import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { getVocabularyItem } from '@/services/firebase/vocabulary';
import { useTheme } from '@/theme';
import type { VocabularyItem, VocabularyStackParamList } from '@/types';
import { localizedText } from '@/utils/localized';

type VocabularyNavigation = NativeStackNavigationProp<VocabularyStackParamList>;
type WordDetailsRoute = RouteProp<VocabularyStackParamList, 'WordDetails'>;

export function WordDetailsScreen({ route }: { route: WordDetailsRoute }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<VocabularyNavigation>();
  const { vocabularyId } = route.params;
  const [word, setWord] = useState<VocabularyItem | null | undefined>(
    undefined,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getVocabularyItem(vocabularyId).then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setWord(result.data);
      } else {
        setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, [vocabularyId]);

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={t('vocabulary.detailsTitle')}
        onBack={() => navigation.goBack()}
      />

      {error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t('vocabulary.loadError')}
        />
      ) : word === undefined ? (
        <View style={styles.skeletons}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={120} borderRadius={16} />
        </View>
      ) : word === null ? (
        <EmptyState icon="search-outline" title={t('vocabulary.notFound')} />
      ) : (
        <>
          <Card style={styles.hero}>
            <AmazighText
              script="tifinagh"
              style={[
                styles.heroTifinagh,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fonts.tifinagh.regular,
                },
              ]}
            >
              {word.text.tifinagh}
            </AmazighText>
            {word.text.latin ? (
              <Text
                style={[
                  styles.heroLatin,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.fonts.latin.regular,
                  },
                ]}
              >
                {word.text.latin}
              </Text>
            ) : null}
            <Text
              style={[
                styles.heroTranslation,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fonts.latin.semiBold,
                },
              ]}
            >
              {localizedText(word.translations)}
            </Text>
            <Text
              style={[
                styles.heroMeta,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fonts.latin.regular,
                },
              ]}
            >
              {[word.category, word.dialect].filter(Boolean).join(' · ')}
            </Text>
          </Card>

          {word.examples && word.examples.length > 0 ? (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: theme.colors.textPrimary,
                    fontFamily: theme.fonts.latin.semiBold,
                  },
                ]}
              >
                {t('vocabulary.examplesLabel')}
              </Text>
              {word.examples.map((example, index) => (
                <Card key={index} style={styles.exampleCard}>
                  <AmazighText
                    script="tifinagh"
                    style={[
                      styles.exampleTifinagh,
                      {
                        color: theme.colors.textPrimary,
                        fontFamily: theme.fonts.tifinagh.regular,
                      },
                    ]}
                  >
                    {example.text.tifinagh}
                  </AmazighText>
                  <Text
                    style={[
                      styles.exampleTranslation,
                      {
                        color: theme.colors.textSecondary,
                        fontFamily: theme.fonts.latin.regular,
                      },
                    ]}
                  >
                    {localizedText(example.translations)}
                  </Text>
                </Card>
              ))}
            </View>
          ) : null}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 32,
  },
  skeletons: {
    gap: 12,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 24,
  },
  heroTifinagh: {
    fontSize: 44,
  },
  heroLatin: {
    fontSize: 18,
  },
  heroTranslation: {
    fontSize: 18,
    marginTop: 4,
  },
  heroMeta: {
    fontSize: 13,
    marginTop: 6,
    textTransform: 'capitalize',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    marginTop: 8,
  },
  exampleCard: {
    gap: 4,
    padding: 14,
  },
  exampleTifinagh: {
    fontSize: 20,
  },
  exampleTranslation: {
    fontSize: 14,
  },
});
