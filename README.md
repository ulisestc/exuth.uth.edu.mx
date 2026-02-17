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
##### 5. Crear superusuario
Para entrar al panel de administración de django, se crea un superusuario:
```shell
docker compose exec backend python manage.py createsuperuser
```
------------
#### Accesos
- Backend API: http://localhost:8080
- Admin Panel: http://localhost:8080/admin/
