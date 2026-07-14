from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import Giro, Sector, AreaEstudio, Carrera, Idioma

class Command(BaseCommand):
    help = 'Poblar la base de datos con los catálogos iniciales del sistema'

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Iniciando carga de catálogos...'))

        # 1. Catálogo de Idiomas
        idiomas = ['Español', 'Inglés', 'Francés', 'Alemán', 'Chino Mandarín', 'Japonés', 'Portugués']
        for nombre in idiomas:
            obj, created = Idioma.objects.get_or_create(nombre=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Idioma creado: {nombre}'))

        # 2. Catálogo de Sectores
        sectores = ['Público', 'Privado', 'Social / ONG', 'Educativo']
        for nombre in sectores:
            obj, created = Sector.objects.get_or_create(nombre=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Sector creado: {nombre}'))

        # 3. Catálogo de Giros (Ejemplo básico, adapta el atributo según tu modelo Giro)
        giros = ['Tecnología de la Información', 'Finanzas y Banca', 'Salud y Medicina', 'Manufactura', 'Comercio Minorista']
        for nombre in giros:
            # NOTA: Ajusta 'nombre' si tu modelo Giro usa otro atributo (ej. 'descripcion')
            obj, created = Giro.objects.get_or_create(nombre=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Giro creado: {nombre}'))

        # 4. Catálogo de Áreas de Estudio
        areas = ['Ingeniería y Tecnología', 'Ciencias Exactas', 'Ciencias Económico-Administrativas', 'Ciencias Sociales y Humanidades', 'Ciencias de la Salud']
        for nombre in areas:
            obj, created = AreaEstudio.objects.get_or_create(nombre=nombre)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Área de estudio creada: {nombre}'))

        # 5. Catálogo de Carreras (Relacionadas a Ingeniería y Tecnología como ejemplo)
        # Aquí buscamos el área padre para asociar la llave foránea
        area_ing, _ = AreaEstudio.objects.get_or_create(nombre='Ingeniería y Tecnología')
        carreras_ing = [
            'Ciencias de la Computación',
            'Ingeniería en Sistemas Computacionales',
            'Ingeniería de Software',
            'Ingeniería en Tecnologías de la Información'
        ]
        for nombre in carreras_ing:
            # Asumiendo que Carrera tiene campos 'nombre' y 'area_estudio'
            obj, created = Carrera.objects.get_or_create(
                nombre=nombre,
                defaults={'area': area_ing}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Carrera creada: {nombre}'))

        self.stdout.write(self.style.SUCCESS('¡Carga de catálogos finalizada con éxito!'))