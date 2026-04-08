import unittest
from unittest.mock import patch

from app.routes.admin_prices import explain_admin_prices, list_admin_prices


class AdminPricesRoutesTest(unittest.TestCase):
    @patch("app.routes.admin_prices.get_admin_price_agreements")
    def test_list_admin_prices_passes_filters(self, mock_get_admin_price_agreements):
        mock_get_admin_price_agreements.return_value = []

        result = list_admin_prices(status="draft", market_id="market-1", jwt="jwt-token")

        self.assertEqual(result, [])
        mock_get_admin_price_agreements.assert_called_once_with(
            "jwt-token",
            status="draft",
            market_id="market-1",
        )

    @patch("app.routes.admin_prices.get_price_explain")
    def test_explain_admin_prices_passes_market_id(self, mock_get_price_explain):
        mock_get_price_explain.return_value = [{"market_id": "market-1", "size_band": "Small"}]

        result = explain_admin_prices(market_id="market-1", jwt="jwt-token")

        self.assertEqual(result[0]["size_band"], "Small")
        mock_get_price_explain.assert_called_once_with("jwt-token", "market-1")


if __name__ == "__main__":
    unittest.main()
