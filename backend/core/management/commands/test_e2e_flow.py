import time
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from core.models import AreaEstudio, Idioma
from profiles.models import Egresado, Empresa
from vacantes.models import Vacante, Postulacion, Colocacion

User = get_user_model()


class Command(BaseCommand):
    help = 'Ejecuta una prueba integral de punta a punta (End-to-End) sobre las reglas de negocio y endpoints de EXUTH'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('======================================================================='))
        self.stdout.write(self.style.MIGRATE_HEADING(' [EXUTH] EJECUTANDO SUITE DE PRUEBA INTEGRAL END-TO-END (E2E)'))
        self.stdout.write(self.style.MIGRATE_HEADING('=======================================================================\n'))

        inicio_total = time.time()
        client = APIClient(SERVER_NAME='localhost')
        client.defaults['HTTP_HOST'] = 'localhost'

        # ---------------------------------------------------------------------
        # FASE 0: VERIFICACIÓN DE PRECONDICIONES
        # ---------------------------------------------------------------------
        self.stdout.write(self.style.WARNING('[FASE 0] Verificando entorno de pruebas y usuarios base...'))
        try:
            admin_user = User.objects.get(email='admin@uth.edu.mx')
            empresa_user = User.objects.get(email='softtech@demo.com')
            egresado_user = User.objects.get(email='20260003@uth.edu.mx')
            egresado_profile = Egresado.objects.get(user=egresado_user)
            area_estudio = AreaEstudio.objects.first()
            idioma = Idioma.objects.first()
            self.stdout.write(self.style.SUCCESS('  [OK] Cuentas de prueba localizadas correctamente.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'  [FAIL] Faltan datos requeridos. Ejecuta primero "python manage.py seed_demo_data": {e}'))
            return

        # ---------------------------------------------------------------------
        # FASE 1: AUTENTICACIÓN JWT Y RBAC
        # ---------------------------------------------------------------------
        self.stdout.write(self.style.WARNING('\n[FASE 1] Autenticación JWT y Emisión de Tokens (POST /api/v1/auth/jwt/create/)...'))
        
        # 1.1 Login Admin
        resp_admin = client.post('/api/v1/auth/jwt/create/', {'email': 'admin@uth.edu.mx', 'password': 'Password123!'})
        assert resp_admin.status_code == status.HTTP_200_OK, f"Error en login Admin: {resp_admin.data}"
        token_admin = resp_admin.data['access']
        self.stdout.write(self.style.SUCCESS('  [OK] Token JWT emitido para Administrador UTH'))

        # 1.2 Login Empresa
        resp_empresa = client.post('/api/v1/auth/jwt/create/', {'email': 'softtech@demo.com', 'password': 'Password123!'})
        assert resp_empresa.status_code == status.HTTP_200_OK, f"Error en login Empresa: {resp_empresa.data}"
        token_empresa = resp_empresa.data['access']
        self.stdout.write(self.style.SUCCESS('  [OK] Token JWT emitido para Empresa Empleadora (SoftTech)'))

        # 1.3 Login Egresado
        resp_egresado = client.post('/api/v1/auth/jwt/create/', {'email': '20260003@uth.edu.mx', 'password': 'Password123!'})
        assert resp_egresado.status_code == status.HTTP_200_OK, f"Error en login Egresado: {resp_egresado.data}"
        token_egresado = resp_egresado.data['access']
        self.stdout.write(self.style.SUCCESS('  [OK] Token JWT emitido para Egresado UTH (20260003)'))

        # ---------------------------------------------------------------------
        # FASE 2: PUBLICACIÓN DE VACANTE POR LA EMPRESA (STATUS PENDIENTE)
        # ---------------------------------------------------------------------
        self.stdout.write(self.style.WARNING('\n[FASE 2] Publicación de Oferta Laboral por la Empresa (POST /api/v1/vacantes/)...'))
        
        client.credentials(HTTP_AUTHORIZATION=f'JWT {token_empresa}')
        vacante_payload = {
            'titulo': 'Ingeniero Cloud DevOps Jr (Prueba E2E)',
            'area_estudio': area_estudio.id,
            'tipo_contratacion': 'tiempo_completo',
            'modalidad': 'home_office',
            'num_candidatos': 1,
            'horario_trabajo': 'Lunes a Viernes 9:00 a 18:00',
            'nivel_estudios': 'ING_LIC',
            'experiencia': 'Conocimientos de contenedores Docker y Linux',
            'conocimientos': 'AWS, Docker, CI/CD',
            'habilidades': 'Resolución de problemas técnicos',
            'actitudes': 'Iniciativa',
            'responsabilidades': 'Automatización de despliegues y monitoreo de microservicios',
            'sueldo_minimo': '18000.00',
            'sueldo_maximo': '23000.00',
            'prestaciones': 'Superiores de ley',
            'documentos_requeridos': 'CV',
            'persona_contacto': 'Ing. Carlos Méndez',
            'idiomas': [
                {'idioma': idioma.id, 'nivel': 'B2', 'obligatorio': True}
            ]
        }
        resp_vacante = client.post('/api/v1/vacantes/', vacante_payload, format='json')
        assert resp_vacante.status_code == status.HTTP_201_CREATED, f"Error al crear vacante: {resp_vacante.data}"
        vacante_id = resp_vacante.data['id']
        assert resp_vacante.data['status'] == 'pendiente', f"La vacante debía nacer en 'pendiente', estado actual: {resp_vacante.data['status']}"
        self.stdout.write(self.style.SUCCESS(f'  [OK] Vacante #{vacante_id} creada exitosamente con status "pendiente".'))

        # 2.1 Verificación de Aislamiento: Egresado NO debe ver la vacante aún
        client.credentials(HTTP_AUTHORIZATION=f'JWT {token_egresado}')
        resp_egresado_vacantes = client.get('/api/v1/vacantes/')
        ids_visibles_egresado = [v['id'] for v in resp_egresado_vacantes.data.get('results', resp_egresado_vacantes.data)]
        assert vacante_id not in ids_visibles_egresado, "Falla de Seguridad: El egresado pudo ver una vacante en estado 'pendiente'."
        self.stdout.write(self.style.SUCCESS('  [OK] Seguridad RBAC comprobada: Vacante en estado "pendiente" oculta para egresados.'))

        # ---------------------------------------------------------------------
        # FASE 3: MODERACIÓN Y APROBACIÓN DE LA VACANTE POR ADMIN UTH
        # ---------------------------------------------------------------------
        self.stdout.write(self.style.WARNING('\n[FASE 3] Moderación y Aprobación de Vacante por Admin UTH (PATCH /api/v1/vacantes/{id}/cambiar_status/)...'))
        
        client.credentials(HTTP_AUTHORIZATION=f'JWT {token_admin}')
        resp_aprobar_vacante = client.patch(f'/api/v1/vacantes/{vacante_id}/cambiar_status/', {'status': 'aprobada'}, format='json')
        assert resp_aprobar_vacante.status_code == status.HTTP_200_OK, f"Error al aprobar vacante: {resp_aprobar_vacante.data}"
        assert resp_aprobar_vacante.data['status'] == 'aprobada', "El estado no cambió a 'aprobada'."
        self.stdout.write(self.style.SUCCESS(f'  [OK] Vacante #{vacante_id} aprobada oficialmente por el Departamento de Egresados UTH.'))

        # 3.1 Verificación: Ahora el egresado sí debe verla en el tablón
        client.credentials(HTTP_AUTHORIZATION=f'JWT {token_egresado}')
        resp_ver_aprobada = client.get(f'/api/v1/vacantes/{vacante_id}/')
        assert resp_ver_aprobada.status_code == status.HTTP_200_OK, "El egresado no pudo consultar la vacante recién aprobada."
        self.stdout.write(self.style.SUCCESS('  [OK] Visibilidad confirmada: Vacante aprobada expuesta para postulaciones.'))

        # ---------------------------------------------------------------------
        # FASE 4: POSTULACIÓN DEL EGRESADO (FILTRO UTH - OPCIÓN B)
        # ---------------------------------------------------------------------
        self.stdout.write(self.style.WARNING('\n[FASE 4] Postulación de Egresado y Filtro Institucional (POST /api/v1/vacantes/postulaciones/)...'))
        
        client.credentials(HTTP_AUTHORIZATION=f'JWT {token_egresado}')
        postulacion_payload = {'vacante': vacante_id}
        resp_post = client.post('/api/v1/vacantes/postulaciones/', postulacion_payload, format='json')
        assert resp_post.status_code == status.HTTP_201_CREATED, f"Error al postularse: {resp_post.data}"
        postulacion_id = resp_post.data['id']
        assert resp_post.data['estado'] == 'revision_uth', f"Opción B violada: La postulación debía nacer en 'revision_uth', nació en: {resp_post.data['estado']}"
        self.stdout.write(self.style.SUCCESS(f'  [OK] Postulación #{postulacion_id} registrada con éxito. Estatus: "revision_uth".'))

        # 4.1 Verificación de Filtro Opción B: Empresa NO debe verla aún
        client.credentials(HTTP_AUTHORIZATION=f'JWT {token_empresa}')
        resp_empresa_posts = client.get('/api/v1/vacantes/postulaciones/')
        posts_visibles = [p['id'] for p in resp_empresa_posts.data.get('results', resp_empresa_posts.data)]
        assert postulacion_id not in posts_visibles, "Falla en Filtro Opción B: La empresa pudo ver una postulación que no ha pasado el filtro UTH."
        self.stdout.write(self.style.SUCCESS('  [OK] Regla de Negocio Opción B validada: CV retenido en filtro UTH (oculto a la empresa).'))

        # ---------------------------------------------------------------------
        # FASE 5: DICTAMEN Y APROBACIÓN DE LA POSTULACIÓN POR ADMIN UTH
        # ---------------------------------------------------------------------
        self.stdout.write(self.style.WARNING('\n[FASE 5] Dictamen del Filtro UTH (POST /api/v1/vacantes/postulaciones/{id}/aprobar-uth/)...'))
        
        client.credentials(HTTP_AUTHORIZATION=f'JWT {token_admin}')
        dictamen_payload = {'notas_uth': 'CV auditado por Coordinación de Egresados. Cumple requisitos técnicos y perfil integral.'}
        resp_aprobar_cv = client.post(f'/api/v1/vacantes/postulaciones/{postulacion_id}/aprobar-uth/', dictamen_payload, format='json')
        assert resp_aprobar_cv.status_code == status.HTTP_200_OK, f"Error en aprobación UTH: {resp_aprobar_cv.data}"
        assert resp_aprobar_cv.data['estado'] == 'enviada_empresa', "El estado no se actualizó a 'enviada_empresa'."
        self.stdout.write(self.style.SUCCESS(f'  [OK] Postulación #{postulacion_id} aprobada por UTH y turnada a la Empresa (enviada_empresa).'))

        # 5.1 Verificación: Ahora la empresa sí debe verla en su bandeja de candidatos
        client.credentials(HTTP_AUTHORIZATION=f'JWT {token_empresa}')
        resp_empresa_posts_after = client.get('/api/v1/vacantes/postulaciones/')
        posts_despues = [p['id'] for p in resp_empresa_posts_after.data.get('results', resp_empresa_posts_after.data)]
        assert postulacion_id in posts_despues, "La empresa no puede ver la postulación aprobada por UTH."
        self.stdout.write(self.style.SUCCESS('  [OK] Bandeja de la Empresa sincronizada: Candidato disponible para evaluación final.'))

        # ---------------------------------------------------------------------
        # FASE 6: CONTRATACIÓN Y COLOCACIÓN LABORAL AUTOMÁTICA
        # ---------------------------------------------------------------------
        self.stdout.write(self.style.WARNING('\n[FASE 6] Aceptación del Candidato y Sincronización de Colocación (PATCH /api/v1/vacantes/postulaciones/{id}/)...'))
        
        # 6.1 Empresa acepta al candidato
        resp_contratar = client.patch(f'/api/v1/vacantes/postulaciones/{postulacion_id}/', {'estado': 'Aceptada'}, format='json')
        assert resp_contratar.status_code == status.HTTP_200_OK, f"Error al aceptar candidato: {resp_contratar.data}"
        assert resp_contratar.data['estado'] == 'Aceptada', "El estado no es 'Aceptada'."
        self.stdout.write(self.style.SUCCESS(f'  [OK] Empresa SoftTech aceptó y contrató al candidato #{postulacion_id}.'))

        # 6.2 Comprobación automática de Colocación en Base de Datos
        colocacion_obj = Colocacion.objects.filter(vacante_id=vacante_id, egresado=egresado_profile).first()
        assert colocacion_obj is not None, "Error de Integridad: No se generó automáticamente el registro en Colocacion."
        egresado_profile.refresh_from_db()
        assert egresado_profile.colocado is True, "Error de Integridad: La bandera egresado.colocado no cambió a True."
        self.stdout.write(self.style.SUCCESS('  [OK] Trigger de Colocación verificado: egresado.colocado = True y registro de Colocacion creado.'))

        # ---------------------------------------------------------------------
        # FASE 7: DASHBOARD DE INTELIGENCIA DE NEGOCIOS Y REPORTES
        # ---------------------------------------------------------------------
        self.stdout.write(self.style.WARNING('\n[FASE 7] Dashboard de Inteligencia de Negocios (GET /api/v1/reports/dashboard/)...'))
        
        client.credentials(HTTP_AUTHORIZATION=f'JWT {token_admin}')
        resp_dashboard = client.get('/api/v1/reports/dashboard/')
        assert resp_dashboard.status_code == status.HTTP_200_OK, f"Error al consultar dashboard: {resp_dashboard.data}"
        datos_dash = resp_dashboard.data
        
        # Validar consistencia de métricas
        assert 'egresados' in datos_dash and datos_dash['egresados']['colocados'] > 0, "Métricas de egresados inconsistentes."
        assert 'vacantes' in datos_dash and datos_dash['vacantes']['aprobadas'] > 0, "Métricas de vacantes inconsistentes."
        assert 'postulaciones' in datos_dash and datos_dash['postulaciones']['aceptadas'] > 0, "Métricas de postulaciones inconsistentes."
        
        self.stdout.write(self.style.SUCCESS(f"  [OK] Dashboard validado en tiempo real:"))
        self.stdout.write(f"       * Total Egresados:   {datos_dash['egresados']['total']}")
        self.stdout.write(f"       * Colocados Reales:  {datos_dash['egresados']['colocados']} (Tasa: {datos_dash['egresados']['tasa_colocacion_porcentaje']}%)")
        self.stdout.write(f"       * Vacantes Activas:  {datos_dash['vacantes']['aprobadas']}")
        self.stdout.write(f"       * Postulaciones:     {datos_dash['postulaciones']['total']}")

        # ---------------------------------------------------------------------
        # FASE 8: LIMPIEZA DE ARTEFACTOS EPHEMERALES DE LA PRUEBA
        # ---------------------------------------------------------------------
        self.stdout.write(self.style.WARNING('\n[FASE 8] Depuración de registros transaccionales generados en la prueba...'))
        colocacion_obj.delete()
        Postulacion.objects.filter(id=postulacion_id).delete()
        Vacante.objects.filter(id=vacante_id).delete()
        egresado_profile.colocado = False
        egresado_profile.save(update_fields=['colocado'])
        self.stdout.write(self.style.SUCCESS('  [OK] Base de datos restaurada al estado limpio previo a la prueba.'))

        # RESUMEN FINAL
        tiempo_total = round(time.time() - inicio_total, 2)
        self.stdout.write(self.style.SUCCESS('\n======================================================================='))
        self.stdout.write(self.style.SUCCESS(f' ¡PRUEBA INTEGRAL COMPLETADA AL 100%! ({tiempo_total} segundos)'))
        self.stdout.write(self.style.SUCCESS(' Todos los contratos de API, reglas RBAC y Opción B funcionan a la perfección.'))
        self.stdout.write(self.style.SUCCESS('=======================================================================\n'))
