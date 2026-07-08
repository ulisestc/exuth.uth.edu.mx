from django.contrib import admin
from .models import Giro, Idioma, Sector, AreaEstudio, Carrera

# Register your models here.
admin.site.register(Giro)
admin.site.register(Sector)
admin.site.register(AreaEstudio)
admin.site.register(Carrera)
admin.site.register(Idioma)