from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.db import transaction
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from core.models import Giro, Sector, AreaEstudio, Carrera, Idioma
from profiles.models import Egresado, Empresa, PadronEgresado
from vacantes.models import Vacante, RequisitoIdioma, Postulacion, Colocacion
from events.models import Evento

User = get_user_model()


class Command(BaseCommand):
    help = 'Poblar la base de datos con un escenario integral de prueba (usuarios, empresas, egresados, vacantes, postulaciones y eventos)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Elimina datos previos de prueba antes de poblar',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('=== [EXUTH] INICIANDO POBLAMIENTO INTEGRAL DE PRUEBA ==='))

        # 1. Asegurar Catálogos Base
        self.stdout.write(self.style.WARNING('\n[1/7] Verificando Catálogos Institucionales...'))
        if not Carrera.objects.exists() or not Idioma.objects.exists():
            call_command('seed_catalogs')
        else:
            self.stdout.write(self.style.SUCCESS('-> Catálogos verificados correctamente.'))

        # Recuperar catálogos clave
        idioma_ingles = Idioma.objects.get(nombre='Inglés')
        idioma_aleman, _ = Idioma.objects.get_or_create(nombre='Alemán')
        sector_privado = Sector.objects.get(nombre='Privado')
        giro_ti = Giro.objects.get(nombre='Tecnología de la Información')
        giro_manuf = Giro.objects.get(nombre='Manufactura')
        area_ti = AreaEstudio.objects.get(nombre='Ingeniería y Tecnología')
        carrera_iti = Carrera.objects.get(nombre='Ingeniería en Tecnologías de la Información')
        carrera_soft = Carrera.objects.get(nombre='Ingeniería de Software')
        carrera_comp = Carrera.objects.get(nombre='Ciencias de la Computación')

        password_comun = 'Password123!'

        # Limpieza opcional
        if options['clean']:
            self.stdout.write(self.style.WARNING('-> Modo --clean activado: Eliminando entidades de demostración previas...'))
            Colocacion.objects.all().delete()
            Postulacion.objects.all().delete()
            RequisitoIdioma.objects.all().delete()
            Vacante.objects.all().delete()
            Egresado.objects.all().delete()
            Empresa.objects.all().delete()
            PadronEgresado.objects.filter(matricula__startswith='202600').delete()
            Evento.objects.filter(nombre__contains='UTH 2026').delete()
            User.objects.filter(email__in=[
                'soporte@uth.edu.mx',
                'admin@uth.edu.mx',
                'audi@demo.com',
                'softtech@demo.com',
                'logistica@demo.com',
                '20260001@uth.edu.mx',
                '20260002@uth.edu.mx',
                '20260003@uth.edu.mx',
                '20260004@uth.edu.mx',
            ]).delete()

        # 2. Usuarios Institucionales
        self.stdout.write(self.style.WARNING('\n[2/7] Generando Cuentas Institucionales (Soporte TI y Admin UTH)...'))
        
        user_soporte, _ = User.objects.get_or_create(
            email='soporte@uth.edu.mx',
            defaults={
                'nombres': 'Ingeniero',
                'apellido_paterno': 'Soporte',
                'apellido_materno': 'TI',
                'rol': 'soporte_ti',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True,
                'acepta_aviso_privacidad': True,
                'fecha_aviso_privacidad': timezone.now()
            }
        )
        user_soporte.set_password(password_comun)
        user_soporte.save()

        user_admin, _ = User.objects.get_or_create(
            email='admin@uth.edu.mx',
            defaults={
                'nombres': 'Mtra. Laura',
                'apellido_paterno': 'Sánchez',
                'apellido_materno': 'Contreras',
                'rol': 'admin_uth',
                'is_staff': True,
                'is_active': True,
                'acepta_aviso_privacidad': True,
                'fecha_aviso_privacidad': timezone.now()
            }
        )
        user_admin.set_password(password_comun)
        user_admin.save()
        self.stdout.write(self.style.SUCCESS('-> Cuentas institucionales listas (soporte@uth.edu.mx / admin@uth.edu.mx)'))

        # 3. Empresas Empleadoras
        self.stdout.write(self.style.WARNING('\n[3/7] Generando Empresas Empleadoras y Perfiles...'))
        
        empresas_data = [
            {
                'email': 'audi@demo.com',
                'nombres': 'Audi',
                'paterno': 'México',
                'materno': 'RH',
                'nombre_empresa': 'Audi México S.A. de C.V.',
                'domicilio': 'Boulevard Audi Sur No. 1, San José Chiapa, Puebla',
                'tel_oficina': '2222301000',
                'actividad': 'Manufactura automotriz premium y movilidad eléctrica',
                'giro': giro_manuf,
                'sector': sector_privado,
                'contacto': 'Lic. Andrea Morales Rojas',
                'cargo': 'Coordinadora de Reclutamiento Universitario'
            },
            {
                'email': 'softtech@demo.com',
                'nombres': 'SoftTech',
                'paterno': 'Solutions',
                'materno': 'Tech',
                'nombre_empresa': 'SoftTech Solutions S.A. de C.V.',
                'domicilio': 'Av. Juárez 2925, Col. La Paz, Puebla, Pue.',
                'tel_oficina': '2225678900',
                'actividad': 'Desarrollo de software empresarial, cloud y consultoría TI',
                'giro': giro_ti,
                'sector': sector_privado,
                'contacto': 'Ing. Carlos Méndez Trejo',
                'cargo': 'Líder de Adquisición de Talento Digital'
            },
            {
                'email': 'logistica@demo.com',
                'nombres': 'Transportes',
                'paterno': 'Altiplano',
                'materno': 'Logística',
                'nombre_empresa': 'Transportes y Logística del Altiplano',
                'domicilio': 'Parque Industrial Huejotzingo, Nave 4, Puebla',
                'tel_oficina': '2227891234',
                'actividad': 'Servicios de logística de cadena de suministro y distribución',
                'giro': giro_manuf,
                'sector': sector_privado,
                'contacto': 'Lic. Fernando Ortega Solís',
                'cargo': 'Jefe de Selección y Capital Humano'
            }
        ]

        empresas_dict = {}
        for ed in empresas_data:
            u_emp, _ = User.objects.get_or_create(
                email=ed['email'],
                defaults={
                    'nombres': ed['nombres'],
                    'apellido_paterno': ed['paterno'],
                    'apellido_materno': ed['materno'],
                    'rol': 'empresa',
                    'is_active': True,
                    'acepta_aviso_privacidad': True,
                    'fecha_aviso_privacidad': timezone.now()
                }
            )
            u_emp.set_password(password_comun)
            u_emp.save()

            emp, _ = Empresa.objects.update_or_create(
                user=u_emp,
                defaults={
                    'nombre': ed['nombre_empresa'],
                    'domicilio': ed['domicilio'],
                    'telefono_oficina': ed['tel_oficina'],
                    'correo_contacto': ed['email'],
                    'actividad_de_la_empresa': ed['actividad'],
                    'giro': ed['giro'],
                    'sector': ed['sector'],
                    'status': 'aprobada',
                    'nombre_contacto': ed['contacto'],
                    'cargo_contacto': ed['cargo']
                }
            )
            empresas_dict[ed['email']] = emp
            self.stdout.write(self.style.SUCCESS(f"-> Empresa creada: {ed['nombre_empresa']} ({ed['email']})"))

        # 4. Padrón Institucional y Egresados
        self.stdout.write(self.style.WARNING('\n[4/7] Generando Padrón Institucional Oficial y Egresados...'))
        
        egresados_data = [
            {
                'matricula': '20260001',
                'email': '20260001@uth.edu.mx',
                'nombres': 'Juan Carlos',
                'paterno': 'Pérez',
                'materno': 'Gómez',
                'curp': 'PERG020515HPLRMN01',
                'carrera': carrera_iti,
                'carrera_nombre': 'Ingeniería en Tecnologías de la Información',
                'nivel': 'ING_LIC',
                'genero': 'M',
                'celular': '2221234567',
                'colocado': False,
                'verificado': True
            },
            {
                'matricula': '20260002',
                'email': '20260002@uth.edu.mx',
                'nombres': 'María Elena',
                'paterno': 'López',
                'materno': 'Castro',
                'curp': 'LOPC010820MPLRST02',
                'carrera': carrera_iti,
                'carrera_nombre': 'Ingeniería en Tecnologías de la Información',
                'nivel': 'ING_LIC',
                'genero': 'F',
                'celular': '2222345678',
                'colocado': True,
                'verificado': True
            },
            {
                'matricula': '20260003',
                'email': '20260003@uth.edu.mx',
                'nombres': 'Roberto',
                'paterno': 'Sánchez',
                'materno': 'Vega',
                'curp': 'SANR000310HPLRMN03',
                'carrera': carrera_soft,
                'carrera_nombre': 'Ingeniería de Software',
                'nivel': 'ING_LIC',
                'genero': 'M',
                'celular': '2223456789',
                'colocado': False,
                'verificado': True
            },
            {
                'matricula': '20260004',
                'email': '20260004@uth.edu.mx',
                'nombres': 'Sofía',
                'paterno': 'Ramírez',
                'materno': 'Flores',
                'curp': 'RAMS021201MPLRFL04',
                'carrera': carrera_comp,
                'carrera_nombre': 'Ciencias de la Computación',
                'nivel': 'ING_LIC',
                'genero': 'F',
                'celular': '2224567890',
                'colocado': False,
                'verificado': False
            }
        ]

        egresados_dict = {}
        for egd in egresados_data:
            PadronEgresado.objects.update_or_create(
                matricula=egd['matricula'],
                defaults={
                    'nombre': f"{egd['nombres']} {egd['paterno']} {egd['materno']}",
                    'carrera': egd['carrera_nombre'],
                    'periodo': '2022-2026',
                    'anio_egreso': '2026',
                    'estatus_titulacion': 'Titulado',
                    'estatus_tsu': 'Concluido',
                    'genero': 'Masculino' if egd['genero'] == 'M' else 'Femenino',
                    'nivel': egd['nivel'],
                    'tel_escolares': egd['celular'],
                    'correo_escolares': egd['email'],
                    'domicilio': 'Huejotzingo Centro, Puebla',
                    'estado_domicilio': 'Puebla',
                    'municipio': 'Huejotzingo',
                    'curp': egd['curp'],
                    'telefono_movil': egd['celular'],
                    'correo_personal': f"{egd['nombres'].lower()}.personal@gmail.com"
                }
            )

            u_eg, _ = User.objects.get_or_create(
                email=egd['email'],
                defaults={
                    'nombres': egd['nombres'],
                    'apellido_paterno': egd['paterno'],
                    'apellido_materno': egd['materno'],
                    'rol': 'egresado',
                    'is_active': True,
                    'acepta_aviso_privacidad': True,
                    'fecha_aviso_privacidad': timezone.now()
                }
            )
            u_eg.set_password(password_comun)
            u_eg.save()

            eg_profile, _ = Egresado.objects.update_or_create(
                user=u_eg,
                defaults={
                    'matricula': egd['matricula'],
                    'curp': egd['curp'],
                    'carrera': egd['carrera'],
                    'telefono_celular': egd['celular'],
                    'domicilio': 'Av. Principal #45, Huejotzingo, Puebla',
                    'nivel_estudios': egd['nivel'],
                    'genero': egd['genero'],
                    'habilidades': 'Python, Django REST Framework, React, PostgreSQL, Docker, Git',
                    'colocado': egd['colocado'],
                    'es_verificado_padron': egd['verificado']
                }
            )
            egresados_dict[egd['matricula']] = eg_profile
            self.stdout.write(self.style.SUCCESS(f"-> Egresado creado: {egd['nombres']} {egd['paterno']} [{egd['matricula']}]"))

        # 5. Vacantes en distintos estados
        self.stdout.write(self.style.WARNING('\n[5/7] Publicando Vacantes en distintos estados (aprobadas, pendientes, cerradas)...'))
        
        # Vacante 1: Aprobada (SoftTech)
        vac_fullstack, _ = Vacante.objects.update_or_create(
            titulo='Desarrollador Full Stack Python / React',
            empresa=empresas_dict['softtech@demo.com'],
            defaults={
                'area_estudio': area_ti,
                'status': 'aprobada',
                'tipo_contratacion': 'tiempo_completo',
                'modalidad': 'hibrido',
                'num_candidatos': 2,
                'horario_trabajo': 'Lunes a Viernes de 9:00 a 18:00 hrs',
                'nivel_estudios': 'ING_LIC',
                'edad': '21 a 30 años',
                'genero': 'indistinto',
                'estado_civil': 'indistinto',
                'es_inclusiva': False,
                'experiencia': 'Prácticas profesionales, estadías o 6 meses en proyectos web',
                'conocimientos': 'Python, Django REST Framework, React, HTML5, CSS3, SQL',
                'habilidades': 'Resolución de problemas, trabajo en equipo ágil (Scrum)',
                'actitudes': 'Proactividad, compromiso y pasión por el aprendizaje continuo',
                'responsabilidades': 'Desarrollar y dar soporte a APIs RESTful y componentes UI en Next.js',
                'sueldo_minimo': 15000.00,
                'sueldo_maximo': 20000.00,
                'salario_a_tratar': False,
                'prestaciones': 'Prestaciones de ley, 12 días de vacaciones desde el 1er año, vales de despensa',
                'incluye_transporte': False,
                'incluye_comedor': False,
                'documentos_requeridos': 'CV en formato PDF y portafolio GitHub',
                'persona_contacto': 'Ing. Carlos Méndez',
                'entrevistador': 'Líder Técnico de Software'
            }
        )
        RequisitoIdioma.objects.get_or_create(
            vacante=vac_fullstack,
            idioma=idioma_ingles,
            defaults={'nivel': 'B2', 'obligatorio': True}
        )

        # Vacante 2: Aprobada con Transporte y Comedor (Audi México)
        vac_audi, _ = Vacante.objects.update_or_create(
            titulo='Ingeniero de Automatización y Sistemas Embebidos',
            empresa=empresas_dict['audi@demo.com'],
            defaults={
                'area_estudio': area_ti,
                'status': 'aprobada',
                'tipo_contratacion': 'indeterminado',
                'modalidad': 'presencial',
                'num_candidatos': 1,
                'horario_trabajo': 'Lunes a Viernes rol de turnos matutino / vespertino',
                'nivel_estudios': 'ING_LIC',
                'edad': 'Indistinto',
                'genero': 'indistinto',
                'estado_civil': 'indistinto',
                'es_inclusiva': True,
                'capacidades_especiales': 'Instalaciones y accesos adaptados para movilidad reducida',
                'experiencia': 'Estadías concluidas en áreas técnicas o afines',
                'conocimientos': 'Controladores lógicos programables, telemetría y redes industriales',
                'habilidades': 'Diagnóstico metódico de fallas y análisis de datos',
                'actitudes': 'Cultura de seguridad, puntualidad y disciplina operativa',
                'responsabilidades': 'Supervisar la comunicación de sensores en línea de ensamble automatizada',
                'sueldo_minimo': 18000.00,
                'sueldo_maximo': 24000.00,
                'salario_a_tratar': False,
                'prestaciones': 'Prestaciones superiores: seguro de gastos médicos mayores, fondo de ahorro 13%',
                'incluye_transporte': True,
                'incluye_comedor': True,
                'documentos_requeridos': 'CV, Carta de terminación de estudios UTH, CURP e INE',
                'persona_contacto': 'Lic. Andrea Morales',
                'entrevistador': 'Gerente de Planta de Automatización'
            }
        )
        RequisitoIdioma.objects.get_or_create(
            vacante=vac_audi,
            idioma=idioma_ingles,
            defaults={'nivel': 'B2', 'obligatorio': True}
        )
        RequisitoIdioma.objects.get_or_create(
            vacante=vac_audi,
            idioma=idioma_aleman,
            defaults={'nivel': 'A2', 'obligatorio': False}
        )

        # Vacante 3: Pendiente de Aprobación UTH (SoftTech)
        vac_pendiente, _ = Vacante.objects.update_or_create(
            titulo='Especialista Junior en Ciberseguridad e Infraestructura',
            empresa=empresas_dict['softtech@demo.com'],
            defaults={
                'area_estudio': area_ti,
                'status': 'pendiente',
                'tipo_contratacion': 'tiempo_completo',
                'modalidad': 'presencial',
                'num_candidatos': 1,
                'horario_trabajo': 'Lunes a Viernes de 8:30 a 17:30 hrs',
                'nivel_estudios': 'ING_LIC',
                'edad': 'Indistinto',
                'genero': 'indistinto',
                'estado_civil': 'indistinto',
                'es_inclusiva': False,
                'experiencia': 'Conocimientos de redes e infraestructura Linux',
                'conocimientos': 'Protocolos TCP/IP, cortafuegos, hardening de servidores y monitoreo',
                'habilidades': 'Investigación técnica y respuesta a incidentes',
                'actitudes': 'Ética profesional rigurosa y discreción',
                'responsabilidades': 'Monitorear registros de seguridad y auditar accesos en sistemas cloud',
                'sueldo_minimo': 16000.00,
                'sueldo_maximo': 21000.00,
                'salario_a_tratar': False,
                'prestaciones': 'Prestaciones de ley y certificaciones cubiertas por la empresa',
                'incluye_transporte': False,
                'incluye_comedor': False,
                'documentos_requeridos': 'CV actualizado',
                'persona_contacto': 'Ing. Carlos Méndez'
            }
        )

        # Vacante 4: Cerrada (Logística Altiplano)
        vac_cerrada, _ = Vacante.objects.update_or_create(
            titulo='Analista de Datos y Optimización de Rutas Logísticas',
            empresa=empresas_dict['logistica@demo.com'],
            defaults={
                'area_estudio': area_ti,
                'status': 'cerrada',
                'tipo_contratacion': 'tiempo_completo',
                'modalidad': 'presencial',
                'num_candidatos': 1,
                'horario_trabajo': 'Lunes a Viernes de 8:00 a 17:00 hrs',
                'nivel_estudios': 'ING_LIC',
                'edad': 'Indistinto',
                'genero': 'indistinto',
                'estado_civil': 'indistinto',
                'es_inclusiva': False,
                'experiencia': 'Manejo de hojas de cálculo avanzadas o SQL',
                'conocimientos': 'Optimización de cadenas de suministro, indicadores KPI logísticos',
                'habilidades': 'Pensamiento analítico y síntesis de reportes ejecutivos',
                'actitudes': 'Orientación a resultados y trabajo bajo presión',
                'responsabilidades': 'Elaborar modelos de proyección de consumo de combustible y tiempos de entrega',
                'sueldo_minimo': 12000.00,
                'sueldo_maximo': 15000.00,
                'salario_a_tratar': False,
                'prestaciones': 'Prestaciones de ley',
                'incluye_transporte': True,
                'incluye_comedor': False,
                'documentos_requeridos': 'CV',
                'persona_contacto': 'Lic. Fernando Ortega'
            }
        )
        self.stdout.write(self.style.SUCCESS('-> 4 Vacantes registradas (2 Aprobadas, 1 Pendiente de Filtro UTH, 1 Cerrada)'))

        # 6. Postulaciones y Colocaciones (Filtro UTH - Opción B)
        self.stdout.write(self.style.WARNING('\n[6/7] Creando Postulaciones en todas las etapas del Filtro UTH y Colocaciones...'))

        # Postulación 1: Enviada a Empresa (aprobada por UTH)
        Postulacion.objects.update_or_create(
            vacante=vac_fullstack,
            egresado=egresados_dict['20260001'],
            defaults={
                'estado': 'enviada_empresa',
                'notas_uth': 'Perfil idóneo. Cuenta con promedio destacado y dominio de Django verificado por UTH.'
            }
        )

        # Postulación 2: En Revisión UTH (Esperando decisión del Admin UTH)
        Postulacion.objects.update_or_create(
            vacante=vac_fullstack,
            egresado=egresados_dict['20260003'],
            defaults={
                'estado': 'revision_uth',
                'notas_uth': None
            }
        )

        # Postulación 3: Aceptada por la Empresa y Colocada (Audi México)
        Postulacion.objects.update_or_create(
            vacante=vac_audi,
            egresado=egresados_dict['20260002'],
            defaults={
                'estado': 'Aceptada',
                'notas_uth': 'Egresada con mención honorífica en estadía técnica.'
            }
        )
        Colocacion.objects.get_or_create(
            egresado=egresados_dict['20260002'],
            vacante=vac_audi,
            defaults={
                'registrado_por': user_admin,
                'observaciones': 'Colocación validada tras proceso exitoso de reclutamiento en planta Audi San José Chiapa.'
            }
        )

        # Postulación 4: Rechazada en Filtro UTH
        Postulacion.objects.update_or_create(
            vacante=vac_audi,
            egresado=egresados_dict['20260004'],
            defaults={
                'estado': 'rechazada_uth',
                'notas_uth': 'No cubre el requisito obligatorio de inglés B2 requerido por la planta.'
            }
        )

        # Postulación 5: Rechazada por la Empresa
        Postulacion.objects.update_or_create(
            vacante=vac_cerrada,
            egresado=egresados_dict['20260001'],
            defaults={
                'estado': 'Rechazada',
                'notas_uth': 'Perfil transferido a logística.'
            }
        )
        self.stdout.write(self.style.SUCCESS('-> Postulaciones creadas en estados: revision_uth, enviada_empresa, Aceptada (Colocada), rechazada_uth, Rechazada.'))

        # 7. Eventos de Empleabilidad
        self.stdout.write(self.style.WARNING('\n[7/7] Creando Eventos de Empleabilidad Institucionales...'))
        
        Evento.objects.update_or_create(
            nombre='Feria Virtual de Empleo Tecnológico UTH 2026',
            defaults={
                'tipo_evento': 'feria_empleo',
                'fecha_inicio': timezone.now() + timedelta(days=7),
                'fecha_fin': timezone.now() + timedelta(days=8),
                'lugar': 'Auditorio Central UTH y Transmisión en Línea',
                'descripcion': 'Encuentro de vinculación entre más de 30 empresas del corredor industrial Huejotzingo-Puebla y egresados de TSU e Ingeniería.',
                'is_active': True
            }
        )

        Evento.objects.update_or_create(
            nombre='Taller Práctico: Creación de CV de Alto Impacto y Entrevistas Técnicas',
            defaults={
                'tipo_evento': 'taller',
                'fecha_inicio': timezone.now() + timedelta(days=14),
                'fecha_fin': timezone.now() + timedelta(days=14, hours=4),
                'lugar': 'Laboratorio de Cómputo LC-2, Edificio B',
                'descripcion': 'Aprende a estructurar un CV con formato Harvard, preparar respuestas basadas en el método STAR y negociar ofertas de empleo.',
                'is_active': True
            }
        )
        self.stdout.write(self.style.SUCCESS('-> 2 Eventos de empleabilidad programados.'))

        # Resumen Final con Credenciales
        self.stdout.write(self.style.SUCCESS('\n======================================================================='))
        self.stdout.write(self.style.SUCCESS(' ¡POBLAMIENTO INTEGRAL COMPLETADO CON ÉXITO!'))
        self.stdout.write(self.style.SUCCESS('======================================================================='))
        self.stdout.write(self.style.WARNING('CREDENCIALES GENERALES DE ACCESO:'))
        self.stdout.write(f'Contraseña unificada para todas las cuentas: {self.style.MIGRATE_LABEL(password_comun)}\n')
        
        resumen_cuentas = [
            ('Soporte TI / Superuser', 'soporte@uth.edu.mx', 'Control total y administración técnica de Django'),
            ('Administrador UTH', 'admin@uth.edu.mx', 'Aprobación de vacantes, filtro de CVs y Dashboard'),
            ('Empresa (SoftTech)', 'softtech@demo.com', '1 vacante aprobada (con candidatos) y 1 pendiente'),
            ('Empresa (Audi México)', 'audi@demo.com', '1 vacante aprobada con egresada contratada'),
            ('Empresa (Logística)', 'logistica@demo.com', '1 vacante cerrada'),
            ('Egresado (Juan Carlos)', '20260001@uth.edu.mx', 'ITI - Postulación enviada a SoftTech'),
            ('Egresada (María Elena)', '20260002@uth.edu.mx', 'ITI - Contratada en Audi México (Colocada)'),
            ('Egresado (Roberto)', '20260003@uth.edu.mx', 'Software - Postulación en revisión por UTH'),
            ('Egresada (Sofía)', '20260004@uth.edu.mx', 'Computación - No verificada en padrón'),
        ]

        for rol, email, descripcion in resumen_cuentas:
            self.stdout.write(f" * {rol:<24}: {self.style.MIGRATE_LABEL(email):<32} -> {descripcion}")

        self.stdout.write(self.style.MIGRATE_HEADING('\nACCESOS DISPONIBLES:'))
        self.stdout.write(' - Frontend Next.js:     http://localhost:3000')
        self.stdout.write(' - Swagger API Docs:     http://localhost:8080/api/v1/docs')
        self.stdout.write(' - Dashboard Reportes:   http://localhost:8080/api/v1/reports/dashboard/')
        self.stdout.write(' - Django Admin:         http://localhost:8080/admin/\n')
