import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

const navigationModuleUrl = pathToFileURL(
  path.join('/tmp', 'mojara-frontend-mobile-test-dist/utils/adminNavigation.js')
);

const {
  buildAdminUserDetailRoute,
  buildAdminUsersRoute,
  buildAdminVendorLinkedUsersRoute,
  buildAdminVendorProductsRoute,
} = await import(navigationModuleUrl.href);

test('buildAdminUsersRoute preserves exact vendor filter params', () => {
  assert.deepEqual(
    buildAdminUsersRoute({
      vendorId: 'vendor-1',
      role: 'vendor',
    }),
    {
      pathname: '/(private)/(admin)/users',
      params: {
        vendorId: 'vendor-1',
        role: 'vendor',
      },
    }
  );
});

test('buildAdminVendorLinkedUsersRoute uses vendorId instead of search text', () => {
  assert.deepEqual(buildAdminVendorLinkedUsersRoute('vendor-2'), {
    pathname: '/(private)/(admin)/users',
    params: {
      vendorId: 'vendor-2',
      role: 'vendor',
    },
  });
});

test('buildAdminVendorProductsRoute preserves vendor and market context', () => {
  assert.deepEqual(
    buildAdminVendorProductsRoute({
      id: 'vendor-3',
      name: 'Fresh Harvest',
      market_id: 'market-1',
    }),
    {
      pathname: '/(private)/(admin)/vendors/[vendorId]',
      params: {
        marketId: 'market-1',
        vendorId: 'vendor-3',
        vendorName: 'Fresh Harvest',
      },
    }
  );
});

test('buildAdminUserDetailRoute preserves user id param', () => {
  assert.deepEqual(buildAdminUserDetailRoute('user-9'), {
    pathname: '/(private)/(admin)/users/[userId]',
    params: {
      userId: 'user-9',
    },
  });
});
