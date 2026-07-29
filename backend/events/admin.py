from django.contrib import admin

from .models import Evento


@admin.register(Evento)
class EventoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo_evento', 'fecha_inicio', 'fecha_fin', 'lugar', 'is_active')
    list_filter = ('tipo_evento', 'is_active')
    search_fields = ('nombre', 'lugar', 'descripcion')
    ordering = ('-fecha_inicio',)
    fields = (
        'nombre',
        'tipo_evento',
        'fecha_inicio',
        'fecha_fin',
        'lugar',
        'descripcion',
        'is_active',
    )
    list_per_page = 20
