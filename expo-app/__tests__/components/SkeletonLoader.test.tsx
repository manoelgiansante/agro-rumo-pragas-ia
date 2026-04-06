import React from 'react';
import { render } from '@testing-library/react-native';
import { SkeletonLoader } from '../../components/SkeletonLoader';

// Mock useColorScheme
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}));

// --- Tests ---
describe('SkeletonLoader', () => {
  it('renders with given dimensions', () => {
    const { toJSON } = render(<SkeletonLoader width={200} height={40} />);

    const tree = toJSON() as any;
    // The Animated.View renders with the style applied
    const flatStyle = Array.isArray(tree.props.style)
      ? Object.assign({}, ...tree.props.style.filter(Boolean))
      : tree.props.style;

    expect(flatStyle.width).toBe(200);
    expect(flatStyle.height).toBe(40);
  });

  it('applies custom borderRadius', () => {
    const { toJSON } = render(<SkeletonLoader width={100} height={20} borderRadius={16} />);

    const tree = toJSON() as any;
    const flatStyle = Array.isArray(tree.props.style)
      ? Object.assign({}, ...tree.props.style.filter(Boolean))
      : tree.props.style;

    expect(flatStyle.borderRadius).toBe(16);
  });

  it('applies custom style', () => {
    const { toJSON } = render(<SkeletonLoader width={100} height={20} style={{ marginTop: 10 }} />);

    const tree = toJSON() as any;
    const flatStyle = Array.isArray(tree.props.style)
      ? Object.assign({}, ...tree.props.style.filter(Boolean))
      : tree.props.style;

    expect(flatStyle.marginTop).toBe(10);
  });

  it('uses default borderRadius of 8', () => {
    const { toJSON } = render(<SkeletonLoader width={100} height={20} />);

    const tree = toJSON() as any;
    const flatStyle = Array.isArray(tree.props.style)
      ? Object.assign({}, ...tree.props.style.filter(Boolean))
      : tree.props.style;

    expect(flatStyle.borderRadius).toBe(8);
  });
});
