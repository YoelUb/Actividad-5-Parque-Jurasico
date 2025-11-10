import os
import random
import string
from pydantic_settings import BaseSettings
from fastapi_mail import ConnectionConfig, FastMail

from dotenv import load_dotenv

load_dotenv()


class EmailSettings(BaseSettings):
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "default_user")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "default_pass")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "default@example.com")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", 587))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.example.com")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "Jurassic Park")
    MAIL_STARTTLS: bool = os.getenv("MAIL_STARTTLS", "True").lower() == "true"
    MAIL_SSL_TLS: bool = os.getenv("MAIL_SSL_TLS", "False").lower() == "true"
    USE_CREDENTIALS: bool = os.getenv("USE_CREDENTIALS", "True").lower() == "true"
    VALIDATE_CERTS: bool = os.getenv("VALIDATE_CERTS", "True").lower() == "true"

    class Config:
        extra = 'ignore'


settings = EmailSettings()

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=settings.VALIDATE_CERTS,
    TEMPLATE_FOLDER='./src/parque_jurasico/templates/email'
)

fm = FastMail(conf)


def generate_verification_code(length: int = 6) -> str:
    """Genera un código de verificación numérico simple."""
    return "".join(random.choices(string.digits, k=length))


def create_jurassic_park_email_template(code: str, nombre_usuario: str) -> str:
    """
    Genera un HTML simple pero temático para el correo de bienvenida.
    """
    return f"""
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Cuenta - Jurassic Park</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }}
            .container {{
                width: 90%;
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                border: 1px solid #ddd;
                border-radius: 8px;
                overflow: hidden;
            }}
            .header {{
                background-color: #c0392b; /* Rojo oscuro temático */
                color: #ffffff;
                padding: 20px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .content {{
                padding: 30px;
            }}
            .content p {{
                font-size: 16px;
                color: #333;
            }}
            .code-box {{
                background-color: #eeeeee;
                border: 1px dashed #ccc;
                padding: 20px;
                text-align: center;
                margin: 20px 0;
            }}
            .code {{
                font-size: 32px;
                font-weight: bold;
                color: #c0392b;
                letter-spacing: 4px;
            }}
            .footer {{
                background-color: #333;
                color: #aaa;
                padding: 20px;
                text-align: center;
                font-size: 12px;
            }}
            .footer p {{
                margin: 5px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>¡Bienvenido a Jurassic Park!</h1>
            </div>
            <div class="content">
                <p>Hola, {nombre_usuario},</p>
                <p>Estás a un paso de completar tu registro. Por favor, usa el siguiente código de verificación para activar tu cuenta. El código expirará en 20 minutos.</p>

                <div class="code-box">
                    <p style="margin-bottom: 10px;">Tu código de verificación es:</p>
                    <div class="code">{code}</div>
                </div>

                <p>Si no intentaste registrarte en nuestra web, por favor ignora este correo.</p>
                <p>¡Esperamos verte pronto en la isla!</p>
                <p><strong>— El Equipo de InGen</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2024 InGen Corporation. Todos los derechos reservados.</p>
                <p>Isla Nublar</p>
            </div>
        </div>
    </body>
    </html>
    """