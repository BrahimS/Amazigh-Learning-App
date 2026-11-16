import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

import { WelcomeCard } from '@/components/WelcomeCard';

it('imports and renders WelcomeCard through the @/ alias', async () => {
  expect(WelcomeCard).toBeDefined();
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<WelcomeCard title="ⴰⵣⵓⵍ" description="Hello" />);
  });
});
