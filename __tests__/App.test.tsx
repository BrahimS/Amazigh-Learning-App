import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import App from '../App';

// The guard initializes Firebase Auth; keep the smoke test offline.
jest.mock('@/services/firebase/sessionGuard', () => ({
  initAuthSessionGuard: jest.fn(() => null),
}));

test('renders the welcome screen', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
