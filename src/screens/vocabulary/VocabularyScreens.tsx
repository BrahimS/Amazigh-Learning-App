import React from 'react';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export function LibraryScreen() {
  return (
    <PlaceholderScreen
      title="Vocabulary"
      subtitle="Search words in Tifinagh, Latin, French and English"
    />
  );
}

export function WordDetailsScreen() {
  return <PlaceholderScreen title="Word details" />;
}

export function FlashcardsScreen() {
  return <PlaceholderScreen title="Flashcards" />;
}
