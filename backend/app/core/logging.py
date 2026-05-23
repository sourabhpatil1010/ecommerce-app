import logging
import sys
from app.config import settings

def setup_logging() -> None:
    """Configures system-wide logging formats and handlers."""
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Silence excessive debug output from external libraries
    if not settings.DEBUG:
        logging.getLogger("uvicorn").setLevel(logging.INFO)
        logging.getLogger("sqlalchemy").setLevel(logging.WARNING)
