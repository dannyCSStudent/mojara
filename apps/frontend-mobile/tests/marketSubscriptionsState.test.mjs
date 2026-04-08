import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(
  path.join('/tmp', 'mojara-frontend-mobile-test-dist/utils/marketSubscriptionsState.js')
);

const { applyMarketSubscriptionToggle } = await import(moduleUrl.href);

test('applyMarketSubscriptionToggle selects the first remaining market when removing the active one', () => {
  assert.deepEqual(
    applyMarketSubscriptionToggle({
      subscriptions: ['market-1', 'market-2'],
      activeMarketId: 'market-1',
      marketId: 'market-1',
    }),
    {
      subscriptions: ['market-2'],
      activeMarketId: 'market-2',
      isSubscribed: true,
    }
  );
});

test('applyMarketSubscriptionToggle keeps the active market when removing a different market', () => {
  assert.deepEqual(
    applyMarketSubscriptionToggle({
      subscriptions: ['market-1', 'market-2'],
      activeMarketId: 'market-1',
      marketId: 'market-2',
    }),
    {
      subscriptions: ['market-1'],
      activeMarketId: 'market-1',
      isSubscribed: true,
    }
  );
});

test('applyMarketSubscriptionToggle activates a newly added market when none is active', () => {
  assert.deepEqual(
    applyMarketSubscriptionToggle({
      subscriptions: [],
      activeMarketId: null,
      marketId: 'market-3',
    }),
    {
      subscriptions: ['market-3'],
      activeMarketId: 'market-3',
      isSubscribed: false,
    }
  );
});
