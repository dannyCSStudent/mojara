import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(
  path.join('/tmp', 'mojara-frontend-mobile-test-dist/utils/onboardingSubscriptions.js')
);

const { getMissingMarketSubscriptions } = await import(moduleUrl.href);

test('getMissingMarketSubscriptions returns only unconfigured selected markets', () => {
  assert.deepEqual(
    getMissingMarketSubscriptions({
      selectedMarketIds: ['market-1', 'market-2', 'market-3'],
      existingMarketIds: ['market-2'],
    }),
    ['market-1', 'market-3']
  );
});

test('getMissingMarketSubscriptions deduplicates repeated selections', () => {
  assert.deepEqual(
    getMissingMarketSubscriptions({
      selectedMarketIds: ['market-1', 'market-1', 'market-2'],
      existingMarketIds: [],
    }),
    ['market-1', 'market-2']
  );
});

test('getMissingMarketSubscriptions returns empty when everything already exists', () => {
  assert.deepEqual(
    getMissingMarketSubscriptions({
      selectedMarketIds: ['market-1', 'market-2'],
      existingMarketIds: ['market-1', 'market-2'],
    }),
    []
  );
});
