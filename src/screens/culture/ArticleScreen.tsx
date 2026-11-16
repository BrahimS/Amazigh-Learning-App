import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { getArticle } from '@/services/firebase/culture';
import { useTheme } from '@/theme';
import type { CultureArticle, CultureStackParamList } from '@/types';

type CultureNavigation = NativeStackNavigationProp<CultureStackParamList>;
type ArticleRoute = RouteProp<CultureStackParamList, 'Article'>;

export function ArticleScreen({ route }: { route: ArticleRoute }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<CultureNavigation>();
  const { articleId } = route.params;
  const [article, setArticle] = useState<CultureArticle | null | undefined>(
    undefined,
  );
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getArticle(articleId).then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setArticle(result.data);
      } else {
        setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, [articleId]);

  const paragraphs =
    article?.body.split(/\n+/).filter(p => p.trim() !== '') ?? [];

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <Header
        title={t('culture.articleTitle')}
        onBack={() => navigation.goBack()}
      />

      {error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t('culture.loadError')}
        />
      ) : article === undefined ? (
        <View style={styles.skeletons}>
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={200} borderRadius={16} />
        </View>
      ) : article === null ? (
        <EmptyState icon="newspaper-outline" title={t('culture.notFound')} />
      ) : (
        <>
          <View style={styles.metaRow}>
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
              styles.title,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.fonts.latin.bold,
                fontSize: theme.fontSize.xl,
              },
            ]}
          >
            {article.title}
          </Text>

          <Card style={styles.bodyCard}>
            {paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                style={[
                  styles.paragraph,
                  {
                    color: theme.colors.textPrimary,
                    fontFamily: theme.fonts.latin.regular,
                  },
                ]}
              >
                {paragraph}
              </Text>
            ))}
          </Card>
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
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
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
  title: {},
  bodyCard: {
    gap: 14,
    padding: 18,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
  },
});
