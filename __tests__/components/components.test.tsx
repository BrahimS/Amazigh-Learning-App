import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { AmazighText } from '@/components/AmazighText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

describe('AmazighText', () => {
  it('renders Tifinagh with the bundled Tifinagh font', async () => {
    await render(<AmazighText variant="letter">ⴰ</AmazighText>);
    const text = screen.getByText('ⴰ');
    const style = StyleSheet.flatten(text.props.style);
    expect(style.fontFamily).toBe('NotoSansTifinagh-Regular');
  });

  it('renders Latin text with the bundled Latin font', async () => {
    await render(<AmazighText>Hello</AmazighText>);
    const style = StyleSheet.flatten(screen.getByText('Hello').props.style);
    expect(style.fontFamily).toBe('Poppins-Regular');
  });
});

describe('Button', () => {
  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button title="Continue" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Continue'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button title="Continue" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByText('Continue'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a loading indicator instead of the title', async () => {
    await render(<Button title="Continue" loading />);
    expect(screen.queryByText('Continue')).toBeNull();
  });
});

describe('Card', () => {
  it('renders its children', async () => {
    await render(
      <Card>
        <AmazighText>Card content</AmazighText>
      </Card>,
    );
    expect(screen.getByText('Card content')).toBeTruthy();
  });
});
