import { renderHook, act } from '@testing-library/react-native';

const mockCheckForUpdateAsync = jest.fn();
const mockFetchUpdateAsync = jest.fn();
const mockReloadAsync = jest.fn();

jest.mock('expo-updates', () => ({
  checkForUpdateAsync: (...args: unknown[]) => mockCheckForUpdateAsync(...args),
  fetchUpdateAsync: (...args: unknown[]) => mockFetchUpdateAsync(...args),
  reloadAsync: (...args: unknown[]) => mockReloadAsync(...args),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

import { useOTAUpdate } from '../../hooks/useOTAUpdate';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useOTAUpdate', () => {
  it('returns isChecking and isDownloading state', () => {
    const { result } = renderHook(() => useOTAUpdate());
    expect(result.current.isChecking).toBe(false);
    expect(result.current.isDownloading).toBe(false);
    expect(typeof result.current.checkForUpdate).toBe('function');
  });

  it('checkForUpdate calls Updates.checkForUpdateAsync', async () => {
    mockCheckForUpdateAsync.mockResolvedValue({ isAvailable: false });

    const { result } = renderHook(() => useOTAUpdate());

    await act(async () => {
      await result.current.checkForUpdate();
    });

    expect(mockCheckForUpdateAsync).toHaveBeenCalled();
  });

  it('downloads update when available', async () => {
    mockCheckForUpdateAsync.mockResolvedValue({ isAvailable: true });
    mockFetchUpdateAsync.mockResolvedValue({});

    const { result } = renderHook(() => useOTAUpdate());

    await act(async () => {
      await result.current.checkForUpdate();
    });

    expect(mockFetchUpdateAsync).toHaveBeenCalled();
  });

  it('does not download when no update available', async () => {
    mockCheckForUpdateAsync.mockResolvedValue({ isAvailable: false });

    const { result } = renderHook(() => useOTAUpdate());

    await act(async () => {
      await result.current.checkForUpdate();
    });

    expect(mockFetchUpdateAsync).not.toHaveBeenCalled();
  });

  it('handles check failure gracefully', async () => {
    mockCheckForUpdateAsync.mockRejectedValue(new Error('No internet'));

    const { result } = renderHook(() => useOTAUpdate());

    await act(async () => {
      await result.current.checkForUpdate();
    });

    expect(result.current.isChecking).toBe(false);
    expect(result.current.isDownloading).toBe(false);
  });
});
