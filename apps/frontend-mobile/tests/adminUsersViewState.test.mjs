import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const moduleUrl = pathToFileURL(
  path.join('/tmp', 'mojara-frontend-mobile-test-dist/utils/adminUsersViewState.js')
);

const {
  buildAdminUsersEmptyState,
  buildLinkedVendorBannerTitle,
  buildLinkedVendorSummary,
} = await import(moduleUrl.href);

test('buildLinkedVendorBannerTitle prefers vendor name when present', () => {
  assert.equal(
    buildLinkedVendorBannerTitle('vendor-1', 'Fresh Harvest'),
    'Exact vendor filter active: Fresh Harvest (vendor-1)'
  );
});

test('buildLinkedVendorBannerTitle falls back to vendor id', () => {
  assert.equal(
    buildLinkedVendorBannerTitle('vendor-1'),
    'Exact vendor filter active: vendor-1'
  );
});

test('buildLinkedVendorSummary handles singular without more pages', () => {
  assert.equal(buildLinkedVendorSummary(1, 2, false), 'Showing 1 linked user on page 2.');
});

test('buildLinkedVendorSummary handles plural with more pages', () => {
  assert.equal(
    buildLinkedVendorSummary(3, 1, true),
    'Showing 3 linked users on page 1 with more available.'
  );
});

test('buildAdminUsersEmptyState explains vendor-linked empty state with vendor name', () => {
  assert.deepEqual(
    buildAdminUsersEmptyState({
      vendorId: 'vendor-1',
      vendorName: 'Fresh Harvest',
      roleFilter: 'vendor',
    }),
    {
      title: 'No linked users',
      description: 'No vendor users are linked to Fresh Harvest.',
    }
  );
});

test('buildAdminUsersEmptyState falls back to generic search copy for unfiltered view', () => {
  assert.deepEqual(
    buildAdminUsersEmptyState({
      roleFilter: 'all',
    }),
    {
      title: 'No users found',
      description: 'Try a different search term.',
    }
  );
});
