import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { listLetters } from '@/services/firebase/letters';
import { useTheme } from '@/theme';
import type { TifinaghLetter, TifinaghStackParamList } from '@/types';

type TifinaghNavigation = NativeStackNavigationProp<TifinaghStackParamList>;

function LetterTile({
  letter,
  onPress,
}: {
  letter: TifinaghLetter;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${letter.glyph} ${letter.latin}`}
      onPress={onPress}
      style={styles.tilePressable}
    >
      <Card style={styles.tile}>
        <AmazighText
          variant="letter"
          style={[
            styles.tileGlyph,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.tifinagh.regular,
            },
          ]}
        >
          {letter.glyph}
        </AmazighText>
        <Text
          style={[
            styles.tileLatin,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.regular,
            },
          ]}
        >
          {letter.latin}
        </Text>
      </Card>
    </Pressable>
  );
}

export function AlphabetScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<TifinaghNavigation>();
  const [letters, setLetters] = useState<TifinaghLetter[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    listLetters().then(result => {
      if (!active) {
        return;
      }
      if (result.ok) {
        setLetters(result.data);
      } else {
        setError(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

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
        {t('tifinagh.alphabetTitle')}
      </Text>
      {letters !== null ? (
        <Text
          style={[
            styles.subtitle,
            {
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.latin.regular,
            },
          ]}
        >
          {t('tifinagh.alphabetSubtitle', { count: letters.length })}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('tifinagh.quizTitle')}
        onPress={() => navigation.navigate('LetterQuiz', {})}
        style={styles.actionsRow}
      >
        <Card style={styles.actionCard}>
          <Ionicons
            name="help-circle-outline"
            size={22}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.actionLabel,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.fonts.latin.semiBold,
              },
            ]}
          >
            {t('tifinagh.quizTitle')}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </Card>
      </Pressable>

      {error ? (
        <EmptyState
          icon="cloud-offline-outline"
          title={t('tifinagh.loadError')}
        />
      ) : letters === null ? (
        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} height={96} borderRadius={16} />
          ))}
        </View>
      ) : letters.length === 0 ? (
        <EmptyState
          icon="grid-outline"
          title={t('tifinagh.noLettersTitle')}
          message={t('tifinagh.noLettersMessage')}
        />
      ) : (
        <View style={styles.grid}>
          {letters.map(letter => (
            <LetterTile
              key={letter.id}
              letter={letter}
              onPress={() =>
                navigation.navigate('LetterDetails', { letterId: letter.id })
              }
            />
          ))}
        </View>
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
  subtitle: {
    fontSize: 13,
    marginTop: -8,
  },
  actionsRow: {
    marginTop: 4,
  },
  actionCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    padding: 14,
  },
  actionLabel: {
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  tilePressable: {
    width: '31%',
  },
  tile: {
    alignItems: 'center',
    aspectRatio: 0.9,
    justifyContent: 'center',
    padding: 8,
  },
  tileGlyph: {
    fontSize: 34,
  },
  tileLatin: {
    fontSize: 12,
    marginTop: 4,
  },
});
