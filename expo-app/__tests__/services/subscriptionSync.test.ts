/**
 * Tests for services/subscriptionSync.ts
 */

// --- Mocks ---
const mockGetCustomerInfo = jest.fn();
const mockAddCustomerInfoUpdateListener = jest.fn();

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    getCustomerInfo: (...args: unknown[]) => mockGetCustomerInfo(...args),
    addCustomerInfoUpdateListener: (...args: unknown[]) =>
      mockAddCustomerInfoUpdateListener(...args),
  },
}));

const mockUpdate = jest.fn();
const mockEq = jest.fn();

jest.mock('../../services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: (...args: unknown[]) => {
        mockUpdate(...args);
        return {
          eq: (...eqArgs: unknown[]) => {
            mockEq(...eqArgs);
            return Promise.resolve({ error: null });
          },
        };
      },
    })),
  },
}));

jest.mock('../../services/purchases', () => ({
  isRevenueCatConfigured: jest.fn().mockReturnValue(true),
}));

import {
  syncSubscriptionToSupabase,
  startSubscriptionListener,
  stopSubscriptionListener,
} from '../../services/subscriptionSync';

function makeCustomerInfo(
  activeEntitlements: Record<
    string,
    { willRenew: boolean; store: string; expirationDate?: string }
  > = {},
) {
  return {
    entitlements: { active: activeEntitlements },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  stopSubscriptionListener(); // reset listener state
});

describe('syncSubscriptionToSupabase', () => {
  it('syncs enterprise plan when enterprise entitlement is active', async () => {
    mockGetCustomerInfo.mockResolvedValueOnce(
      makeCustomerInfo({
        enterprise: { willRenew: true, store: 'APP_STORE', expirationDate: '2027-01-01T00:00:00Z' },
        pro: { willRenew: true, store: 'APP_STORE' },
      }),
    );

    await syncSubscriptionToSupabase('user-123');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'enterprise',
        status: 'active',
        provider: 'apple',
        current_period_end: '2027-01-01T00:00:00Z',
      }),
    );
    expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
  });

  it('syncs pro plan when only pro entitlement is active', async () => {
    mockGetCustomerInfo.mockResolvedValueOnce(
      makeCustomerInfo({
        pro: { willRenew: false, store: 'PLAY_STORE', expirationDate: '2026-12-01T00:00:00Z' },
      }),
    );

    await syncSubscriptionToSupabase('user-456');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'pro',
        status: 'canceled',
        provider: 'google',
      }),
    );
  });

  it('syncs free plan when no entitlements are active', async () => {
    mockGetCustomerInfo.mockResolvedValueOnce(makeCustomerInfo({}));

    await syncSubscriptionToSupabase('user-789');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        plan: 'free',
        status: 'active',
        provider: 'free',
      }),
    );
  });

  it('handles getCustomerInfo failure gracefully', async () => {
    mockGetCustomerInfo.mockRejectedValueOnce(new Error('RC error'));

    await expect(syncSubscriptionToSupabase('user-err')).resolves.not.toThrow();
  });

  it('skips sync when RevenueCat is not configured', async () => {
     
    const { isRevenueCatConfigured } = require('../../services/purchases');
    (isRevenueCatConfigured as jest.Mock).mockReturnValueOnce(false);

    await syncSubscriptionToSupabase('user-skip');

    expect(mockGetCustomerInfo).not.toHaveBeenCalled();
  });
});

describe('startSubscriptionListener', () => {
  it('registers a customer info update listener', () => {
    startSubscriptionListener('user-123');

    expect(mockAddCustomerInfoUpdateListener).toHaveBeenCalledTimes(1);
    expect(typeof mockAddCustomerInfoUpdateListener.mock.calls[0][0]).toBe('function');
  });

  it('does not register multiple listeners', () => {
    startSubscriptionListener('user-123');
    startSubscriptionListener('user-123');

    expect(mockAddCustomerInfoUpdateListener).toHaveBeenCalledTimes(1);
  });
});

describe('stopSubscriptionListener', () => {
  it('allows re-registration after stop', () => {
    startSubscriptionListener('user-1');
    stopSubscriptionListener();
    startSubscriptionListener('user-2');

    expect(mockAddCustomerInfoUpdateListener).toHaveBeenCalledTimes(2);
  });
});
