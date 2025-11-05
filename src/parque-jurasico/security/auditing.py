import logging
from datetime import datetime

LOG_FILE = "admin_actions.log"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def log_admin_action(admin_username: str, action: str):
    logger.info(f"ADMIN ACTION by '{admin_username}': {action}")

def get_audit_logs() -> str:
    try:
        with open(LOG_FILE, "r") as f:
            return f.read()
    except FileNotFoundError:
        return "No hay logs de auditoría todavía."