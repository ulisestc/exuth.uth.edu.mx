import os
import threading
from email.mime.image import MIMEImage
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.db import connection

LOGO_PATH = os.path.join(settings.BASE_DIR, 'static', 'images', 'Logo_UTH_Horizontal.jpeg')


def _attach_uth_logo(msg):
    """Adjunta el logo institucional UTH como Content-ID (CID) para renderizado inline."""
    try:
        if os.path.exists(LOGO_PATH):
            with open(LOGO_PATH, 'rb') as f:
                img = MIMEImage(f.read())
                img.add_header('Content-ID', '<uth_logo>')
                img.add_header('Content-Disposition', 'inline', filename='Logo_UTH_Horizontal.jpeg')
                msg.attach(img)
    except Exception as e:
        print(f"[EmailThread Warning] No se pudo adjuntar logo institucional: {e}")


class EmailThread(threading.Thread):
    def __init__(self, subject, html_content, recipient_list=None, bcc_list=None, is_bulk=False):
        self.subject = subject
        self.html_content = html_content
        self.recipient_list = recipient_list or []
        self.bcc_list = bcc_list or []
        self.is_bulk = is_bulk
        super().__init__()

    def run(self):
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Bolsa de Trabajo UTH <vinculacion@uth.edu.mx>')

            if self.is_bulk or self.bcc_list:
                # Extraer correos unicos y validos
                raw_emails = self.bcc_list if self.bcc_list else self.recipient_list
                emails = [e for e in set(raw_emails) if e]

                # División en lotes (chunks) de maximo 50 correos
                batch_size = 50
                for i in range(0, len(emails), batch_size):
                    chunk = emails[i:i + batch_size]
                    msg = EmailMultiAlternatives(
                        subject=self.subject,
                        body="Tu cliente de correo no soporta mensajes en formato HTML.",
                        from_email=from_email,
                        to=[from_email],
                        bcc=chunk
                    )
                    msg.attach_alternative(self.html_content, "text/html")
                    _attach_uth_logo(msg)
                    msg.send(fail_silently=True)
            else:
                msg = EmailMultiAlternatives(
                    subject=self.subject,
                    body="Tu cliente de correo no soporta mensajes en formato HTML.",
                    from_email=from_email,
                    to=self.recipient_list
                )
                msg.attach_alternative(self.html_content, "text/html")
                _attach_uth_logo(msg)
                msg.send(fail_silently=True)
        except Exception as e:
            print(f"[EmailThread Error] Error enviando correo: {e}")
        finally:
            connection.close()


def enviar_correo_institucional(subject, template_name, context, recipient_list=None, bcc_list=None, is_bulk=False):
    """
    Utileria asíncrona para renderizar plantillas HTML y despachar correos mediante EmailThread.
    Inyecta automáticamente 'frontend_url' para consistencia en botones CTA.
    """
    if not recipient_list and not bcc_list:
        return
    ctx = dict(context or {})
    ctx.setdefault('frontend_url', getattr(settings, 'FRONTEND_URL', 'http://localhost:3000'))
    html_content = render_to_string(template_name, ctx)
    EmailThread(
        subject=subject,
        html_content=html_content,
        recipient_list=recipient_list,
        bcc_list=bcc_list,
        is_bulk=is_bulk
    ).start()