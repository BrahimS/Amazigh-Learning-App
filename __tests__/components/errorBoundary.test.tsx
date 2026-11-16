import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import i18n from '@/i18n';

function Bomb(): never {
  throw new Error('boom');
}

it('renders the fallback screen when a child throws', async () => {
  const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await render(
    <ErrorBoundary>
      <Bomb />
    </ErrorBoundary>,
  );

  expect(screen.getByText('ⴰⵣⵓⵍ')).toBeTruthy();
  expect(screen.getByText(i18n.t('errors.unknown'))).toBeTruthy();
  consoleSpy.mockRestore();
});

it('renders children when nothing throws', async () => {
  await render(
    <ErrorBoundary>
      <Text>All good</Text>
    </ErrorBoundary>,
  );
  expect(screen.getByText('All good')).toBeTruthy();
  expect(screen.queryByText('ⴰⵣⵓⵍ')).toBeNull();
});
