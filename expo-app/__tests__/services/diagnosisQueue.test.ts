import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  addToQueue,
  getQueue,
  removeFromQueue,
  getQueueCount,
  clearQueue,
  incrementRetry,
} from '../../services/diagnosisQueue';

// --- Mocks ---
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const QUEUE_KEY = '@rumo_pragas_diagnosis_queue';

function makePendingDiagnosis(overrides: Record<string, unknown> = {}) {
  return {
    id: '123abc',
    imageBase64: 'base64data',
    cropType: 'soja',
    latitude: -23.5,
    longitude: -46.6,
    createdAt: '2026-03-20T10:00:00.000Z',
    retryCount: 0,
    ...overrides,
  };
}

// --- Tests ---
describe('diagnosisQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
  });

  describe('getQueue', () => {
    it('returns empty array when no items stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const queue = await getQueue();
      expect(queue).toEqual([]);
    });

    it('returns stored items', async () => {
      const items = [makePendingDiagnosis()];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(items));

      const queue = await getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0]).toMatchObject({ cropType: 'soja' });
    });

    it('returns empty array on parse error', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce('invalid json{{{');

      const queue = await getQueue();
      expect(queue).toEqual([]);
    });
  });

  describe('addToQueue', () => {
    it('adds item to AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      await addToQueue({
        imageBase64: 'img',
        cropType: 'milho',
        latitude: null,
        longitude: null,
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(QUEUE_KEY, expect.any(String));

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData).toHaveLength(1);
      expect(savedData[0]).toMatchObject({
        cropType: 'milho',
        retryCount: 0,
      });
      expect(savedData[0].id).toBeDefined();
      expect(savedData[0].createdAt).toBeDefined();
    });
  });

  describe('removeFromQueue', () => {
    it('removes specific item by id', async () => {
      const items = [makePendingDiagnosis({ id: 'a' }), makePendingDiagnosis({ id: 'b' })];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(items));

      await removeFromQueue('a');

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      expect(savedData).toHaveLength(1);
      expect(savedData[0].id).toBe('b');
    });
  });

  describe('getQueueCount', () => {
    it('returns correct count', async () => {
      const items = [
        makePendingDiagnosis({ id: '1' }),
        makePendingDiagnosis({ id: '2' }),
        makePendingDiagnosis({ id: '3' }),
      ];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(items));

      const count = await getQueueCount();
      expect(count).toBe(3);
    });

    it('returns 0 for empty queue', async () => {
      mockAsyncStorage.getItem.mockResolvedValueOnce(null);

      const count = await getQueueCount();
      expect(count).toBe(0);
    });
  });

  describe('clearQueue', () => {
    it('removes the queue key from storage', async () => {
      await clearQueue();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(QUEUE_KEY);
    });
  });

  describe('incrementRetry', () => {
    it('increases retry count for the given item', async () => {
      const items = [
        makePendingDiagnosis({ id: 'x', retryCount: 2 }),
        makePendingDiagnosis({ id: 'y', retryCount: 0 }),
      ];
      mockAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(items));

      await incrementRetry('x');

      const savedData = JSON.parse(mockAsyncStorage.setItem.mock.calls[0][1] as string);
      const updated = savedData.find((d: { id: string }) => d.id === 'x');
      expect(updated.retryCount).toBe(3);

      const untouched = savedData.find((d: { id: string }) => d.id === 'y');
      expect(untouched.retryCount).toBe(0);
    });
  });
});
