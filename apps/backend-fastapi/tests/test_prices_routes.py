import unittest
from unittest.mock import patch

from app.routes.prices import read_active_prices


class PricesRoutesTest(unittest.TestCase):
    @patch("app.routes.prices.get_active_price_agreements")
    def test_read_active_prices_does_not_require_jwt(self, mock_get_active_price_agreements):
        mock_get_active_price_agreements.return_value = [
            {
                "market_id": "market-1",
                "size_band_id": "small",
                "reference_price": 12.5,
                "confidence_score": 0.8,
                "sample_count": 4,
                "valid_from": "2026-04-08T00:00:00Z",
                "valid_until": "2026-04-08T03:00:00Z",
            }
        ]

        result = read_active_prices()

        self.assertEqual(result[0]["market_id"], "market-1")
        mock_get_active_price_agreements.assert_called_once_with()


if __name__ == "__main__":
    unittest.main()
