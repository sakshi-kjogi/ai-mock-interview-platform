from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1 import analytics, answers, auth, feedback, interviews, questions, resumes, violations
from app.core.rate_limit import limiter

app = FastAPI(title="AI Mock Interview Platform")

# Rate limiter — must be registered before routes.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/v1")
app.include_router(interviews.router, prefix="/api/v1")
app.include_router(questions.router,  prefix="/api/v1")
app.include_router(answers.router,    prefix="/api/v1")
app.include_router(feedback.router,   prefix="/api/v1")
app.include_router(analytics.router,  prefix="/api/v1")
app.include_router(resumes.router,    prefix="/api/v1")
app.include_router(violations.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok"}