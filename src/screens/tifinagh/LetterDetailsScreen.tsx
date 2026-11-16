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
import { getLetter } from '@/services/firebase/letters';
import { getVocabularyItem } from '@/services/firebase/vocabulary';
import { useTheme } from '@/theme';
import type {
  TifinaghLetter,
  TifinaghStackParamList,
  VocabularyItem,
} from '@/types';
import { localizedText } from '@/utils/localized';

type TifinaghNavigation = NativeStackNavigationProp<TifinaghStackParamList>;
type LetterDetailsRoute = RouteProp<TifinaghStackParamList, 'LetterDetails'>;

function MetaRow({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View style={styles.metaRow}>
      <Text
        style={[
          styles.metaLabel,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.latin.regular,
          },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.metaValue,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.semiBold,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function LetterDetailsScreen({ route }: { route: LetterDetailsRoute }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<TifinaghNavigation>();
  const { letterId } = route.params;
  const [letter, setLetter] = useState<TifinaghLetter | null | undefined>(
    undefined,
  );
  const [examples, setExamples] = useState<VocabularyItem[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getLetter(letterId).then(async result => {
      if (!active) {
        return;
      }
      if (!result.ok) {
        setError(true);
        return;
      }
      setLetter(result.data);
      const ids = result.data?.examples ?? [];
      if (ids.length === 0) {
        setExamples([]);
        return;
      }
      const fetched = await Promise.all(ids.map(id => getVocabularyItem(id)));
      if (!active) {
        return;
      }
      setExamples(
        fetched
          .filter(r => r.ok && r.data !== null)
          .map(r => (r.ok ? r.data : null))
          .filter((w): w is VocabularyItem => w !== null),
      );
    });
    return () => {
      active = false;
    };
  }, [letterId]);

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={t('tifinagh.detailsTitle')}
        onBack={() => navigation.goBack()}
      />

      {error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t('tifinagh.loadError')}
        />
      ) : letter === undefined ? (
        <View style={styles.skeletons}>
          <Skeleton height={180} borderRadius={16} />
          <Skeleton height={120} borderRadius={16} />
        </View>
      ) : letter === null ? (
        <EmptyState icon="search-outline" title={t('tifinagh.notFound')} />
      ) : (
        <>
          <Card style={styles.hero}>
            <AmazighText
              variant="letter"
              style={[
                styles.heroGlyph,
                {
                  color: theme.colors.textPrimary,
                  fontFamily: theme.fonts.tifinagh.regular,
                },
              ]}
            >
              {letter.glyph}
            </AmazighText>
            <View style={styles.meta}>
              <MetaRow label={t('tifinagh.nameLabel')} value={letter.name} />
              <MetaRow label={t('tifinagh.latinLabel')} value={letter.latin} />
              {letter.ipa ? (
                <MetaRow label={t('tifinagh.ipaLabel')} value={letter.ipa} />
              ) : null}
              <MetaRow
                label={t('tifinagh.unicodeLabel')}
                value={letter.unicode}
              />
              <MetaRow
                label={t('tifinagh.orderLabel')}
                value={String(letter.order)}
              />
            </View>
          </Card>

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
              {t('tifinagh.examplesLabel')}
            </Text>
            {examples === null ? (
              <Skeleton height={72} borderRadius={16} />
            ) : examples.length === 0 ? (
              <Text
                style={[
                  styles.noExamples,
                  {
                    color: theme.colors.textSecondary,
                    fontFamily: theme.fonts.latin.regular,
                  },
                ]}
              >
                {t('tifinagh.noExamples')}
              </Text>
            ) : (
              examples.map(word => (
                <Card key={word.id} style={styles.exampleCard}>
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
                    {word.text.tifinagh}
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
                    {localizedText(word.translations)}
                  </Text>
                </Card>
              ))
            )}
          </View>
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
    gap: 16,
    paddingVertical: 24,
  },
  heroGlyph: {
    fontSize: 72,
  },
  meta: {
    alignSelf: 'stretch',
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    marginTop: 8,
  },
  noExamples: {
    fontSize: 14,
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
