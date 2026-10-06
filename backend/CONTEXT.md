# EXUTH Backend - Contexto de Proyecto, Arquitectura y Reglas de Negocio

## 1. Visión General

Plataforma web transaccional institucional de Bolsa de Trabajo de la Universidad Tecnológica de Huejotzingo (UTH), operada por el Departamento de Desempeño de Egresados[cite: 2]. El sistema conecta a egresados con empresas, pero la UTH mantiene un control estricto sobre el flujo de información, vacantes y perfiles de usuarios.

## 2. Stack Tecnológico y Arquitectura Central

* **Core:** Python, Django, Django REST Framework (DRF).
* **Frontend:** Next.js (React), comunicándose vía REST API con JWT y CORS configurado (`CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS`).
* **Seguridad y Autenticación (REQ-1, REQ-2, REQ-12):** JWT (Djoser), Control de Acceso Basado en Roles (RBAC), encriptación de contraseñas, registro de consentimiento de aviso de privacidad (`acepta_aviso_privacidad` con timestamp automático) y borrado lógico ("Soft Delete") generalizado.[cite: 3]
* **Gestión Documental (REQ-9, REQ-16):** Carga y almacenamiento seguro en directorios aislados de CVs (PDF/Word), con entrega protegida mediante `FileResponse` y endpoints dedicados de autoservicio (`/me/cv/`).[cite: 3]
* **Procesamiento Asíncrono (REQ-18):** Tareas programadas/background para envío de notificaciones automáticas mediante agrupamiento y BCC.[cite: 3]

## 3. Entidades y Reglas de Negocio (Actualizadas a Octubre 2026)

### A. Gestión de Roles y Permisos

1. **Administrador UTH:** Tiene control total. Gestiona el padrón (activar/desactivar) (REQ-12)[cite: 3], modera vacantes (REQ-8)[cite: 3], filtra postulaciones y genera reportes estadísticos y tabulares (REQ-17)[cite: 3].
2. **Empresa Empleadora:**
   * **Registro (REQ-1):** Nace activa en el sistema y puede iniciar sesión inmediatamente (el registro no requiere aprobación de la UTH).[cite: 3]
   * **Vacantes (REQ-11, REQ-10):** Toda vacante publicada nace con estado `PENDIENTE` y permanece oculta para egresados y anónimos hasta ser aprobada por el Administrador UTH.[cite: 3]
   * **Gestión de Ofertas:** Cuenta con endpoints de autoservicio como `GET /api/v1/vacantes/mis-vacantes/` (consulta de todas sus ofertas sin importar el estado) y `PATCH /api/v1/vacantes/{id}/cerrar-vacante/` para cierre directo de convocatorias concluidas.
3. **Egresado:**
   * **Creación de Cuenta (Doble Control):** Al registrarse, el sistema coteja automáticamente su matrícula contra el Padrón Institucional. Si la matrícula existe, se asigna `es_verificado_padron = True`. Si no existe, se permite el registro pero con `es_verificado_padron = False` para requerir una validación manual complementaria por parte de la UTH (prevención de falsos positivos/negativos sin bloquear el acceso).
   * **Correos:** Posee un correo institucional (`matricula@uth.edu.mx`) y un correo personal alternativo otorgado voluntariamente.
   * **Autoservicio y CV:** Endpoints dedicados `GET / PATCH /api/v1/profiles/egresados/me/` y `GET / DELETE /api/v1/profiles/egresados/me/cv/` para administración directa de su expediente y currículum.
   * **Postulaciones (REQ-3):** Carga su perfil y postulación.[cite: 3]

### B. Flujos Transaccionales Críticos (Acordados Operativamente)

* **Exploración Pública de Catálogos y Vacantes:**
  * **Catálogos Core (`core/`):** Lectura pública (`IsAdminOrReadOnly`) para alimentar los formularios de registro de egresados y empresas sin requerir autenticación previa.
  * **Vacantes (`vacantes/`):** Lectura pública (`IsAuthenticatedOrReadOnly`), pero estrictamente filtrada en base de datos (`get_queryset()`):
    * Usuarios anónimos y egresados **solo** ven vacantes con `status='aprobada'`.
    * Empresas ven vacantes aprobadas más sus propias vacantes creadas.
    * Administradores UTH ven todas las vacantes.
  * **Optimización de Rendimiento (Anti N+1):** El queryset base de vacantes aplica `select_related('empresa', 'area_estudio')`, `prefetch_related('requisitos_idioma__idioma')` y anotación de agregación `annotate(num_postulaciones=Count('postulaciones'))`, entregando `empresa_nombre`, `area_estudio_nombre` y `num_postulaciones` en solo 2 consultas fijas.
* **Flujo de Vacantes:** `Empresa crea vacante` -> `Estado: PENDIENTE` -> `Admin UTH revisa y aprueba` -> `Estado: APROBADA (Pública)` -> `Notificación a Egresados de la carrera afín`.
* **Flujo de Postulación (Filtro UTH - Opción B):**
  1. `Egresado se postula` -> Nace en `revision_uth` (oculta para la empresa).
  2. `Admin UTH evalúa el CV`:
     * Si no cumple: `rechazada_uth` (con `notas_uth`, se detiene el flujo).
     * Si cumple: `enviada_empresa` (`POST /api/v1/vacantes/postulaciones/{id}/aprobar-uth/`).
  3. `Empresa evalúa candidato`:
     * `Aceptada`: Candidato contratado -> Genera automáticamente registro de `Colocacion` laboral (`egresado.colocado = True`).
     * `Rechazada`: Candidato descartado por la empresa.

## 4. Estado Actual del Desarrollo

* **Fases 1, 2 y 3 (Completadas):** Motor de seguridad JWT y RBAC, gestor documental, catálogos dinámicos, creación de vacantes y sistema de notificaciones por email anti-spam (resúmenes diarios, alertas de cambios y protección de inactividad).
* **Fase 4 (Completada):**
  * **Módulo de Padrón de Egresados (`profiles/`):** Modelo `PadronEgresado` (78 columnas) y endpoint de importación masiva `POST /api/v1/profiles/padron/importar/` con *upsert* por matrícula y validación complementaria `PATCH /api/v1/profiles/egresados/{id}/verificar-padron/`.
  * **Módulo de Reportes e Inteligencia de Negocios (`reports/`):** Dashboard analítico `GET /api/v1/reports/dashboard/` (tasa de colocación, vacantes vigentes, egresados colocados) y 5 reportes tabulares (`egresados`, `vacantes`, `postulaciones`, `colocaciones`, `empresas`) con exportación a JSON, Excel (`openpyxl`) y PDF (`reportlab`).
  * **Ajuste de Flujo de Postulación:** Implementación del filtro institucional UTH (Opción B) y endpoints de moderación.
  * **Streaming Seguro de Documentos:** Endpoints protegidos `GET /api/v1/profiles/egresados/{id}/cv/` y `/documentos/` con `FileResponse` y `Content-Disposition`.
* **Infraestructura de Pruebas:**
  * **Caja Blanca (Unitarias):** 47 pruebas automatizadas en Django (`python manage.py test`), 100% pasando.
  * **Caja Negra (Postman):** 129 peticiones HTTP en `/postman/collections/` (63 Happy Paths y 66 Sad Paths).

## 5. Arquitectura del Motor de Importación (Fase 4)

* **Fuente de Verdad:** Archivo Excel (`.xlsx`) extraído del sistema de Servicios Escolares con 78 columnas.
* **Llave Única de Integridad:** El campo `Matricula`. Se utiliza para ejecutar una lógica de "Upsert" (Actualizar/Crear) mediante `update_or_create` en el ORM de Django, previniendo duplicados absolutos.
* **Manejo de Emails y Teléfonos:** Mapea el correo institucional (`matricula@uth.edu.mx`), correo de escolares, correo personal alternativo y teléfonos móvil y de casa.
* **Sincronización Automática:** Al finalizar la importación, el sistema actualiza automáticamente a `es_verificado_padron = True` a todos los egresados registrados cuyas matrículas coincidan con el archivo.

## 6. Directivas Estrictas para el Asistente AI (System Prompt)

* **Rol:** Actúa exclusivamente como un Ingeniero de Software Senior / Arquitecto Backend.
* **Metodología Socrática:** Guía el desarrollo mediante preguntas estratégicas, fragmentos de pseudocódigo, referencias a la documentación de Django o explicación de patrones de diseño.
* **Manejo de Errores:** Si el código presenta fallas de lógica o excepciones, no las corrijas directamente. Indica la línea problemática y explica qué concepto del framework o arquitectura se está aplicando de manera incorrecta para que el desarrollador construya su propia solución.
