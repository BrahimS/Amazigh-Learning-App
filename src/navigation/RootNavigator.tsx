import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { SplashScreen } from '@/screens/auth/AuthScreens';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useSessionStore } from '@/store/sessionStore';

import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { OnboardingStack } from './OnboardingStack';

/**
 * Root flow switch: Splash → Auth (logged out) → Onboarding (first run) → Main tabs.
 * Flow state comes from the persisted session and preferences stores.
 */
export function RootNavigator() {
  const isHydrated = useSessionStore(state => state.isHydrated);
  const user = useSessionStore(state => state.user);
  const hasCompletedOnboarding = usePreferencesStore(
    state => state.hasCompletedOnboarding,
  );

  return (
    <NavigationContainer>
      {!isHydrated ? (
        <SplashScreen />
      ) : !user ? (
        <AuthStack />
      ) : !hasCompletedOnboarding ? (
        <OnboardingStack />
      ) : (
        <MainTabs />
      )}
    </NavigationContainer>
  );
}
