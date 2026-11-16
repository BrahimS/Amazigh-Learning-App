import React from 'react';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export function AlphabetScreen() {
  return (
    <PlaceholderScreen title="Tifinagh alphabet" subtitle="ⴰ ⴱ ⴳ ⴷ ⴹ ⴻ ⴼ ⴽ ⴾ" />
  );
}

export function LetterDetailsScreen() {
  return <PlaceholderScreen title="Letter details" />;
}

export function LetterQuizScreen() {
  return <PlaceholderScreen title="Letter quiz" />;
}
