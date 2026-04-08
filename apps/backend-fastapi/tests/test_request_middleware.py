import unittest
from asyncio import run

from fastapi import Request, Response

import main


class RequestMiddlewareTest(unittest.TestCase):
    def _build_request(self, headers: list[tuple[bytes, bytes]] | None = None) -> Request:
        async def receive():
            return {"type": "http.request", "body": b"", "more_body": False}

        return Request(
            {
                "type": "http",
                "http_version": "1.1",
                "method": "GET",
                "scheme": "http",
                "path": "/health",
                "raw_path": b"/health",
                "query_string": b"",
                "headers": headers or [],
                "client": ("testclient", 50000),
                "server": ("testserver", 80),
                "root_path": "",
            },
            receive=receive,
        )

    def test_health_sets_request_id_header(self):
        request = self._build_request()

        async def call_next(_: Request) -> Response:
            return Response(status_code=200)

        response = run(main.request_context_middleware(request, call_next))

        self.assertEqual(response.status_code, 200)
        self.assertIn("X-Request-ID", response.headers)
        self.assertTrue(response.headers["X-Request-ID"])

    def test_health_preserves_incoming_request_id(self):
        request = self._build_request(headers=[(b"x-request-id", b"req-123")])

        async def call_next(_: Request) -> Response:
            return Response(status_code=200)

        response = run(main.request_context_middleware(request, call_next))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["X-Request-ID"], "req-123")


if __name__ == "__main__":
    unittest.main()
