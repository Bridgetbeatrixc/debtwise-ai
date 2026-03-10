from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    google_api_key: str
    database_url: str
    jwt_secret: str = "debtwise-dev-secret"

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
