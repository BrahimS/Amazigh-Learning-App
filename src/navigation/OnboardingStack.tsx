import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  DialectSelectionScreen,
  LearningPreferencesScreen,
} from '@/screens/onboarding/OnboardingScreens';
import type { OnboardingStackParamList } from '@/types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="DialectSelection"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name="DialectSelection"
        component={DialectSelectionScreen}
      />
      <Stack.Screen
        name="LearningPreferences"
        component={LearningPreferencesScreen}
      />
    </Stack.Navigator>
  );
}
