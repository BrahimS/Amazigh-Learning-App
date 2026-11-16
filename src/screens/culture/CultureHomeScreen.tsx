import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { listArticles } from '@/services/firebase/culture';
import { useTheme } from '@/theme';
import type {
  CultureArticle,
  CultureCategory,
  CultureStackParamList,
} from '@/types';

type CultureNavigation = NativeStackNavigationProp<CultureStackParamList>;

const CATEGORIES: Array<CultureCategory | 'all'> = [
  'all',
  'history',
  'traditions',
  'proverbs',
  'regions',
];

function CategoryChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
    >
      <View
        style={[
          styles.chip,
          {
            backgroundColor: selected
              ? theme.colors.primary
              : theme.colors.surface,
            borderColor: selected ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.chipLabel,
            {
              color: selected
                ? theme.colors.textInverse
                : theme.colors.textPrimary,
              fontFamily: theme.fonts.latin.semiBold,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function ArticleCard({
  article,
  onPress,
}: {
  article: CultureArticle;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={article.title}
      onPress={onPress}
    >
      <Card style={styles.articleCard}>
        <View style={styles.articleHeader}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: theme.colors.accent + '22' },
            ]}
          >
            <Text
              style={[
                styles.categoryText,
                {
                  color: theme.colors.accent,
                  fontFamily: theme.fonts.latin.semiBold,
                },
              ]}
            >
              {t(`culture.categories.${article.category}`)}
            </Text>
          </View>
          {article.region ? (
            <Text
              style={[
                styles.region,
                {
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fonts.latin.regular,
                },
              ]}
            >
              {article.region}
            </Text>
          ) : null}
        </View>
        <Text
          style={[
            styles.articleTitle,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.latin.semiBold,
            },
          ]}
        >
          {article.title}
        </Text>
        <View style={styles.articleFooter}>
          <Ionicons
            name="book-outline"
            size={16}
            color={theme.colors.textSecondary}
          />
          <Text
            style={[
              styles.readMore,
              {
                color: theme.colors.primary,
                fontFamily: theme.fonts.latin.semiBold,
              },
            ]}
          >
            {t('culture.readMore')}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

export function CultureHomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<CultureNavigation>();
  const [category, setCategory] = useState<CultureCategory | 'all'>('all');
  const [articles, setArticles] = useState<CultureArticle[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setArticles(null);
    setError(false);
    listArticles({
      category: category === 'all' ? undefined : category,
      maxResults: 50,
    }).then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setArticles(result.data);
      } else {
        setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, [category]);

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
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
          {t('culture.title')}
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.regular,
            },
          ]}
        >
          {t('culture.subtitle')}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {CATEGORIES.map(option => (
          <CategoryChip
            key={option}
            label={t(`culture.categories.${option}`)}
            selected={category === option}
            onPress={() => setCategory(option)}
          />
        ))}
      </ScrollView>

      {error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t('culture.loadError')}
        />
      ) : articles === null ? (
        <View style={styles.skeletons}>
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={120} borderRadius={16} />
        </View>
      ) : articles.length === 0 ? (
        <EmptyState
          icon="newspaper-outline"
          title={t('culture.noArticlesTitle')}
          message={t('culture.noArticlesMessage')}
        />
      ) : (
        articles.map(article => (
          <ArticleCard
            key={article.id}
            article={article}
            onPress={() =>
              navigation.navigate('Article', { articleId: article.id })
            }
          />
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
  header: {
    marginBottom: 4,
  },
  title: {},
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  chipsRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipLabel: {
    fontSize: 13,
  },
  skeletons: {
    gap: 12,
  },
  articleCard: {
    gap: 8,
    padding: 16,
  },
  articleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  categoryBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryText: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  region: {
    fontSize: 12,
  },
  articleTitle: {
    fontSize: 17,
  },
  articleFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  readMore: {
    fontSize: 13,
  },
});
