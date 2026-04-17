import { renderHook, waitFor } from '@testing-library/react-native';

const mockAddNotificationReceivedListener = jest.fn();
const mockAddNotificationResponseReceivedListener = jest.fn();
const mockRemoveListener = { remove: jest.fn() };

jest.mock('expo-notifications', () => ({
  addNotificationReceivedListener: (...args: unknown[]) => {
    mockAddNotificationReceivedListener(...args);
    return mockRemoveListener;
  },
  addNotificationResponseReceivedListener: (...args: unknown[]) => {
    mockAddNotificationResponseReceivedListener(...args);
    return mockRemoveListener;
  },
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
}));

const mockRegisterForPushNotificationsAsync = jest.fn();
jest.mock('../../services/notifications', () => ({
  configureNotificationHandler: jest.fn(),
  registerForPushNotificationsAsync: (...args: unknown[]) =>
    mockRegisterForPushNotificationsAsync(...args),
}));

const mockGetUser = jest.fn();
const mockUpdateProfile = jest.fn();
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: (...args: unknown[]) => mockGetUser(...args),
    },
    from: jest.fn(() => ({
      update: (...args: unknown[]) => {
        mockUpdateProfile(...args);
        return { eq: jest.fn().mockResolvedValue({ error: null }) };
      },
    })),
  },
}));

import { useNotifications } from '../../hooks/useNotifications';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  mockRegisterForPushNotificationsAsync.mockResolvedValue(null);
});

describe('useNotifications', () => {
  it('returns initial state with null token and notification', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.expoPushToken).toBeNull();
    expect(result.current.notification).toBeNull();
    expect(typeof result.current.registerForNotifications).toBe('function');
  });

  it('registers notification listeners on mount', () => {
    renderHook(() => useNotifications());
    expect(mockAddNotificationReceivedListener).toHaveBeenCalled();
    expect(mockAddNotificationResponseReceivedListener).toHaveBeenCalled();
  });

  it('removes listeners on unmount', () => {
    const { unmount } = renderHook(() => useNotifications());
    unmount();
    expect(mockRemoveListener.remove).toHaveBeenCalled();
  });

  it('auto-registers when shouldRegister is true', async () => {
    mockRegisterForPushNotificationsAsync.mockResolvedValue('ExponentPushToken[xxx]');

    renderHook(() => useNotifications(true));

    await waitFor(() => {
      expect(mockRegisterForPushNotificationsAsync).toHaveBeenCalled();
    });
  });

  it('does not auto-register when shouldRegister is false', () => {
    renderHook(() => useNotifications(false));
    expect(mockRegisterForPushNotificationsAsync).not.toHaveBeenCalled();
  });

  it('syncs token to Supabase after registration', async () => {
    mockRegisterForPushNotificationsAsync.mockResolvedValue('ExponentPushToken[xxx]');

    renderHook(() => useNotifications(true));

    await waitFor(() => {
      expect(mockUpdateProfile).toHaveBeenCalledWith({ push_token: 'ExponentPushToken[xxx]' });
    });
  });
});
