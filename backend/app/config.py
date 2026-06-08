from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from typing import Literal
from urllib.parse import quote


class Settings(BaseSettings):
    """Application settings loaded from environment variables with validation"""
    
    # Database configuration with field validators
    DB_HOST: str = Field(..., min_length=1, description="Database host")
    DB_PORT: int = Field(default=5432, ge=1, le=65535, description="Database port")
    DB_USER: str = Field(..., min_length=1, description="Database user")
    DB_PASSWORD: str = Field(..., min_length=1, description="Database password")
    DB_NAME: str = Field(..., min_length=1, description="Database name")
    
    # CORS configuration
    CORS_ORIGINS: str = Field(default="http://localhost:3000", description="Comma-separated CORS origins")
    
    # FastAPI configuration
    ENVIRONMENT: Literal["development", "production"] = Field(default="development")
    DEBUG: bool = Field(default=True)
    
    @field_validator('DB_PORT')
    @classmethod
    def validate_port(cls, v):
        """Validate that port is in valid range"""
        if not 1 <= v <= 65535:
            raise ValueError('Port must be between 1 and 65535')
        return v
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct async PostgreSQL connection string with URL-encoded credentials"""
        encoded_user = quote(self.DB_USER, safe='')
        encoded_password = quote(self.DB_PASSWORD, safe='')
        return f"postgresql+asyncpg://{encoded_user}:{encoded_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    @property
    def cors_origins_list(self) -> list:
        """Parse CORS_ORIGINS from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(',') if origin.strip()]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
