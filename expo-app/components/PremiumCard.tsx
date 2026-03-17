import React from 'react';
import { View, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface PremiumCardProps {
  children: React.ReactNode;
  padding?: number;
  style?: ViewStyle;
}

export default function PremiumCard({ children, padding = Spacing.lg, style }: PremiumCardProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? Colors.cardDark : Colors.card,
          padding,
          shadowColor: isDark ? 'transparent' : '#000',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
});
