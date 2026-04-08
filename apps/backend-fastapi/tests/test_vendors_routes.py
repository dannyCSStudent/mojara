import unittest
from unittest.mock import patch
from uuid import UUID

from fastapi import HTTPException

from app.routes.markets import create_vendor_for_market
from app.routes.vendors import create_vendor_route
from app.schemas.vendors import VendorCreate


class VendorRoutesTest(unittest.TestCase):
    @patch("app.routes.vendors.create_vendor")
    def test_create_vendor_route_passes_jwt_first(self, mock_create_vendor):
        mock_create_vendor.return_value = {
            "id": "vendor-1",
            "name": "North Stall",
            "market_id": "00000000-0000-0000-0000-000000000001",
            "created_at": "2026-03-23T00:00:00Z",
        }

        payload = VendorCreate(
            name="North Stall",
            market_id="00000000-0000-0000-0000-000000000001",
        )

        result = create_vendor_route(
            payload=payload,
            current_user={"_jwt": "token"},
        )

        self.assertEqual(result["name"], "North Stall")
        mock_create_vendor.assert_called_once_with(
            "token",
            {
                "name": "North Stall",
                "market_id": UUID("00000000-0000-0000-0000-000000000001"),
            },
        )

    @patch("app.routes.markets.create_vendor")
    def test_create_vendor_for_market_builds_market_payload(self, mock_create_vendor):
        mock_create_vendor.return_value = {
            "id": "vendor-1",
            "name": "Fresh Fields",
            "market_id": "00000000-0000-0000-0000-000000000001",
            "created_at": "2026-03-23T00:00:00Z",
        }

        result = create_vendor_for_market(
            market_id=UUID("00000000-0000-0000-0000-000000000001"),
            payload=VendorCreate(
                name="Fresh Fields",
                market_id="00000000-0000-0000-0000-000000000001",
            ),
            jwt="token",
        )

        self.assertEqual(result["name"], "Fresh Fields")
        mock_create_vendor.assert_called_once_with(
            "token",
            {
                "market_id": "00000000-0000-0000-0000-000000000001",
                "name": "Fresh Fields",
            },
        )

    @patch("app.routes.vendors.create_vendor")
    def test_create_vendor_route_returns_403_when_repository_denies(self, mock_create_vendor):
        mock_create_vendor.return_value = None

        with self.assertRaises(HTTPException) as ctx:
            create_vendor_route(
                payload=VendorCreate(
                    name="North Stall",
                    market_id="00000000-0000-0000-0000-000000000001",
                ),
                current_user={"_jwt": "token"},
            )

        self.assertEqual(ctx.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
