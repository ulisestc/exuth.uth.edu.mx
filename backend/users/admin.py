from django.contrib import admin
from .models import User

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol', 'is_active','is_deactivated', 'is_superuser', 'is_staff', 'date_joined', 'last_login')
    # list_filter = ('rol', 'is_active')
    search_fields = ('email', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol')

admin.site.register(User, UserAdmin)