import React from 'react';
import { signInAnonymously } from 'firebase/auth';

import { Button } from '@/components/Button';
import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { WelcomeCard } from '@/components/WelcomeCard';
import { config } from '@/config';
import { getFirebaseAuth } from '@/services/firebase/client';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSessionStore } from '@/store/sessionStore';
import { useTheme } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';

export function SplashScreen({
  navigation,
}: {
  navigation?: { replace: (route: 'Welcome') => void };
}) {
  const theme = useTheme();

  React.useEffect(() => {
    if (!navigation) {
      return;
    }
    const timer = setTimeout(() => navigation.replace('Welcome'), 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.primaryLight }]}
    >
      <WelcomeCard title="ⴰⵣⵓⵍ" description="Amazigh Learning" />
    </View>
  );
}

export function WelcomeScreen() {
  const theme = useTheme();
  const setUser = useSessionStore(state => state.setUser);
  const completeOnboarding = usePreferencesStore(
    state => state.completeOnboarding,
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Dev-only guest entry while Firebase Auth is not implemented (issues
  // #45/#46): signs in anonymously against the local Auth emulator and enters
  // the app with a local profile. Never shown outside development builds.
  const devGuestEnabled =
    typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    config.emulators.firestoreHost !== '' &&
    config.emulators.authHost !== '';

  const enterAsGuest = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(getFirebaseAuth());
      const nowSeconds = Math.floor(Date.now() / 1000);
      setUser({
        uid: 'dev-guest',
        displayName: 'Guest',
        email: 'guest@localhost',
        role: 'learner',
        dialect: 'tachelhit',
        uiLanguage: 'en',
        dailyGoalMinutes: 10,
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        createdAt: { seconds: nowSeconds, nanoseconds: 0 },
        updatedAt: { seconds: nowSeconds, nanoseconds: 0 },
      });
      completeOnboarding();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed');
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <PlaceholderScreen title="Welcome" subtitle="Learn Moroccan Amazigh" />
      {devGuestEnabled ? (
        <View style={styles.devActions}>
          {error ? (
            <Text style={[styles.devError, { color: theme.colors.danger }]}>
              {error}
            </Text>
          ) : null}
          <Button
            title="Continue as guest (dev)"
            variant="outline"
            loading={loading}
            onPress={enterAsGuest}
          />
        </View>
      ) : null}
    </View>
  );
}

export function RegisterScreen() {
  return <PlaceholderScreen title="Register" />;
}

export function LoginScreen() {
  return <PlaceholderScreen title="Login" />;
}

export function ForgotPasswordScreen() {
  return <PlaceholderScreen title="Forgot password" />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  devActions: {
    alignItems: 'center',
    gap: 8,
    paddingBottom: 32,
    width: '100%',
  },
  devError: {
    fontSize: 13,
    textAlign: 'center',
  },
});
