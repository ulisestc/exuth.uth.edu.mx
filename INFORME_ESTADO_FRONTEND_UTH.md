# INFORME DE ESTADO Y AVANCE: FRONTEND BOLSA DE TRABAJO UTH
================================================================================
Institución: Universidad Tecnológica de Huejotzingo (Puebla, México)
Plataforma: exuth.uth.edu.mx
Fecha de emisión: 28 de Septiembre de 2026
Encargado de Frontend: Johan Yuri Martínez García
================================================================================

ESTADO ACTUAL DE LOS SERVICIOS:
- Backend API (Django REST Framework):  [ACTIVO]  http://localhost:8080/api/v1/
- Documentación Swagger de la API:     [ACTIVO]  http://localhost:8080/api/v1/docs
- Panel de Administración Django:      [ACTIVO]  http://localhost:8080/admin/
- Base de Datos (MySQL 8 en Docker):    [ACTIVO]  Puerto 3307 (interno 3306)
- Servidor de Correos (smtp4dev):       [ACTIVO]  http://localhost:5000 (Web UI)
- Frontend (Next.js 16 + Tailwind CSS): [ACTIVO]  http://localhost:3000

--------------------------------------------------------------------------------
1. DIAGNÓSTICO INICIAL Y RESOLUCIÓN DE BLOQUEOS
--------------------------------------------------------------------------------
Al inicio del proyecto se presentaron bloqueos de entorno que fueron resueltos
satisfactoriamente:

1.1. Docker Compose:
  - Error: "unknown shorthand flag: 'd' in -d"
  - Causa: El sistema operativo no contaba con el plugin oficial de Docker Compose.
  - Solución: Se descargó e instaló el binario oficial de Docker Compose (v5.5.1)
    en el espacio de usuario (~/.docker/cli-plugins/docker-compose).

1.2. Permisos de Docker:
  - Error: "permission denied while trying to connect to docker.sock"
  - Causa: El usuario "yuri" no pertenecía al grupo del sistema "docker".
  - Solución: Se agregó el usuario al grupo con `sudo usermod -aG docker $USER` y
    se activaron los permisos con `newgrp docker`.

1.3. Variables de Entorno (.env):
  - Problema: El archivo .env existía pero todas sus variables estaban vacías.
  - Solución: Se configuró con parámetros locales para la base de datos "exuth_db",
    usuario "exuth_user", contraseñas seguras, host de base de datos "db" y el
    servidor de correo "smtp4dev".

1.4. Inicialización de la Base de Datos:
  - Se aplicaron todas las migraciones pendientes (`python manage.py migrate`).
  - Se creó el superusuario administrador inicial: johanyuri24@gmail.com.
  - Se corrigió el arranque sincronizado entre MySQL y Django.

1.5. Entorno Node.js:
  - Se instaló Fast Node Manager (fnm) y Node.js v24 LTS con npm para ejecutar
    el stack de JavaScript/TypeScript sin requerir permisos de administrador.

--------------------------------------------------------------------------------
2. SISTEMA DE DISEÑO INSTITUCIONAL (frontend/DESIGN.md)
--------------------------------------------------------------------------------
A solicitud explícita del cliente y respetando como fuente ÚNICA y EXCLUSIVA
el "Manual de Identidad Gráfica Institucional - Agosto 2021" de la UTH, se creó
el archivo frontend/DESIGN.md que define los tokens de diseño de la plataforma:

2.1. Colores Principales:
  - Verde Institucional UTH (Pantone Green C):
    HEX: #00A887 | RGB: 0, 168, 135 | CMYK: 100%, 0%, 65%, 0%
    Rol: Color rector (botones principales de acción, estados activos, badges).
  - Negro Institucional UTH (Pantone Black C):
    HEX: #2D2926 | RGB: 45, 41, 38 | CMYK: 65%, 66%, 68%, 82%
    Rol: Color base para tipografías principales (H1-H4), contraste y footer.

2.2. Colores Complementarios Oficiales (Página 12 del Manual):
  - Vino / Guinda Institucional (Pantone 7421):
    HEX: #691C32 | RGB: 105, 28, 50
    Rol: Pleca superior oficial y acentos institucionales.
  - Rojo de Alerta (Pantone 7426):
    HEX: #A8123E | RGB: 168, 18, 62
    Rol: Mensajes de error, vacantes rechazadas o acciones destructivas.
  - Dorado / Arena (Pantone 453):
    HEX: #C2BA98 | RGB: 194, 186, 152
    Rol: Pleca complementaria, insignias y reconocimientos.
  - Crema Institucional (Pantone 7527):
    HEX: #D6D1C4 | RGB: 214, 209, 196
    Rol: Fondos suaves y contenedores alternativos.
  - Gris Claro (Pantone Cool Gray):
    HEX: #A6A6A8
    Rol: Bordes de inputs, divisores y placeholders.
  - Gris Oscuro (Pantone Gray):
    HEX: #636569
    Rol: Textos secundarios y metadatos de vacantes.

2.3. Tipografía Oficial:
  - Arial / Sans-serif limpia: Fuente obligatoria para la interfaz web.
  - Times New Roman: Reservada para informes solemnes y documentos descargables.

2.4. Protección de Marca e Imagotipo:
  - Isotipo de la cabeza de Quetzalcóatl Náhuatl (símbolo de cambio y evolución positiva).
  - Convivencia Horizontal obligatoria en la barra de navegación web.
  - Convivencia Vertical en portadas y pantallas de acceso.
  - Área de protección mínima de 1X alrededor del logotipo.

--------------------------------------------------------------------------------
3. MÓDULOS Y PANTALLAS CONSTRUIDAS EN EL FRONTEND
--------------------------------------------------------------------------------
Tecnologías empleadas: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
Lucide React Icons.

3.1. Componentes Globales:
  - UthLogo.tsx: Componente SVG vectorial con las variantes horizontal y vertical.
  - Navbar.tsx: Barra de navegación institucional con la pleca superior oficial
    en dos tintas (Guinda #691C32 y Dorado #C2BA98), enlaces y accesos por rol.
  - Footer.tsx: Pie de página con el domicilio legal (Santa Ana Xalmimilulco,
    Huejotzingo, Pue.), teléfonos de atención, correo institucional y marco de privacidad.

3.2. Página de Inicio / Landing Page (src/app/page.tsx):
  - Hero institucional con título y subtexto normativo.
  - Buscador rápido con filtros por palabra clave y modalidad.
  - Métricas de vinculación (15+ TSU, 10+ Ingenierías, 40 km de radio, 42 municipios).
  - Tarjetas de acceso a los tres portales (Egresados, Empresas y Vinculación).
  - Vista previa de vacantes recientes.

3.3. Catálogo de Vacantes con Filtros Vivos (src/app/vacantes/page.tsx):
  - Barra lateral de filtros interactivos (JobFilters.tsx):
    * Búsqueda por texto.
    * Nivel de estudios (Todos, TSU, Ingeniería / Licenciatura).
    * Área de estudio (dinámica desde la base de datos).
    * Modalidad (Presencial, Híbrido, Home Office).
    * Beneficio de Transporte UTH.
    * Ordenamiento (Más recientes, Mayor salario, Menor salario).
  - Tarjetas de vacantes (JobCard.tsx) con salarios en formato moneda ($ MXN).
  - Estado de resultados vacíos (Empty State).

3.4. Detalle Individual de Vacante (src/app/vacantes/[id]/page.tsx):
  - Clave de vacante oficial (ej. UTH-2026-VAC-6C909A).
  - Ficha técnica completa: horario, contratación, plazas disponibles.
  - Actividades y responsabilidades del puesto.
  - Perfil requerido: experiencia, conocimientos técnicos, habilidades y actitudes.
  - Prestaciones y beneficios de ley/superiores.
  - Documentos necesarios para postularse.
  - Sello de validación por el Departamento de Vinculación UTH.
  - Botón de acción: "Postularme a esta Vacante".

--------------------------------------------------------------------------------
4. AJUSTES REALIZADOS EN EL BACKEND (DJANGO)
--------------------------------------------------------------------------------
4.1. Habilitación de CORS:
  - Se configuró el puerto 3000 (http://localhost:3000) en `CORS_ALLOWED_ORIGINS`
    en backend/config/settings.py para permitir la comunicación con Next.js.

4.2. Permisos de Lectura Pública:
  - Se cambió la política a `IsAuthenticatedOrReadOnly` en VacanteViewSet y
    `IsAdminOrReadOnly` en los catálogos de core/views.py para permitir la
    exploración pública del catálogo sin forzar login prematuro.

4.3. Optimización de Serializadores:
  - Se incluyeron los campos calculados `empresa_nombre` y `area_estudio_nombre`
    en VacanteSerializer para optimizar la carga del frontend.

4.4. Carga de Catálogos y Datos de Prueba:
  - Se ejecutó el comando `seed_catalogs` para poblar idiomas, sectores, giros
    y áreas de estudio.
  - Se registraron 3 vacantes reales de prueba con diferentes perfiles académicos.

--------------------------------------------------------------------------------
5. VERIFICACIÓN TÉCNICA
--------------------------------------------------------------------------------
- Compilación del proyecto frontend:
  Comando: `npm run build`
  Resultado: Exitoso (0 errores, 0 advertencias, 5 rutas estáticas y dinámicas compiladas).
- Estado de los puertos en local:
  * Backend API:  http://localhost:8080/api/v1/vacantes/  -> HTTP 200 OK
  * Catálogo Web: http://localhost:3000/vacantes          -> HTTP 200 OK
  * Detalle Web:  http://localhost:3000/vacantes/1        -> HTTP 200 OK

--------------------------------------------------------------------------------
6. HOJA DE RUTA: QUÉ SIGUE A CONTINUACIÓN
--------------------------------------------------------------------------------
Para completar el flujo integral de la bolsa de trabajo, los siguientes pasos son:

PASO 1: MÓDULO DE AUTENTICACIÓN Y REGISTRO (/login y /registro)
  - Pantalla de Login unificada conectada al endpoint JWT (/api/v1/auth/jwt/create/).
  - Almacenamiento seguro del token de sesión (access y refresh).
  - Redirección automática según el rol del usuario (Egresado vs Empresa vs Admin).
  - Pantalla de Registro con pestañas diferenciadas:
    * Egresado: Matrícula UTH, CURP, carrera, correo y contraseña.
    * Empresa: Razón social, RFC, nombre comercial, giro, sector y contacto de RH.

PASO 2: ACTIVACIÓN DEL FLUJO DE POSTULACIÓN
  - Conectar el botón "Postularme a esta Vacante" para enviar la petición a
    `/api/v1/vacantes/postulaciones/` con el token del egresado autenticado.
  - Estado inicial de la postulación: "En revisión por UTH".

PASO 3: PORTAL DEL EGRESADO (/portal-egresado)
  - Gestión de perfil profesional y subida de CV en formato PDF.
  - Historial de postulaciones con seguimiento de estatus en tiempo real:
    (En revisión UTH -> Enviada a Empresa -> Aceptada / Rechazada).

PASO 4: PORTAL DE LA EMPRESA (/portal-empresa)
  - Formulario institucional para publicar nuevas ofertas de trabajo.
  - Panel para visualizar candidatos aprobados por la UTH y descargar sus CVs.

PASO 5: PANEL DE ADMINISTRACIÓN Y VINCULACIÓN UTH (/admin-uth)
  - Filtro y validación de vacantes registradas por empresas.
  - Validación de candidatos antes de enviar los perfiles a las organizaciones.
  - Generación de reportes institucionales normativos.
================================================================================
