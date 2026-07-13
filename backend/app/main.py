from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from app.api.v1 import analytics, answers, auth, feedback, interviews, notifications, questions, resumes, violations
from app.core.config import settings
from app.core.rate_limit import limiter


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to every response."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"]  = "nosniff"
        response.headers["X-Frame-Options"]          = "DENY"
        response.headers["X-XSS-Protection"]         = "1; mode=block"
        response.headers["Referrer-Policy"]          = "strict-origin-when-cross-origin"
        # Allow microphone for the voice interview feature.
        response.headers["Permissions-Policy"]       = "geolocation=(), microphone=(self)"
        return response


app = FastAPI(
    title="AI Mock Interview Platform",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url=None,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers (add before CORS so headers are always present)
app.add_middleware(SecurityHeadersMiddleware)

# CORS — reads from ALLOWED_ORIGINS env var so no code change is
# needed when the production domain is added later.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,          prefix="/api/v1")
app.include_router(interviews.router,    prefix="/api/v1")
app.include_router(questions.router,     prefix="/api/v1")
app.include_router(answers.router,       prefix="/api/v1")
app.include_router(feedback.router,      prefix="/api/v1")
app.include_router(analytics.router,     prefix="/api/v1")
app.include_router(resumes.router,       prefix="/api/v1")
app.include_router(violations.router,    prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
