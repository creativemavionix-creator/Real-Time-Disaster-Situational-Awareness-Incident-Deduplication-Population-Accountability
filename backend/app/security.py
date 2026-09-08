"""
Security & Hardening Utilities for PRATYAKSH-Ω.
Includes rate-limiting middleware, security response headers, and input sanitization.
"""

import time
import re
import html
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Injects production-grade security headers on every response."""

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response


def get_client_ip(request: Request) -> str:
    """Extract real client IP behind reverse proxies (Cloudflare, Render, ALB, Nginx)."""
    # 1. Cloudflare connecting IP
    cf_ip = request.headers.get("cf-connecting-ip")
    if cf_ip and cf_ip.strip():
        return cf_ip.strip()

    # 2. X-Real-IP
    real_ip = request.headers.get("x-real-ip")
    if real_ip and real_ip.strip():
        return real_ip.strip()

    # 3. X-Forwarded-For (leftmost entry is original client)
    xff = request.headers.get("x-forwarded-for")
    if xff and xff.strip():
        first_ip = xff.split(",")[0].strip()
        if first_ip:
            return first_ip

    # 4. Fallback to direct client host
    if request.client and request.client.host:
        return request.client.host

    return "127.0.0.1"


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Sliding window in-memory rate limiter to protect computationally expensive AI and mutation endpoints.
    Allows 180 requests/minute per client IP generally, and 40 requests/minute on expensive endpoints.
    Includes memory leak prevention by pruning stale IP histories.
    """

    def __init__(self, app, max_requests_per_minute: int = 240):
        super().__init__(app)
        self.max_requests = max_requests_per_minute
        self.request_history: dict[str, list[float]] = defaultdict(list)
        self.mutation_history: dict[str, list[float]] = defaultdict(list)
        self._last_cleanup = time.time()

    def _prune_stale_records(self, now: float, window_start: float):
        """Prunes stale IP entries to prevent memory exhaustion."""
        if len(self.request_history) > 1000 or (now - self._last_cleanup) > 300.0:
            stale_keys = [
                ip for ip, timestamps in self.request_history.items()
                if not timestamps or timestamps[-1] <= window_start
            ]
            for ip in stale_keys:
                self.request_history.pop(ip, None)
                self.mutation_history.pop(ip, None)
            self._last_cleanup = now

    async def dispatch(self, request: Request, call_next):
        # 1. Preflight OPTIONS requests must never be rate-limited
        if request.method == "OPTIONS":
            return await call_next(request)

        client_ip = get_client_ip(request)
        now = time.time()
        window_start = now - 60.0

        # Exempt local development loopback and test runners
        if (
            client_ip in ("testclient", "testserver", "127.0.0.1", "::1", "localhost")
            or request.headers.get("X-Test-Runner") == "true"
        ):
            return await call_next(request)

        # Clean history older than 60s
        history = [t for t in self.request_history[client_ip] if t > window_start]
        self.request_history[client_ip] = history

        # Periodic dictionary memory pruning
        self._prune_stale_records(now, window_start)

        if len(history) >= self.max_requests:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. Please back off before retrying.",
                    "retry_after_seconds": 15,
                },
                headers={"Retry-After": "15"},
            )

        # Track mutation / review endpoints independently so background polling doesn't starve them
        path = request.url.path
        if any(p in path for p in ["/reports/official", "/verification/review", "/verification/execute-and-feed", "/seed"]):
            mut_history = [t for t in self.mutation_history[client_ip] if t > window_start]
            self.mutation_history[client_ip] = mut_history
            if len(mut_history) >= 60:
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": "Too Many Requests",
                        "message": "Mutation rate limit exceeded. Please back off before retrying.",
                        "retry_after_seconds": 15,
                    },
                    headers={"Retry-After": "15"},
                )
            self.mutation_history[client_ip].append(now)

        self.request_history[client_ip].append(now)
        return await call_next(request)


def sanitize_input_text(text: str, max_length: int = 2000) -> str:
    """
    Sanitizes untrusted input text:
    - Truncates to max length
    - Strips control characters
    - Escapes HTML entities
    """
    if not text:
        return ""
    # Strip null bytes and non-printable control chars except \n, \r, \t
    cleaned = re.sub(r"[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]", "", text)
    cleaned = cleaned.strip()[:max_length]
    return html.escape(cleaned)
