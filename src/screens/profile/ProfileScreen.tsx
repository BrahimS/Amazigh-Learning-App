import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { signOutUser } from '@/services/firebase/auth';
import { useSessionStore } from '@/store/sessionStore';
import { useTheme } from '@/theme';
import type { ProfileStackParamList } from '@/types';

type ProfileNavigation = NativeStackNavigationProp<ProfileStackParamList>;

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Card style={styles.menuRow}>
        <View
          style={[
            styles.menuIcon,
            { backgroundColor: theme.colors.primaryLight + '26' },
          ]}
        >
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <Text
          style={[
            styles.menuLabel,
            {
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.latin.semiBold,
            },
          ]}
        >
          {label}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textSecondary}
        />
      </Card>
    </Pressable>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.statChip,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
      ]}
    >
      <Text
        style={[
          styles.statValue,
          {
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.latin.bold,
          },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          {
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.latin.regular,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export function ProfileScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<ProfileNavigation>();
  const user = useSessionStore(state => state.user);
  const logout = useSessionStore(state => state.logout);

  async function handleSignOut() {
    await signOutUser();
    logout();
  }

  return (
    <Screen scroll contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        >
          <Text
            style={[styles.avatarInitial, { color: theme.colors.textInverse }]}
          >
            {(user?.displayName ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text
            style={[
              styles.userName,
              {
                color: theme.colors.textPrimary,
                fontFamily: theme.fonts.latin.bold,
                fontSize: theme.fontSize.xl,
              },
            ]}
          >
            {user?.displayName ?? '—'}
          </Text>
          <Text
            style={[
              styles.userEmail,
              {
                color: theme.colors.textSecondary,
                fontFamily: theme.fonts.latin.regular,
              },
            ]}
          >
            {user?.email ?? ''}
          </Text>
          <Text
            style={[
              styles.userDialect,
              {
                color: theme.colors.primary,
                fontFamily: theme.fonts.latin.semiBold,
              },
            ]}
          >
            {user?.dialect ?? ''}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatChip label={t('profile.xpLabel')} value={String(user?.xp ?? 0)} />
        <StatChip
          label={t('profile.streakLabel')}
          value={String(user?.currentStreak ?? 0)}
        />
        <StatChip
          label={t('profile.longestStreakLabel')}
          value={String(user?.longestStreak ?? 0)}
        />
      </View>

      <View style={styles.menu}>
        <MenuRow
          icon="trophy-outline"
          label={t('profile.achievements')}
          onPress={() => navigation.navigate('Achievements')}
        />
        <MenuRow
          icon="stats-chart-outline"
          label={t('profile.statistics')}
          onPress={() => navigation.navigate('Statistics')}
        />
        <MenuRow
          icon="settings-outline"
          label={t('profile.settings')}
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('profile.signOut')}
        onPress={handleSignOut}
      >
        <Card style={styles.signOutCard}>
          <Ionicons
            name="log-out-outline"
            size={20}
            color={theme.colors.danger}
          />
          <Text
            style={[
              styles.signOutLabel,
              {
                color: theme.colors.danger,
                fontFamily: theme.fonts.latin.semiBold,
              },
            ]}
          >
            {t('profile.signOut')}
          </Text>
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarInitial: {
    fontSize: 32,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {},
  userEmail: {
    fontSize: 13,
  },
  userDialect: {
    fontSize: 13,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statChip: {
    alignItems: 'center',
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  menu: {
    gap: 10,
  },
  menuRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  menuIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
  },
  signOutCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  signOutLabel: {
    fontSize: 15,
  },
});
