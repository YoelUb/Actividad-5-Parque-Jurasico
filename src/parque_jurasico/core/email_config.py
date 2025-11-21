import os
import random
import string
from typing import List
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    MAIL_USERNAME: str = os.getenv("MAIL_USERNAME", "")
    MAIL_PASSWORD: str = os.getenv("MAIL_PASSWORD", "")
    MAIL_FROM: str = os.getenv("MAIL_FROM", "admin@jurassicpark.com")
    MAIL_PORT: int = int(os.getenv("MAIL_PORT", 587))
    MAIL_SERVER: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    MAIL_FROM_NAME: str = os.getenv("MAIL_FROM_NAME", "Parque Jurásico")
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    FRONTEND_DOMAIN: str = os.getenv("FRONTEND_DOMAIN", "http://localhost:3000")


settings = Settings()

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
    VALIDATE_CERTS=settings.VALIDATE_CERTS
)

fm = FastMail(conf)


def generate_verification_code(length: int = 6) -> str:
    """Genera código numérico aleatorio."""
    return ''.join(random.choices(string.digits, k=length))


def create_jurassic_park_email_template(code: str, nombre_usuario: str) -> str:
    """Plantilla HTML para registro."""
    return f"""
       <!DOCTYPE html>
       <html lang="es">
       <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Bienvenido a Jurassic Park</title>
       </head>
       <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
           <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
               <!-- Header -->
               <tr>
                   <td style="background: linear-gradient(135deg, #2c3e50, #34495e); padding: 30px 20px; text-align: center;">
                       <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                           🦖 Bienvenido a Jurassic Park
                       </h1>
                       <p style="color: #ecf0f1; margin: 10px 0 0 0; font-size: 16px;">
                           La aventura está por comenzar
                       </p>
                   </td>
               </tr>

               <!-- Content -->
               <tr>
                   <td style="padding: 40px 30px;">
                       <h2 style="color: #2c3e50; margin-top: 0;">¡Hola {nombre_usuario}!</h2>
                       <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">
                           Gracias por registrarte en Jurassic Park. Para completar tu registro, 
                           utiliza el siguiente código de verificación:
                       </p>

                       <!-- Verification Code -->
                       <div style="text-align: center; margin: 40px 0;">
                           <div style="display: inline-block; background: linear-gradient(135deg, #e74c3c, #c0392b); 
                                       color: white; padding: 20px 40px; border-radius: 10px; font-size: 32px; 
                                       font-weight: bold; letter-spacing: 8px; box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);">
                               {code}
                           </div>
                       </div>

                       <p style="color: #95a5a6; font-size: 14px; text-align: center;">
                           Este código expirará en 15 minutos. Si no realizaste esta solicitud, 
                           puedes ignorar este mensaje.
                       </p>
                   </td>
               </tr>

               <!-- Footer -->
               <tr>
                   <td style="background-color: #ecf0f1; padding: 20px; text-align: center;">
                       <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                           © 2024 Jurassic Park. Todos los derechos reservados.<br>
                           Parque temático de aventuras prehistóricas
                       </p>
                   </td>
               </tr>
           </table>
       </body>
       </html>
       """


def create_confirmation_email_template(nombre_usuario: str, email_usuario: str, login_url: str) -> str:
    """Plantilla HTML para confirmación."""
    return f"""
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Cuenta Verificada - Jurassic Park</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden;">
              <!-- Header -->
              <tr>
                  <td style="background: linear-gradient(135deg, #27ae60, #229954); padding: 30px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                          ✅ ¡Cuenta Verificada!
                      </h1>
                  </td>
              </tr>

              <!-- Content -->
              <tr>
                  <td style="padding: 40px 30px;">
                      <div style="text-align: center; margin-bottom: 30px;">
                          <div style="background-color: #d5f4e6; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center;">
                              <span style="font-size: 40px; color: #27ae60;">✓</span>
                          </div>
                      </div>

                      <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">
                          ¡Felicidades {nombre_usuario}!
                      </h2>

                      <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; text-align: center;">
                          Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las 
                          experiencias que Jurassic Park tiene para ofrecerte.
                      </p>

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 40px 0;">
                          <a href="{login_url}" 
                             style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 15px 30px; 
                                    text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; 
                                    display: inline-block; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);">
                             🦕 Iniciar Sesión en Jurassic Park
                          </a>
                      </div>

                      <p style="color: #95a5a6; font-size: 14px; text-align: center;">
                          O copia y pega este enlace en tu navegador:<br>
                          <span style="color: #3498db; word-break: break-all;">{login_url}</span>
                      </p>
                  </td>
              </tr>

              <!-- Footer -->
              <tr>
                  <td style="background-color: #ecf0f1; padding: 20px; text-align: center;">
                      <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                          ¿Necesitas ayuda? Contacta a nuestro equipo de soporte.
                      </p>
                  </td>
              </tr>
          </table>
      </body>
      </html>
      """


def create_password_reset_email_template(reset_url: str, nombre_usuario: str) -> str:
    """Plantilla HTML para recuperar contraseña."""
    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Contraseña - Jurassic Park</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden;">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #e67e22, #d35400); padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
                        🔐 Recuperar Contraseña
                    </h1>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style="padding: 40px 30px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="background-color: #fbeee6; border-radius: 50%; width: 80px; height: 80px; display: inline-flex; align-items: center; justify-content: center;">
                            <span style="font-size: 40px; color: #e67e22;">🔑</span>
                        </div>
                    </div>

                    <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">
                        Hola {nombre_usuario}
                    </h2>

                    <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; text-align: center;">
                        Recibimos una solicitud para restablecer tu contraseña. 
                        Haz clic en el botón de abajo para crear una nueva contraseña.
                    </p>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{reset_url}" 
                           style="background: linear-gradient(135deg, #e67e22, #d35400); color: white; padding: 15px 30px; 
                                  text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; 
                                  display: inline-block; box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);">
                           🦖 Restablecer Contraseña
                        </a>
                    </div>

                    <div style="background-color: #f9f9f9; border-left: 4px solid #e67e22; padding: 15px; margin: 20px 0;">
                        <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                            <strong>Importante:</strong> Este enlace expirará en 1 hora por seguridad. 
                            Si no solicitaste este cambio, puedes ignorar este mensaje.
                        </p>
                    </div>

                    <p style="color: #95a5a6; font-size: 14px; text-align: center;">
                        O copia y pega este enlace en tu navegador:<br>
                        <span style="color: #3498db; word-break: break-all;">{reset_url}</span>
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background-color: #ecf0f1; padding: 20px; text-align: center;">
                    <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                        Seguridad Jurassic Park - Protegiendo tu experiencia prehistórica
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

def create_promotional_email_template() -> str:
    """Plantilla HTML para correos promocionales."""
    return """
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>¡Nuevas Ofertas en Jurassic Park!</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <!-- Header -->
            <tr>
                <td style="background: linear-gradient(135deg, #27ae60, #2ecc71); padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
                        🦖 ¡NOVEDADES EN JURASSIC PARK!
                    </h1>
                    <p style="color: #ecf0f1; margin: 10px 0 0 0; font-size: 18px;">
                        Descubre nuestras increíbles nuevas ofertas
                    </p>
                </td>
            </tr>

            <!-- Content -->
            <tr>
                <td style="padding: 40px 30px;">
                    <h2 style="color: #2c3e50; text-align: center; margin-bottom: 25px;">
                        ¡La Tienda de Regalos Tiene Nuevas Sorpresas!
                    </h2>

                    <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; text-align: center;">
                        Prepárate para la aventura más emocionante. Hemos renovado nuestra tienda con 
                        productos exclusivos que te transportarán al mundo prehistórico.
                    </p>

                    <!-- Featured Product -->
                    <div style="background: linear-gradient(135deg, #f39c12, #e67e22); border-radius: 15px; padding: 25px; margin: 30px 0; text-align: center;">
                        <h3 style="color: white; margin: 0 0 15px 0; font-size: 24px;">
                            🦕 NUEVO PELUCHE T-REX
                        </h3>
                        <p style="color: white; font-size: 16px; margin: 0;">
                            ¡Suave, adorable y listo para rugir! El compañero perfecto para pequeños y grandes exploradores.
                        </p>
                    </div>

                    <!-- Product Grid -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                            <td width="50%" style="text-align: center; padding: 10px;">
                                <div style="background-color: #f8f9fa; border-radius: 10px; padding: 15px;">
                                    <span style="font-size: 30px;">🧦</span>
                                    <p style="color: #2c3e50; font-weight: bold; margin: 10px 0 5px 0;">
                                        Calcetines Dino
                                    </p>
                                    <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                                        Pack de 3 pares
                                    </p>
                                </div>
                            </td>
                            <td width="50%" style="text-align: center; padding: 10px;">
                                <div style="background-color: #f8f9fa; border-radius: 10px; padding: 15px;">
                                    <span style="font-size: 30px;">🎒</span>
                                    <p style="color: #2c3e50; font-weight: bold; margin: 10px 0 5px 0;">
                                        Mochila Explorer
                                    </p>
                                    <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                                        Resistente y espaciosa
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <!-- Special Offer -->
                    <div style="background-color: #e8f6f3; border: 2px dashed #1abc9c; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
                        <h4 style="color: #16a085; margin: 0 0 10px 0;">
                            🎁 OFERTA ESPECIAL POR TIEMPO LIMITADO
                        </h4>
                        <p style="color: #7f8c8d; font-size: 14px; margin: 0;">
                            <strong>20% DE DESCUENTO</strong> en tu primera compra online usando el código: <strong>JURASSIC20</strong>
                        </p>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin: 35px 0 20px 0;">
                        <a href="{{frontend_url}}/tienda" 
                           style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 18px 40px; 
                                  text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; 
                                  display: inline-block; box-shadow: 0 6px 20px rgba(231, 76, 60, 0.3);">
                           🛍️ Explorar Tienda Ahora
                        </a>
                    </div>

                    <p style="color: #95a5a6; font-size: 14px; text-align: center; margin: 20px 0 0 0;">
                        ¡No te pierdas estas ofertas exclusivas! Válidas hasta agotar existencias.
                    </p>
                </td>
            </tr>

            <!-- Footer -->
            <tr>
                <td style="background: linear-gradient(135deg, #2c3e50, #34495e); padding: 25px; text-align: center;">
                    <p style="color: #ecf0f1; font-size: 14px; margin: 0 0 10px 0;">
                        <strong>Jurassic Park - Donde la aventura cobra vida</strong>
                    </p>
                    <p style="color: #bdc3c7; font-size: 12px; margin: 0 0 10px 0;">
                        Isla Nublar • Abierto todos los días de 9:00 AM a 6:00 PM
                    </p>
                    <p style="color: #95a5a6; font-size: 11px; margin: 0;">
                        © 2024 Jurassic Park. Todos los derechos reservados.<br>
                        <a href="#" style="color: #3498db; text-decoration: none;">Preferencias de email</a> • 
                        <a href="#" style="color: #3498db; text-decoration: none;">Darse de baja</a>
                    </p>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


async def enviar_correos_publicidad(destinatarios: List[str], asunto: str, cuerpo: str):
    """Función para enviar correos masivos."""
    message = MessageSchema(
        subject=asunto,
        recipients=destinatarios,
        body=cuerpo,
        subtype=MessageType.html
    )
    await fm.send_message(message)