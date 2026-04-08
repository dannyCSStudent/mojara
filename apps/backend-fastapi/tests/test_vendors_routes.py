import unittest
from unittest.mock import patch
from uuid import UUID

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.core.dependencies import get_current_user
from app.routes.markets import create_vendor_for_market
from app.routes.vendors import create_vendor_route, router as vendors_router
from app.schemas.vendors import VendorCreate


class VendorRoutesTest(unittest.TestCase):
    def test_get_my_vendor_route_is_not_shadowed_by_vendor_id_route(self):
        app = FastAPI()
        app.include_router(vendors_router)
        app.dependency_overrides[get_current_user] = lambda: {
            "_jwt": "token",
            "id": "user-1",
            "vendor_id": "vendor-1",
        }

        client = TestClient(app)
        response = client.get("/vendors/me")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"vendor_id": "vendor-1"})

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
