from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MedAssist API"
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    log_level: str = "INFO"

    model_id: str = "google/medgemma-4b-it"
    model_runtime: str = "transformers"
    model_device: str = "auto"
    model_max_new_tokens: int = 600
    model_temperature: float = 0.2
    model_use_4bit: bool = True
    model_gguf_path: str = ""
    model_ctx_size: int = 4096
    model_threads: int = 6
    model_gpu_layers: int = 0

    model_offline_mode: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
