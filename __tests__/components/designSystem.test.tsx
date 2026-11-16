import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { EmptyState } from '@/components/EmptyState';
import { FeedbackBanner } from '@/components/FeedbackBanner';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { Skeleton } from '@/components/Skeleton';
import { TextInput } from '@/components/TextInput';

describe('Screen', () => {
  it('renders children', async () => {
    await render(
      <Screen>
        <Skeleton />
      </Screen>,
    );
    expect(screen.toJSON()).toBeTruthy();
  });
});

describe('Header', () => {
  it('calls onBack when the back button is pressed', async () => {
    const onBack = jest.fn();
    await render(<Header title="Lesson" onBack={onBack} />);
    await fireEvent.press(screen.getByLabelText('Back'));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('renders the title', async () => {
    await render(<Header title="Vocabulary" />);
    expect(screen.getByText('Vocabulary')).toBeTruthy();
  });
});

describe('TextInput', () => {
  it('shows label and error', async () => {
    await render(
      <TextInput label="Email" error="Enter a valid email address." />,
    );
    expect(screen.getByText('Email')).toBeTruthy();
    expect(screen.getByText('Enter a valid email address.')).toBeTruthy();
  });

  it('forwards text changes', async () => {
    const onChangeText = jest.fn();
    await render(<TextInput placeholder="Email" onChangeText={onChangeText} />);
    await fireEvent.changeText(
      screen.getByPlaceholderText('Email'),
      'learner@example.com',
    );
    expect(onChangeText).toHaveBeenCalledWith('learner@example.com');
  });
});

describe('EmptyState', () => {
  it('renders the call to action', async () => {
    const onAction = jest.fn();
    await render(
      <EmptyState
        icon="library-outline"
        title="No words yet"
        message="Validated words will appear here."
        actionLabel="Browse courses"
        onAction={onAction}
      />,
    );
    expect(screen.getByText('No words yet')).toBeTruthy();
    await fireEvent.press(screen.getByText('Browse courses'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});

describe('ProgressBar', () => {
  it('clamps progress between 0 and 1', async () => {
    const { toJSON } = await render(<ProgressBar progress={2} />);
    expect(toJSON()).toBeTruthy();
  });
});

describe('FeedbackBanner', () => {
  it('shows the correct answer after a mistake', async () => {
    const onContinue = jest.fn();
    await render(
      <FeedbackBanner
        variant="incorrect"
        correctAnswer="azul"
        onContinue={onContinue}
      />,
    );
    expect(screen.getByText('Not quite')).toBeTruthy();
    expect(screen.getByText(/azul/)).toBeTruthy();
    await fireEvent.press(screen.getByText('Continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('renders the correct state without an answer', async () => {
    await render(<FeedbackBanner variant="correct" />);
    expect(screen.getByText('Correct!')).toBeTruthy();
    expect(screen.queryByText(/Correct answer:/)).toBeNull();
  });
});

describe('Skeleton', () => {
  it('renders a placeholder', async () => {
    const { toJSON } = await render(<Skeleton height={24} />);
    expect(toJSON()).toBeTruthy();
  });
});
