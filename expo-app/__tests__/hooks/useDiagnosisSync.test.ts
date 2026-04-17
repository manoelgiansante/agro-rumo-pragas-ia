/**
 * Tests for hooks/useDiagnosisSync.ts
 */
import { renderHook, waitFor } from '@testing-library/react-native';

// Mock useNetworkStatus
const mockNetworkStatus = { isConnected: false, isInternetReachable: true, connectionType: 'wifi' };
jest.mock('../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => mockNetworkStatus,
}));

// Mock useAuthContext
const mockSession = { access_token: 'test-token' };
jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => ({
    session: mockSession,
    isAuthenticated: true,
    loading: false,
  }),
}));

// Mock diagnosis service
const mockSendDiagnosis = jest.fn();
jest.mock('../../services/diagnosis', () => ({
  sendDiagnosis: (...args: unknown[]) => mockSendDiagnosis(...args),
}));

// Mock diagnosisQueue
const mockGetQueue = jest.fn().mockResolvedValue([]);
const mockRemoveFromQueue = jest.fn().mockResolvedValue(undefined);
const mockIncrementRetry = jest.fn().mockResolvedValue(undefined);
const mockGetQueueCount = jest.fn().mockResolvedValue(0);
const mockReadQueuedImageBase64 = jest.fn().mockResolvedValue('base64data');

jest.mock('../../services/diagnosisQueue', () => ({
  getQueue: (...args: unknown[]) => mockGetQueue(...args),
  removeFromQueue: (...args: unknown[]) => mockRemoveFromQueue(...args),
  incrementRetry: (...args: unknown[]) => mockIncrementRetry(...args),
  getQueueCount: (...args: unknown[]) => mockGetQueueCount(...args),
  readQueuedImageBase64: (...args: unknown[]) => mockReadQueuedImageBase64(...args),
}));

// Mock AsyncStorage for DLQ persistence
const mockAsyncStorageGet = jest.fn().mockResolvedValue(null);
const mockAsyncStorageSet = jest.fn().mockResolvedValue(undefined);
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: (...args: unknown[]) => mockAsyncStorageGet(...args),
    setItem: (...args: unknown[]) => mockAsyncStorageSet(...args),
  },
}));

// Mock Sentry
const mockSentryCapture = jest.fn();
jest.mock('@sentry/react-native', () => ({
  captureException: (...args: unknown[]) => mockSentryCapture(...args),
}));

import { useDiagnosisSync, calculateBackoff } from '../../hooks/useDiagnosisSync';

beforeEach(() => {
  jest.clearAllMocks();
  mockNetworkStatus.isConnected = false;
  mockSession.access_token = 'test-token';
  mockGetQueue.mockResolvedValue([]);
  mockGetQueueCount.mockResolvedValue(0);
  mockReadQueuedImageBase64.mockResolvedValue('base64data');
  mockAsyncStorageGet.mockResolvedValue(null);
  mockAsyncStorageSet.mockResolvedValue(undefined);
});

describe('useDiagnosisSync', () => {
  it('returns pendingCount, isSyncing, and refreshCount', () => {
    const { result } = renderHook(() => useDiagnosisSync());
    expect(result.current).toHaveProperty('pendingCount');
    expect(result.current).toHaveProperty('isSyncing');
    expect(result.current).toHaveProperty('refreshCount');
  });

  it('reports initial pendingCount from getQueueCount', async () => {
    mockGetQueueCount.mockResolvedValue(3);
    const { result } = renderHook(() => useDiagnosisSync());

    await waitFor(() => {
      expect(result.current.pendingCount).toBe(3);
    });
  });

  it('syncs queued items when network becomes available', async () => {
    const queueItem = {
      id: 'q1',
      imageUri: '/mock/documents/diagnosis-queue/q1.jpg',
      cropType: 'soy',
      latitude: -23.0,
      longitude: -49.0,
      retryCount: 0,
    };

    mockGetQueue.mockResolvedValue([queueItem]);
    mockGetQueueCount.mockResolvedValue(1);
    mockReadQueuedImageBase64.mockResolvedValue('base64data');
    mockSendDiagnosis.mockResolvedValue({ id: 'diag-1' });

    mockNetworkStatus.isConnected = true;

    renderHook(() => useDiagnosisSync());

    await waitFor(() => {
      expect(mockReadQueuedImageBase64).toHaveBeenCalledWith(
        '/mock/documents/diagnosis-queue/q1.jpg',
      );
    });

    await waitFor(() => {
      expect(mockSendDiagnosis).toHaveBeenCalledWith(
        'base64data',
        'soy',
        -23.0,
        -49.0,
        'test-token',
      );
    });

    await waitFor(() => {
      expect(mockRemoveFromQueue).toHaveBeenCalledWith('q1');
    });
  });

  it('increments retry count on sync failure', async () => {
    const queueItem = {
      id: 'q2',
      imageUri: '/mock/documents/diagnosis-queue/q2.jpg',
      cropType: 'corn',
      latitude: -22.0,
      longitude: -48.0,
      retryCount: 0,
    };

    mockGetQueue.mockResolvedValue([queueItem]);
    mockGetQueueCount.mockResolvedValue(1);
    mockSendDiagnosis.mockRejectedValue(new Error('Network fail'));

    mockNetworkStatus.isConnected = true;

    renderHook(() => useDiagnosisSync());

    await waitFor(() => {
      expect(mockIncrementRetry).toHaveBeenCalledWith('q2');
    });
  });

  it('moves item to DLQ (and removes from queue) after MAX_RETRIES (3) failures', async () => {
    const queueItem = {
      id: 'q3',
      imageUri: '/mock/documents/diagnosis-queue/q3.jpg',
      cropType: 'wheat',
      latitude: -21.0,
      longitude: -47.0,
      retryCount: 2,
    };

    mockGetQueue.mockResolvedValue([queueItem]);
    mockGetQueueCount.mockResolvedValue(1);
    mockSendDiagnosis.mockRejectedValue(new Error('Fail'));

    mockNetworkStatus.isConnected = true;

    renderHook(() => useDiagnosisSync());

    // retryCount=2 triggers backoff (~2s+jitter) before the send attempt, so allow up to 6s.
    await waitFor(
      () => {
        expect(mockRemoveFromQueue).toHaveBeenCalledWith('q3');
      },
      { timeout: 6000 },
    );
    expect(mockIncrementRetry).not.toHaveBeenCalled();

    // DLQ persisted to AsyncStorage with an entry bearing the item id
    expect(mockAsyncStorageSet).toHaveBeenCalled();
    const dlqWriteCall = mockAsyncStorageSet.mock.calls.find(
      (c) => c[0] === '@rumo_pragas_diagnosis_dlq',
    );
    expect(dlqWriteCall).toBeDefined();
    const written = JSON.parse(dlqWriteCall![1]);
    expect(Array.isArray(written)).toBe(true);
    expect(written[0]).toMatchObject({
      id: 'q3',
      lastError: 'Fail',
    });
    expect(written[0].movedToDLQAt).toEqual(expect.any(String));

    // Sentry captured the DLQ event with itemId extras
    expect(mockSentryCapture).toHaveBeenCalled();
    const sentryCall = mockSentryCapture.mock.calls[0];
    expect(sentryCall[0]).toBeInstanceOf(Error);
    expect((sentryCall[0] as Error).message).toBe('Diagnosis sync DLQ');
    expect(sentryCall[1]).toMatchObject({ extra: expect.objectContaining({ itemId: 'q3' }) });
  }, 10000);

  it('exposes calculateBackoff with exponential growth + jitter + ceiling', () => {
    // retryCount=1 -> base=1000, +jitter up to 1000
    const b1 = calculateBackoff(1);
    expect(b1).toBeGreaterThanOrEqual(1000);
    expect(b1).toBeLessThan(2000);

    // retryCount=2 -> base=2000
    const b2 = calculateBackoff(2);
    expect(b2).toBeGreaterThanOrEqual(2000);
    expect(b2).toBeLessThan(3000);

    // retryCount=3 -> base=4000
    const b3 = calculateBackoff(3);
    expect(b3).toBeGreaterThanOrEqual(4000);
    expect(b3).toBeLessThan(5000);

    // retryCount>=5 -> capped at 16000 + jitter
    const bCap = calculateBackoff(10);
    expect(bCap).toBeGreaterThanOrEqual(16000);
    expect(bCap).toBeLessThan(17000);
  });

  it('does not sync when there is no session', async () => {
    mockNetworkStatus.isConnected = true;
    mockSession.access_token = '' as any;

    mockGetQueue.mockResolvedValue([
      {
        id: 'q4',
        imageUri: '/mock/path.jpg',
        cropType: 'c',
        latitude: 0,
        longitude: 0,
        retryCount: 0,
      },
    ]);

    renderHook(() => useDiagnosisSync());

    await new Promise((r) => setTimeout(r, 100));
    expect(mockSendDiagnosis).not.toHaveBeenCalled();
  });

  it('does not sync when offline', async () => {
    mockNetworkStatus.isConnected = false;

    mockGetQueue.mockResolvedValue([
      {
        id: 'q5',
        imageUri: '/mock/path.jpg',
        cropType: 'c',
        latitude: 0,
        longitude: 0,
        retryCount: 0,
      },
    ]);

    renderHook(() => useDiagnosisSync());

    await new Promise((r) => setTimeout(r, 100));
    expect(mockSendDiagnosis).not.toHaveBeenCalled();
  });
});
