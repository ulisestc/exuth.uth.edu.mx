import logging
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)

FRONTEND_URL = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
DEFAULT_FROM_EMAIL = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Bolsa de Trabajo UTH <vinculacion@uth.edu.mx>')

def _build_html_email(titulo_banner, contenido_html, cta_texto=None, cta_url=None):
    """
    Genera el HTML institucional para correos de la Universidad Tecnológica de Huejotzingo.
    Paleta oficial: Verde #00A887, Guinda #691C32, Dorado #C2BA98, Carbón #2D2926.
    """
    cta_block = ""
    if cta_texto and cta_url:
        cta_block = f"""
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 28px 0 10px 0;">
            <tr>
                <td align="center" style="border-radius: 8px; background-color: #00A887;">
                    <a href="{cta_url}" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 8px;">
                        {cta_texto} &rarr;
                    </a>
                </td>
            </tr>
        </table>
        """

    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{titulo_banner}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #F4F6F8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #2D2926;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F4F6F8; padding: 30px 15px;">
            <tr>
                <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
                        <!-- Pleca Bicolor UTH -->
                        <tr>
                            <td style="height: 6px; background-color: #00A887;"></td>
                        </tr>
                        
                        <!-- Encabezado Institucional -->
                        <tr>
                            <td style="padding: 28px 36px 20px 36px; background-color: #2D2926; text-align: left;">
                                <table role="presentation" width="100%">
                                    <tr>
                                        <td>
                                            <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; color: #C2BA98; display: block; margin-bottom: 4px;">
                                                Universidad Tecnológica de Huejotzingo
                                            </span>
                                            <span style="font-size: 16px; font-weight: 800; color: #ffffff; display: block;">
                                                Dirección de Vinculación y Extensión
                                            </span>
                                            <span style="font-size: 11px; color: #9CA3AF; display: block; margin-top: 2px;">
                                                Bolsa de Trabajo y Seguimiento de Egresados
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Banner del Asunto -->
                        <tr>
                            <td style="padding: 16px 36px; background-color: #F0F9F7; border-bottom: 1px solid #D1FAE5;">
                                <span style="font-size: 14px; font-weight: 700; color: #00A887;">
                                    {titulo_banner}
                                </span>
                            </td>
                        </tr>

                        <!-- Contenido Principal -->
                        <tr>
                            <td style="padding: 32px 36px; font-size: 13px; line-height: 1.6; color: #374151;">
                                {contenido_html}
                                {cta_block}
                            </td>
                        </tr>

                        <!-- Pie de Página Institucional -->
                        <tr>
                            <td style="padding: 24px 36px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB; text-align: center; font-size: 11px; color: #6B7280; line-height: 1.5;">
                                <p style="margin: 0 0 4px 0; font-weight: bold; color: #4B5563;">
                                    Departamento de Prácticas, Estadías y Bolsa de Trabajo
                                </p>
                                <p style="margin: 0 0 8px 0;">
                                    Camino Real a San Mateo s/n, Santa Ana Xalmimilulco, Huejotzingo, Puebla.
                                </p>
                                <p style="margin: 0; color: #9CA3AF; font-size: 10px;">
                                    Este es un mensaje institucional automatizado emitido por la plataforma <a href="{FRONTEND_URL}" style="color: #00A887; text-decoration: none;">exuth.uth.edu.mx</a>.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

def send_postulacion_recibida_email(postulacion):
    """
    Notifica al egresado que su postulación ha sido registrada con éxito y entra al filtro UTH.
    """
    try:
        egresado = postulacion.egresado
        user = egresado.user
        vacante = postulacion.vacante

        if not user.email:
            return False

        subject = f"[UTH] Confirmación de Postulación: {vacante.titulo} ({vacante.clave_vacante})"
        
        contenido = f"""
        <p style="margin-top: 0;">Estimada(o) <strong>{user.nombres} {user.apellido_paterno}</strong>:</p>
        <p>Confirmamos que tu solicitud de empleo para la vacante <strong>"{vacante.titulo}"</strong> ofertada por <strong>{vacante.empresa.nombre}</strong> ha sido registrada exitosamente en la plataforma institucional.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; background-color: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
            <tr>
                <td style="padding: 10px 14px; font-weight: bold; color: #4B5563; border-bottom: 1px solid #E5E7EB; width: 40%;">Clave de Vacante:</td>
                <td style="padding: 10px 14px; font-family: monospace; font-weight: bold; color: #00A887; border-bottom: 1px solid #E5E7EB;">{vacante.clave_vacante}</td>
            </tr>
            <tr>
                <td style="padding: 10px 14px; font-weight: bold; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Organización Empleadora:</td>
                <td style="padding: 10px 14px; color: #111827; border-bottom: 1px solid #E5E7EB;">{vacante.empresa.nombre}</td>
            </tr>
            <tr>
                <td style="padding: 10px 14px; font-weight: bold; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Modalidad:</td>
                <td style="padding: 10px 14px; color: #111827; border-bottom: 1px solid #E5E7EB;">{vacante.modalidad.capitalize()}</td>
            </tr>
            <tr>
                <td style="padding: 10px 14px; font-weight: bold; color: #4B5563;">Estatus Actual:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #D97706;">En Revisión por Dirección de Vinculación UTH</td>
            </tr>
        </table>

        <p><strong>¿Qué sigue ahora?</strong><br>
        El personal de la Dirección de Vinculación evaluará la pertinencia de tu perfil y tu Currículum Vitae cargado en el sistema. Una vez aprobado el filtro, tu expediente será turnado directamente a los reclutadores de la empresa para la fase de entrevistas.</p>
        """

        html_body = _build_html_email(
            titulo_banner="Acuse de Recibo · Postulación Registrada",
            contenido_html=contenido,
            cta_texto="Consultar Estado en Portal Egresado",
            cta_url=f"{FRONTEND_URL}/portal-egresado"
        )

        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"Hola {user.nombres}, confirmamos tu postulación a {vacante.titulo}. Tu solicitud está en revisión por la UTH.",
            from_email=DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=True)
        logger.info(f"Correo de postulación enviada a {user.email}")
        return True
    except Exception as e:
        logger.error(f"Error enviando correo de postulación: {str(e)}")
        return False

def send_postulacion_turnada_email(postulacion):
    """
    Notifica tanto a la empresa (nuevo candidato turnado) como al egresado (su postulación avanzó).
    """
    try:
        egresado = postulacion.egresado
        user_egresado = egresado.user
        vacante = postulacion.vacante
        empresa = vacante.empresa
        
        # 1. Correo a la Empresa Empleadora
        destinatario_empresa = empresa.correo_contacto or empresa.user.email
        if destinatario_empresa:
            subject_empresa = f"[UTH Vinculación] Candidato Idóneo Turnado: {vacante.titulo} ({user_egresado.nombres} {user_egresado.apellido_paterno})"
            notas_block = f"<p><strong>Observaciones de Vinculación UTH:</strong> {postulacion.notas_uth}</p>" if postulacion.notas_uth else ""

            contenido_empresa = f"""
            <p style="margin-top: 0;">Estimados representantes de <strong>{empresa.nombre}</strong>:</p>
            <p>La Dirección de Vinculación de la Universidad Tecnológica de Huejotzingo ha auditado y turnado formalmente a un candidato egresado que cumple con el perfil requerido para su vacante <strong>"{vacante.titulo}"</strong>.</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; background-color: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
                <tr>
                    <td style="padding: 10px 14px; font-weight: bold; color: #4B5563; border-bottom: 1px solid #E5E7EB; width: 40%;">Nombre del Egresado:</td>
                    <td style="padding: 10px 14px; font-weight: bold; color: #111827; border-bottom: 1px solid #E5E7EB;">{user_egresado.nombres} {user_egresado.apellido_paterno} {user_egresado.apellido_materno}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 14px; font-weight: bold; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Programa Académico:</td>
                    <td style="padding: 10px 14px; color: #00A887; font-weight: bold; border-bottom: 1px solid #E5E7EB;">{egresado.carrera.nombre}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 14px; font-weight: bold; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Matrícula Institucional:</td>
                    <td style="padding: 10px 14px; font-family: monospace; color: #111827; border-bottom: 1px solid #E5E7EB;">{egresado.matricula}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 14px; font-weight: bold; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Teléfono de Contacto:</td>
                    <td style="padding: 10px 14px; color: #111827; border-bottom: 1px solid #E5E7EB;">{egresado.telefono_celular or 'Consultar en portal'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px 14px; font-weight: bold; color: #4B5563;">Correo Electrónico:</td>
                    <td style="padding: 10px 14px; color: #111827;">{user_egresado.email}</td>
                </tr>
            </table>

            {notas_block}

            <p>Ya puede ingresar a la consola de su organización para consultar el expediente completo, descargar su <strong>Currículum Vitae en PDF</strong> y gestionar la entrevista correspondiente.</p>
            """

            html_empresa = _build_html_email(
                titulo_banner="Candidato Turnado por la UTH",
                contenido_html=contenido_empresa,
                cta_texto="Revisar Candidato en Portal Empresa",
                cta_url=f"{FRONTEND_URL}/portal-empresa"
            )

            msg_empresa = EmailMultiAlternatives(
                subject=subject_empresa,
                body=f"La UTH le ha turnado a {user_egresado.nombres} {user_egresado.apellido_paterno} para la vacante {vacante.titulo}.",
                from_email=DEFAULT_FROM_EMAIL,
                to=[destinatario_empresa]
            )
            msg_empresa.attach_alternative(html_empresa, "text/html")
            msg_empresa.send(fail_silently=True)

        # 2. Correo al Egresado
        if user_egresado.email:
            subject_egresado = f"[UTH Vinculación] ¡Tu postulación fue turnada a {empresa.nombre}!"
            contenido_egresado = f"""
            <p style="margin-top: 0;">Estimada(o) <strong>{user_egresado.nombres}</strong>:</p>
            <p>¡Excelentes noticias! La Dirección de Vinculación de la UTH ha validado tu perfil satisfactoriamente y ha <strong>turnado tu Currículum Vitae</strong> a la empresa <strong>{empresa.nombre}</strong> para la vacante <strong>"{vacante.titulo}"</strong>.</p>
            <p>Los reclutadores de la empresa ya tienen acceso a tu expediente y datos de contacto para ponerse en comunicación contigo para agendar tu entrevista.</p>
            <p>Te recomendamos mantenerte atenta(o) a tu correo electrónico ({user_egresado.email}) y teléfono celular.</p>
            """

            html_egresado = _build_html_email(
                titulo_banner="Filtro UTH Aprobado · Turnado a Empresa",
                contenido_html=contenido_egresado,
                cta_texto="Ver Estado en Portal Egresado",
                cta_url=f"{FRONTEND_URL}/portal-egresado"
            )

            msg_egresado = EmailMultiAlternatives(
                subject=subject_egresado,
                body=f"¡Felicidades {user_egresado.nombres}! Tu postulación para {vacante.titulo} fue aprobada por la UTH y turnada a {empresa.nombre}.",
                from_email=DEFAULT_FROM_EMAIL,
                to=[user_egresado.email]
            )
            msg_egresado.attach_alternative(html_egresado, "text/html")
            msg_egresado.send(fail_silently=True)

        logger.info(f"Correos de postulacion turnada enviados a empresa y egresado")
        return True
    except Exception as e:
        logger.error(f"Error enviando correos de postulacion turnada: {str(e)}")
        return False

def send_candidato_contratado_email(postulacion):
    """
    Notifica al egresado de su contratación formal y registro de colocación universitaria.
    """
    try:
        egresado = postulacion.egresado
        user = egresado.user
        vacante = postulacion.vacante

        if not user.email:
            return False

        subject = f"[UTH Colocación] ¡Felicidades! Has sido contratado(a) por {vacante.empresa.nombre}"
        
        contenido = f"""
        <p style="margin-top: 0;">¡Enhorabuena, <strong>{user.nombres} {user.apellido_paterno}</strong>!</p>
        <p>Nos llena de orgullo informarte que la empresa <strong>{vacante.empresa.nombre}</strong> ha reportado formalmente tu <strong>contratación</strong> para el puesto de <strong>"{vacante.titulo}"</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; background-color: #ECFDF5; border-radius: 8px; border: 1px solid #A7F3D0;">
            <tr>
                <td style="padding: 12px 14px; font-weight: bold; color: #065F46; border-bottom: 1px solid #A7F3D0; width: 40%;">Puesto Laboral:</td>
                <td style="padding: 12px 14px; font-weight: bold; color: #047857; border-bottom: 1px solid #A7F3D0;">{vacante.titulo}</td>
            </tr>
            <tr>
                <td style="padding: 12px 14px; font-weight: bold; color: #065F46; border-bottom: 1px solid #A7F3D0;">Organización:</td>
                <td style="padding: 12px 14px; color: #111827; border-bottom: 1px solid #A7F3D0;">{vacante.empresa.nombre}</td>
            </tr>
            <tr>
                <td style="padding: 12px 14px; font-weight: bold; color: #065F46;">Estatus Institucional:</td>
                <td style="padding: 12px 14px; font-weight: bold; color: #00A887;">Colocación Universitaria UTH Registrada</td>
            </tr>
        </table>

        <p>Tu éxito representa la excelencia de nuestra comunidad universitaria. La Universidad Tecnológica de Huejotzingo te desea el mayor de los éxitos en esta nueva etapa profesional.</p>
        """

        html_body = _build_html_email(
            titulo_banner="¡Felicidades por tu Contratación!",
            contenido_html=contenido,
            cta_texto="Ir a Mi Portal de Egresado",
            cta_url=f"{FRONTEND_URL}/portal-egresado"
        )

        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"¡Felicidades {user.nombres}! {vacante.empresa.nombre} ha confirmado tu contratación para el puesto {vacante.titulo}.",
            from_email=DEFAULT_FROM_EMAIL,
            to=[user.email]
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=True)
        logger.info(f"Correo de contratación enviado a {user.email}")
        return True
    except Exception as e:
        logger.error(f"Error enviando correo de contratación: {str(e)}")
        return False

def send_nueva_vacante_email(vacante):
    """
    Notifica a Vinculación UTH que una empresa publicó una vacante para su auditoría.
    """
    try:
        admin_emails = ['vinculacion@uth.edu.mx']
        subject = f"[UTH Auditoría] Nueva Vacante Registrada: {vacante.titulo} ({vacante.empresa.nombre})"
        contenido = f"""
        <p style="margin-top: 0;">Estimado personal de la Dirección de Vinculación:</p>
        <p>La organización empleadora <strong>{vacante.empresa.nombre}</strong> ha registrado una nueva oferta de empleo en la plataforma:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; background-color: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB;">
            <tr>
                <td style="padding: 10px 14px; font-weight: bold; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Puesto:</td>
                <td style="padding: 10px 14px; font-weight: bold; color: #111827; border-bottom: 1px solid #E5E7EB;">{vacante.titulo}</td>
            </tr>
            <tr>
                <td style="padding: 10px 14px; font-weight: bold; color: #4B5563; border-bottom: 1px solid #E5E7EB;">Empresa:</td>
                <td style="padding: 10px 14px; color: #111827; border-bottom: 1px solid #E5E7EB;">{vacante.empresa.nombre}</td>
            </tr>
            <tr>
                <td style="padding: 10px 14px; font-weight: bold; color: #4B5563;">Clave Asignada:</td>
                <td style="padding: 10px 14px; font-family: monospace; font-weight: bold; color: #00A887;">{vacante.clave_vacante}</td>
            </tr>
        </table>
        <p>La vacante se encuentra en estado <strong>Pendiente de Aprobación</strong> a la espera de su auditoría institucional antes de ser visible en el catálogo general.</p>
        """

        html_body = _build_html_email(
            titulo_banner="Nueva Vacante Pendiente de Auditoría",
            contenido_html=contenido,
            cta_texto="Auditar en Consola UTH",
            cta_url=f"{FRONTEND_URL}/admin-uth"
        )

        msg = EmailMultiAlternatives(
            subject=subject,
            body=f"Nueva vacante registrada: {vacante.titulo} de {vacante.empresa.nombre}.",
            from_email=DEFAULT_FROM_EMAIL,
            to=admin_emails
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=True)
        logger.info(f"Correo de nueva vacante enviado a vinculacion")
        return True
    except Exception as e:
        logger.error(f"Error enviando correo de nueva vacante: {str(e)}")
        return False

