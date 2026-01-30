def test_order_response_contains_price_and_name(client, auth_headers):
    res = client.get(
        "/orders/me",
        headers=auth_headers,
    )

    assert res.status_code == 200

    orders = res.json()
    assert len(orders) > 0

    order = orders[0]
    assert "items" in order
    assert len(order["items"]) > 0

    item = order["items"][0]

    assert item["price"] is not None
    assert item["price"] > 0
    assert item["name"]
