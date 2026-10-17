# Sistema Bolsa de Trabajo UTH

## Correr el proyecto

##### 1. Clonar el repositorio: 
```shell
git clone git@github.com:ulisestc/exuth.uth.edu.mx.git
cd exuth.uth.edu.mx
```
------------
##### 2. Configurar las variables de entorno:
El proyecto no correrá sin variables de entorno, para ello copia el archivo **.env.example**
```shell
cp .env.example .env
```

Abre el archivo .env y configura los valores locales, **DB_HOST** debe ser "db"

------------
##### 3. Levantar el entorno (build)
Este comando descarga MySQL, instala dependencias de Python y levanta el servidor:
```shell
docker compose up --build
```
------------
##### 4. Inicializar la Base de Datos
En otra terminal, ejecutar las migraciones para crear las tablas:
```shell
docker compose exec backend python manage.py migrate
```
------------
##### 5. Poblamiento de Datos de Prueba y Catálogos

El sistema incluye dos comandos de gestión según el tipo de prueba que desees realizar:

###### A) Carga de Catálogos Base (`seed_catalogs`)
Puebla únicamente las tablas paramétricas del sistema (idiomas, giros empresariales, sectores, áreas de estudio y carreras universitarias de la UTH):
```shell
docker compose exec backend python manage.py seed_catalogs
```

###### B) Escenario Completo de Prueba Integral (`seed_demo_data`)
**¿Qué hace este comando?**
Genera un ecosistema de datos de prueba completo y realista para probar todos los roles en el Frontend (Next.js), Swagger y Django Admin:
* **Garantía de catálogos:** Ejecuta automáticamente `seed_catalogs` si los catálogos aún no están cargados.
* **Cuentas de usuario con roles RBAC:** Crea usuarios institucionales, empresas y egresados con la contraseña unificada: **`Password123!`**.
* **Padrón Institucional Oficial (`PadronEgresado`):** Inserta 4 registros de alumnos para probar el cotejo automático y manual de matrícula.
* **Ofertas de Empleo (`Vacante`):** Registra vacantes en todos los estados del ciclo de vida (2 aprobadas y públicas, 1 pendiente de moderación UTH y 1 cerrada).
* **Flujo de Postulación con Filtro UTH (Opción B):** Crea postulaciones en cada estado del flujo (`revision_uth`, `enviada_empresa`, `Aceptada` con colocación automática, `rechazada_uth` y `Rechazada`).
* **Eventos de Empleabilidad:** Programa ferias y talleres de vinculación laboral.

**Ejecución:**
```shell
docker compose exec backend python manage.py seed_demo_data

# O si deseas limpiar previamente datos de prueba anteriores:
docker compose exec backend python manage.py seed_demo_data --clean
```

**Credenciales de Acceso de Prueba (Contraseña unificada: `Password123!`):**
| Rol | Correo Electrónico | Descripción y Caso de Prueba |
| :--- | :--- | :--- |
| **Soporte TI / Superuser** | `soporte@uth.edu.mx` | Acceso total y administración técnica en `/admin/`. |
| **Administrador UTH** | `admin@uth.edu.mx` | Aprobación de vacantes, filtro de CVs (Opción B) y dashboard de reportes. |
| **Empresa (SoftTech)** | `softtech@demo.com` | 1 vacante aprobada con candidatos turnados y 1 vacante pendiente. |
| **Empresa (Audi México)** | `audi@demo.com` | 1 vacante aprobada con egresada contratada/colocada. |
| **Empresa (Logística)** | `logistica@demo.com` | 1 vacante cerrada/concluida. |
| **Egresado (Juan Carlos)** | `20260001@uth.edu.mx` | ITI - Postulación validada por UTH y turnada a SoftTech. |
| **Egresada (María Elena)** | `20260002@uth.edu.mx` | ITI - Contratada en Audi México (`colocado = True`). |
| **Egresado (Roberto)** | `20260003@uth.edu.mx` | Software - Postulación en espera de revisión por la UTH. |
| **Egresada (Sofía)** | `20260004@uth.edu.mx` | Computación - Caso de egresada no verificada en padrón. |

------------
##### 6. Suite de Pruebas Automatizadas

###### A) Prueba Transaccional End-to-End (`test_e2e_flow`)
**¿Qué hace este comando?**
Ejecuta una prueba integral automatizada en ~3 segundos mediante `APIClient`. Simula el ciclo de vida transaccional completo paso a paso y valida el cumplimiento estricto de las reglas de negocio:
1. Autenticación JWT de todos los roles (`/api/v1/auth/jwt/create/`).
2. Empresa publica oferta laboral -> Verifica que nazca en estado `pendiente` y oculta para egresados.
3. Admin UTH modera y aprueba vacante -> Cambia a `aprobada` y se vuelve pública en el tablón.
4. Egresado se postula -> Nace en `revision_uth` (Filtro Opción B oculta el CV a la empresa).
5. Admin UTH dictamina y aprueba CV -> Pasa a `enviada_empresa` y aparece en la bandeja de la empresa.
6. Empresa evalúa y acepta candidato (`Aceptada`).
7. Trigger de Colocación Laboral -> Genera registro en `Colocacion` y marca `egresado.colocado = True`.
8. Dashboard de Reportes -> Consulta `GET /api/v1/reports/dashboard/` y verifica métricas en tiempo real.
9. Depuración automática -> Limpia las entidades de prueba generadas para dejar la base en estado limpio.

**Ejecución:**
```shell
docker compose exec backend python manage.py test_e2e_flow
```

###### B) Pruebas Unitarias de Caja Blanca
Ejecuta la suite completa de 47 pruebas unitarias de Django REST Framework:
```shell
docker compose exec backend python manage.py test
```

------------
#### Accesos y Servicios Locales
* **Frontend (Next.js):** http://localhost:3000
* **Backend API (DRF):** http://localhost:8080/api/v1/
* **Documentación Swagger:** http://localhost:8080/api/v1/docs
* **Panel de Administración Django:** http://localhost:8080/admin/
* **Servidor de Correos de Prueba (smtp4dev):** http://localhost:5000 (Bandeja web)
* **Base de Datos (MySQL 8):** Puerto 3307 (externo) / 3306 (interno)
