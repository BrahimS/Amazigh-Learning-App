import React from 'react';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';
import { WelcomeCard } from '@/components/WelcomeCard';
import { useTheme } from '@/theme';
import { StyleSheet, View } from 'react-native';

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
  return (
    <PlaceholderScreen title="Welcome" subtitle="Learn Moroccan Amazigh" />
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
});
