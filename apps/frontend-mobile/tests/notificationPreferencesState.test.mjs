import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(
  path.join('/tmp', 'mojara-frontend-mobile-test-dist/utils/notificationPreferencesState.js')
);

const { normalizeNotificationMarketSelection } = await import(moduleUrl.href);

test('normalizeNotificationMarketSelection keeps valid selection and filter', () => {
  assert.deepEqual(
    normalizeNotificationMarketSelection({
      availableMarketIds: ['market-1', 'market-2'],
      selectedMarketId: 'market-2',
      preferencesMarketFilter: 'market-1',
    }),
    {
      selectedMarketId: 'market-2',
      preferencesMarketFilter: 'market-1',
    }
  );
});

test('normalizeNotificationMarketSelection falls back to first available market', () => {
  assert.deepEqual(
    normalizeNotificationMarketSelection({
      availableMarketIds: ['market-2', 'market-3'],
      selectedMarketId: 'market-1',
      preferencesMarketFilter: 'all',
    }),
    {
      selectedMarketId: 'market-2',
      preferencesMarketFilter: 'all',
    }
  );
});

test('normalizeNotificationMarketSelection resets stale filter to all', () => {
  assert.deepEqual(
    normalizeNotificationMarketSelection({
      availableMarketIds: ['market-2'],
      selectedMarketId: 'market-2',
      preferencesMarketFilter: 'market-1',
    }),
    {
      selectedMarketId: 'market-2',
      preferencesMarketFilter: 'all',
    }
  );
});

test('normalizeNotificationMarketSelection clears selection when no markets remain', () => {
  assert.deepEqual(
    normalizeNotificationMarketSelection({
      availableMarketIds: [],
      selectedMarketId: 'market-1',
      preferencesMarketFilter: 'market-1',
    }),
    {
      selectedMarketId: null,
      preferencesMarketFilter: 'all',
    }
  );
});
