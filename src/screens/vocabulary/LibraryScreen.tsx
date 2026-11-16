import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { TextInput } from '@/components/TextInput';
import { listVocabulary } from '@/services/firebase/vocabulary';
import { useTheme } from '@/theme';
import type { VocabularyItem, VocabularyStackParamList } from '@/types';
import { IS_DEV_BUILD } from '@/utils/devMode';
import { localizedText } from '@/utils/localized';

type VocabularyNavigation = NativeStackNavigationProp<VocabularyStackParamList>;
type LibraryRoute = RouteProp<VocabularyStackParamList, 'Library'>;

function matchesQuery(word: VocabularyItem, query: string): boolean {
  if (query === '') {
    return true;
  }
  const haystack = [
    word.text.tifinagh,
    word.text.latin ?? '',
    localizedText(word.translations),
    word.category ?? '',
  ]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

export function LibraryScreen({ route }: { route: LibraryRoute }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<VocabularyNavigation>();
  const [words, setWords] = useState<VocabularyItem[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState(route.params?.query ?? '');

  useEffect(() => {
    let active = true;
    listVocabulary({ maxResults: 200, includeUnvalidated: IS_DEV_BUILD }).then(
      result => {
        if (!active) {
          return;
        }
        if (result.ok) {
          setWords(result.data);
        } else {
          setError(true);
        }
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (words ?? []).filter(word => matchesQuery(word, query));
  }, [words, search]);

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.bold,
            fontSize: theme.fontSize.xl,
          },
        ]}
      >
        {t('vocabulary.title')}
      </Text>

      <TextInput
        placeholder={t('vocabulary.searchPlaceholder')}
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={t('vocabulary.searchPlaceholder')}
      />

      {error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t('vocabulary.loadError')}
        />
      ) : words === null ? (
        <View style={styles.skeletons}>
          <Skeleton height={76} borderRadius={16} />
          <Skeleton height={76} borderRadius={16} />
          <Skeleton height={76} borderRadius={16} />
        </View>
      ) : visible.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={t('vocabulary.noWordsTitle')}
          message={t('vocabulary.noWordsMessage')}
        />
      ) : (
        visible.map(word => (
          <Pressable
            key={word.id}
            accessibilityRole="button"
            accessibilityLabel={`${word.text.tifinagh} ${localizedText(
              word.translations,
            )}`}
            onPress={() =>
              navigation.navigate('WordDetails', { vocabularyId: word.id })
            }
          >
            <Card style={styles.wordCard}>
              <View style={styles.wordMain}>
                <AmazighText
                  script="tifinagh"
                  style={[
                    styles.wordTifinagh,
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
                    styles.wordLatin,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.fonts.latin.regular,
                    },
                  ]}
                >
                  {word.text.latin ? `${word.text.latin} · ` : ''}
                  {localizedText(word.translations)}
                </Text>
              </View>
              <View style={styles.wordMeta}>
                <Text
                  style={[
                    styles.wordCategory,
                    {
                      color: theme.colors.textSecondary,
                      fontFamily: theme.fonts.latin.regular,
                    },
                  ]}
                >
                  {[word.category, word.dialect].filter(Boolean).join(' · ')}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingBottom: 32,
    paddingTop: 16,
  },
  title: {},
  skeletons: {
    gap: 12,
  },
  wordCard: {
    gap: 8,
  },
  wordMain: {
    gap: 2,
  },
  wordTifinagh: {
    fontSize: 24,
  },
  wordLatin: {
    fontSize: 14,
  },
  wordMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wordCategory: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
});
