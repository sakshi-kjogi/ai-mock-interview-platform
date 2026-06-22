from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str = "changeme"
    ENVIRONMENT: str = "development"

    @field_validator("DATABASE_URL")
    @classmethod
    def fix_postgres_scheme(cls, v: str) -> str:
        # Some providers hand out "postgres://" URLs, but SQLAlchemy
        # 1.4+/2.0 requires the "postgresql://" scheme. Normalize it
        # here so a copy-pasted connection string never breaks startup.
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        return v

    class Config:
        env_file = ".env"


settings = Settings()