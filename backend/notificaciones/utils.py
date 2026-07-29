import threading
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.db import connection


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
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@exuth.edu.mx')

            if self.is_bulk or self.bcc_list:
                # Extraer correos unicos y validos
                raw_emails = self.bcc_list if self.bcc_list else self.recipient_list
                emails = [e for e in set(raw_emails) if e]

                # Divisió en lotes (chunks) de maximo 50 correos
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
                    msg.send(fail_silently=True)
            else:
                msg = EmailMultiAlternatives(
                    subject=self.subject,
                    body="Tu cliente de correo no soporta mensajes en formato HTML.",
                    from_email=from_email,
                    to=self.recipient_list
                )
                msg.attach_alternative(self.html_content, "text/html")
                msg.send(fail_silently=True)
        except Exception as e:
            print(f"[EmailThread Error] Error enviando correo: {e}")
        finally:
            connection.close()


def enviar_correo_institucional(subject, template_name, context, recipient_list=None, bcc_list=None, is_bulk=False):
    """
    Utileria asíncrona para renderizar plantillas HTML y despachar correos mediante EmailThread.
    """
    if not recipient_list and not bcc_list:
        return
    html_content = render_to_string(template_name, context)
    EmailThread(
        subject=subject,
        html_content=html_content,
        recipient_list=recipient_list,
        bcc_list=bcc_list,
        is_bulk=is_bulk
    ).start()