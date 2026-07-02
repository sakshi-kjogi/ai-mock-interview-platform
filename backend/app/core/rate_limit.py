from slowapi import Limiter
from slowapi.util import get_remote_address

# Single limiter instance imported by both main.py (to register the handler)
# and api/v1/auth.py (to decorate routes).
# Uses in-memory storage — sufficient for a single-worker deployment.
# Switch to Redis storage in production multi-worker environments.
limiter = Limiter(key_func=get_remote_address)