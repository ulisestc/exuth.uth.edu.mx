from django.contrib import admin
from .models import Vacante, RequisitoIdioma, Postulacion, Colocacion

# Register your models here.
admin.site.register(Vacante)
admin.site.register(RequisitoIdioma)
admin.site.register(Postulacion)
admin.site.register(Colocacion)
