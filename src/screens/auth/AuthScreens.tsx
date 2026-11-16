import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { signInAnonymously } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { AmazighText } from '@/components/AmazighText';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { TextInput } from '@/components/TextInput';
import {
  registerWithEmail,
  sendPasswordReset,
  signInWithEmail,
} from '@/services/firebase/auth';
import { getFirebaseAuth } from '@/services/firebase/client';
import { shouldUseEmulators } from '@/services/firebase/emulators';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSessionStore } from '@/store/sessionStore';
import { useTheme } from '@/theme';
import type { AuthStackParamList } from '@/types';

type AuthNavigation = NativeStackNavigationProp<AuthStackParamList>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    <View style={[styles.splash, { backgroundColor: theme.colors.primary }]}>
      <AmazighText
        script="tifinagh"
        style={[styles.splashGlyph, { color: theme.colors.textInverse }]}
      >
        ⴰⵣⵓⵍ
      </AmazighText>
      <AmazighText
        variant="heading"
        style={[styles.splashTitle, { color: theme.colors.textInverse }]}
      >
        Amazigh Learning
      </AmazighText>
    </View>
  );
}

export function WelcomeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<AuthNavigation>();
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
    typeof __DEV__ !== 'undefined' && __DEV__ && shouldUseEmulators();

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
    <Screen scroll contentContainerStyle={styles.welcomeContent}>
      <View style={styles.hero}>
        <AmazighText
          script="tifinagh"
          style={[styles.heroGlyph, { color: theme.colors.primary }]}
        >
          ⴰⵣⵓⵍ
        </AmazighText>
        <AmazighText variant="heading" style={styles.heroTitle}>
          Amazigh Learning
        </AmazighText>
        <AmazighText
          style={[styles.heroTagline, { color: theme.colors.textSecondary }]}
        >
          {t('auth.welcomeTagline')}
        </AmazighText>
      </View>

      <View style={styles.actions}>
        <Button
          title={t('auth.getStarted')}
          size="lg"
          onPress={() => navigation.navigate('Register', {})}
        />
        <Button
          title={t('auth.signIn')}
          variant="outline"
          size="lg"
          onPress={() => navigation.navigate('Login')}
        />
        {devGuestEnabled ? (
          <>
            {error ? (
              <Text style={[styles.error, { color: theme.colors.danger }]}>
                {error}
              </Text>
            ) : null}
            <Button
              title={t('auth.guestDev')}
              variant="outline"
              loading={loading}
              onPress={enterAsGuest}
            />
          </>
        ) : null}
      </View>
    </Screen>
  );
}

function useAuthSubmit() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const run = React.useCallback(
    async (
      action: () => Promise<{ ok: boolean; error?: { message: string } }>,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await action();
        if (!result.ok && result.error) {
          setError(result.error.message);
        }
        return result.ok;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, error, run, clearError: () => setError(null) };
}

export function LoginScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<AuthNavigation>();
  const { loading, error, run, clearError } = useAuthSubmit();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = () => {
    clearError();
    const errors: typeof fieldErrors = {};
    if (!email.trim()) {
      errors.email = t('auth.validation.required');
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = t('auth.validation.invalidEmail');
    }
    if (!password) {
      errors.password = t('auth.validation.required');
    }
    setFieldErrors(errors);
    if (errors.email || errors.password) {
      return;
    }
    void run(() => signInWithEmail(email.trim(), password));
  };

  return (
    <Screen
      scroll
      edges={['top', 'bottom']}
      contentContainerStyle={styles.formContent}
    >
      <Header title={t('auth.loginTitle')} onBack={() => navigation.goBack()} />
      <AmazighText
        style={[styles.subtitle, { color: theme.colors.textSecondary }]}
      >
        {t('auth.loginSubtitle')}
      </AmazighText>

      <View style={styles.form}>
        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          autoComplete="password"
        />
        {error ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}
        <Button
          title={t('auth.signInButton')}
          size="lg"
          loading={loading}
          onPress={handleSubmit}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.linkButton}
        >
          <Text
            style={[
              styles.link,
              {
                color: theme.colors.secondary,
                fontFamily: theme.fonts.latin.medium,
              },
            ]}
          >
            {t('auth.forgotPassword')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Register', {})}
          style={styles.linkButton}
        >
          <Text
            style={[
              styles.link,
              {
                color: theme.colors.primary,
                fontFamily: theme.fonts.latin.semiBold,
              },
            ]}
          >
            {t('auth.noAccount')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

export function RegisterScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<AuthNavigation>();
  const { loading, error, run, clearError } = useAuthSubmit();
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [fieldErrors, setFieldErrors] = React.useState<{
    displayName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleSubmit = () => {
    clearError();
    const errors: typeof fieldErrors = {};
    if (!displayName.trim()) {
      errors.displayName = t('auth.validation.required');
    }
    if (!email.trim()) {
      errors.email = t('auth.validation.required');
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      errors.email = t('auth.validation.invalidEmail');
    }
    if (!password) {
      errors.password = t('auth.validation.required');
    } else if (password.length < 6) {
      errors.password = t('auth.validation.passwordTooShort');
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = t('auth.validation.passwordMismatch');
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    void run(() =>
      registerWithEmail({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
      }),
    );
  };

  return (
    <Screen
      scroll
      edges={['top', 'bottom']}
      contentContainerStyle={styles.formContent}
    >
      <Header
        title={t('auth.registerTitle')}
        onBack={() => navigation.goBack()}
      />
      <AmazighText
        style={[styles.subtitle, { color: theme.colors.textSecondary }]}
      >
        {t('auth.registerSubtitle')}
      </AmazighText>

      <View style={styles.form}>
        <TextInput
          label={t('auth.displayName')}
          value={displayName}
          onChangeText={setDisplayName}
          error={fieldErrors.displayName}
          autoComplete="name"
        />
        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          secureTextEntry
          autoComplete="new-password"
        />
        <TextInput
          label={t('auth.confirmPassword')}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={fieldErrors.confirmPassword}
          secureTextEntry
          autoComplete="new-password"
        />
        {error ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}
        <Button
          title={t('auth.createAccount')}
          size="lg"
          loading={loading}
          onPress={handleSubmit}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Login')}
          style={styles.linkButton}
        >
          <Text
            style={[
              styles.link,
              {
                color: theme.colors.primary,
                fontFamily: theme.fonts.latin.semiBold,
              },
            ]}
          >
            {t('auth.haveAccount')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigation = useNavigation<AuthNavigation>();
  const { loading, error, run, clearError } = useAuthSubmit();
  const [email, setEmail] = React.useState('');
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async () => {
    clearError();
    setFieldError(null);
    if (!email.trim()) {
      setFieldError(t('auth.validation.required'));
      return;
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      setFieldError(t('auth.validation.invalidEmail'));
      return;
    }
    const okResult = await run(() => sendPasswordReset(email.trim()));
    if (okResult) {
      setSent(true);
    }
  };

  return (
    <Screen
      scroll
      edges={['top', 'bottom']}
      contentContainerStyle={styles.formContent}
    >
      <Header title={t('auth.resetTitle')} onBack={() => navigation.goBack()} />
      <AmazighText
        style={[styles.subtitle, { color: theme.colors.textSecondary }]}
      >
        {t('auth.resetSubtitle')}
      </AmazighText>

      <View style={styles.form}>
        {sent ? (
          <AmazighText style={[styles.success, { color: theme.colors.accent }]}>
            {t('auth.resetSent')}
          </AmazighText>
        ) : null}
        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          error={fieldError}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
        />
        {error ? (
          <Text style={[styles.error, { color: theme.colors.danger }]}>
            {error}
          </Text>
        ) : null}
        <Button
          title={t('auth.sendReset')}
          size="lg"
          loading={loading}
          onPress={handleSubmit}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          style={styles.linkButton}
        >
          <Text
            style={[
              styles.link,
              {
                color: theme.colors.primary,
                fontFamily: theme.fonts.latin.semiBold,
              },
            ]}
          >
            {t('auth.backToSignIn')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  splash: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  splashGlyph: {
    fontSize: 72,
    lineHeight: 88,
  },
  splashTitle: {
    fontSize: 24,
    marginTop: 12,
  },
  welcomeContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 48,
    paddingTop: 48,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  heroGlyph: {
    fontSize: 64,
    lineHeight: 80,
  },
  heroTitle: {
    fontSize: 28,
    marginTop: 16,
  },
  heroTagline: {
    fontSize: 15,
    marginTop: 8,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
  },
  formContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  linkButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  link: {
    fontSize: 14,
  },
  error: {
    fontSize: 13,
    textAlign: 'center',
  },
  success: {
    fontSize: 14,
    textAlign: 'center',
  },
});
