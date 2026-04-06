import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../../components/ErrorBoundary';

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock constants/theme
jest.mock('../../constants/theme', () => ({
  Colors: {
    accent: '#1A966B',
    white: '#FFFFFF',
    background: '#F2F2F7',
    text: '#000000',
    textSecondary: '#8E8E93',
    coral: '#F06652',
    systemGray6: '#F2F2F7',
  },
  Spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 },
  BorderRadius: { sm: 8, md: 12, lg: 16, full: 9999 },
  FontSize: { caption: 12, subheadline: 15, body: 17, title2: 22 },
  FontWeight: { regular: '400', semibold: '600', bold: '700' },
}));

// Component that throws on demand
function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <Text>Child content</Text>;
}

// Suppress console.error for expected error boundary logs
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalConsoleError;
});

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(getByText('Child content')).toBeTruthy();
  });

  it('shows error UI when child throws', () => {
    const { getByText, queryByText } = render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Should show error UI
    expect(getByText('Algo deu errado')).toBeTruthy();
    expect(getByText(/Ocorreu um erro inesperado/)).toBeTruthy();
    expect(getByText('Tentar novamente')).toBeTruthy();

    // Should NOT show children
    expect(queryByText('Child content')).toBeNull();
  });

  it('resets error state when "Tentar novamente" is pressed', () => {
    // We need a component that can toggle its throwing behavior
    let shouldThrow = true;

    function ToggleChild() {
      if (shouldThrow) {
        throw new Error('Recoverable error');
      }
      return <Text>Recovered content</Text>;
    }

    const { getByText } = render(
      <ErrorBoundary>
        <ToggleChild />
      </ErrorBoundary>,
    );

    // Should show error UI initially
    expect(getByText('Algo deu errado')).toBeTruthy();

    // Fix the child so it won't throw again
    shouldThrow = false;

    // Press retry
    fireEvent.press(getByText('Tentar novamente'));

    // Should now show recovered content
    expect(getByText('Recovered content')).toBeTruthy();
  });

  it('renders custom fallback when provided', () => {
    const fallback = <Text>Custom fallback</Text>;

    const { getByText, queryByText } = render(
      <ErrorBoundary fallback={fallback}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(getByText('Custom fallback')).toBeTruthy();
    expect(queryByText('Algo deu errado')).toBeNull();
  });
});
