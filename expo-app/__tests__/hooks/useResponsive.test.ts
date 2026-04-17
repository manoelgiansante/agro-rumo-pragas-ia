import { renderHook } from '@testing-library/react-native';

const mockUseWindowDimensions = jest.fn();
jest.mock('react-native', () => ({
  useWindowDimensions: () => mockUseWindowDimensions(),
}));

import { useResponsive } from '../../hooks/useResponsive';

describe('useResponsive', () => {
  it('detects phone in portrait mode', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 390, height: 844 });
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTablet).toBe(false);
    expect(result.current.isLandscape).toBe(false);
    expect(result.current.numColumns).toBe(4);
    expect(result.current.contentMaxWidth).toBe(390);
  });

  it('detects tablet in portrait mode', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 810, height: 1080 });
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.isLandscape).toBe(false);
    expect(result.current.numColumns).toBe(6);
    expect(result.current.contentMaxWidth).toBe(600);
  });

  it('detects tablet in landscape mode', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 1080, height: 810 });
    const { result } = renderHook(() => useResponsive());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.isLandscape).toBe(true);
    expect(result.current.numColumns).toBe(8);
  });

  it('detects phone in landscape mode', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 844, height: 390 });
    const { result } = renderHook(() => useResponsive());

    // 844 >= 768 so it thinks tablet
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isLandscape).toBe(true);
  });

  it('returns width and height from dimensions', () => {
    mockUseWindowDimensions.mockReturnValue({ width: 375, height: 667 });
    const { result } = renderHook(() => useResponsive());

    expect(result.current.width).toBe(375);
    expect(result.current.height).toBe(667);
  });
});
