from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    SUPABASE_JWT_SECRET: str
    FRONTEND_URL: str = "http://localhost:3000"
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str
    AWS_REGION: str = "us-east-2"
    S3_BUCKET_NAME: str
    SMTP_USER: str = ""      # Gmail address to send invites from
    SMTP_PASSWORD: str = ""  # Gmail App Password (not your login password)

    class Config:
        env_file = ".env"


settings = Settings()
