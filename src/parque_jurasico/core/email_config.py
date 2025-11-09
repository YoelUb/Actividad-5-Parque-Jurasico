import os
import random
import string
from pydantic_settings import BaseSettings
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

class EmailSettings(BaseSettings):
    """
    Carga la configuración de email desde el archivo .env
    """
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    # --------------------

    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = EmailSettings()

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

fm = FastMail(conf)


def generate_verification_code(length: int = 6) -> str:
    """Genera un código numérico aleatorio de 6 dígitos."""
    return "".join(random.choices(string.digits, k=length))


def create_jurassic_park_email_template(code: str, nombre: str) -> str:
    """
    Crea la plantilla HTML temática de Jurassic Park.
    """
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación de Cuenta - Jurassic Park</title>
        <style>
            body {{
                font-family: 'Arial', sans-serif;
                background-color: #1a1a1a;
                color: #e0e0e0;
                margin: 0;
                padding: 0;
            }}
            .container {{
                width: 90%;
                max-width: 600px;
                margin: 20px auto;
                background-color: #2a2a2a;
                border: 2px solid #ff4136; /* Rojo JP */
                border-radius: 8px;
                overflow: hidden;
            }}
            .header {{
                background-color: #111;
                padding: 20px;
                text-align: center;
                border-bottom: 2px solid #ff4136;
            }}
            .header h1 {{
                color: #ff4136;
                margin: 0;
                font-size: 28px;
            }}
            .content {{
                padding: 30px;
                line-height: 1.6;
            }}
            .content p {{
                font-size: 16px;
            }}
            .code-box {{
                background-color: #1a1a1a;
                border: 1px dashed #e0a000; /* Ámbar JP */
                color: #ffffff;
                font-size: 36px;
                font-weight: bold;
                text-align: center;
                padding: 20px;
                border-radius: 5px;
                letter-spacing: 5px;
                margin: 25px 0;
            }}
            .footer {{
                background-color: #111;
                color: #888;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                border-top: 1px solid #444;
            }}
            .footer p {{
                margin: 5px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>JURASSIC PARK</h1>
            </div>
            <div class="content">
                <p>Hola, {nombre},</p>
                <p>¡Bienvenido a Jurassic Park! Para activar tu cuenta de visitante de InGen, por favor usa el siguiente código de verificación. No hemos reparado en gastos.</p>

                <div class="code-box">
                    {code}
                </div>

                <p>Este código de acceso expirará en <strong>20 minutos</strong>. Si no has solicitado este registro, por favor, informa a seguridad del parque.</p>
                <p>Atentamente,<br>El Equipo de Administración del Parque</p>
            </div>
            <div class="footer">
                <p>&copy; InGen Corporation. Todos los derechos reservados.</p>
                <p>La seguridad es una ilusión. La vida se abre camino.</p>
            </div>
        </div>
    </body>
    </html>
    """