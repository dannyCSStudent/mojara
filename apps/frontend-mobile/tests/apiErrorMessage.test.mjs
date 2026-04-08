import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(
  path.join('/tmp', 'mojara-frontend-mobile-test-dist/utils/apiErrorMessage.js')
);

const { getApiErrorMessage } = await import(moduleUrl.href);

test('getApiErrorMessage returns string detail directly', () => {
  assert.equal(getApiErrorMessage({ detail: 'User not found' }), 'User not found');
});

test('getApiErrorMessage unwraps nested detail objects', () => {
  assert.equal(
    getApiErrorMessage({
      detail: {
        errors: ['Missing permissions', 'Admin access required'],
      },
    }),
    'Missing permissions; Admin access required'
  );
});

test('getApiErrorMessage joins validation-style detail arrays', () => {
  assert.equal(
    getApiErrorMessage({
      detail: [
        { msg: 'Field required' },
        { msg: 'Input should be a valid UUID' },
      ],
    }),
    'Field required; Input should be a valid UUID'
  );
});

test('getApiErrorMessage falls back when nothing readable exists', () => {
  assert.equal(getApiErrorMessage(null, 'API request failed'), 'API request failed');
});
