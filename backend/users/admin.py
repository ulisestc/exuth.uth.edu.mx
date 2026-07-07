from django.contrib import admin
from .models import User

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ('pk', 'email', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol', 'is_active','deactivated_at', 'is_superuser', 'is_staff', 'date_joined', 'last_login')
    # list_filter = ('rol', 'is_active')
    search_fields = ('email', 'nombres', 'apellido_paterno', 'apellido_materno', 'rol')

    # Interceptamos el evento de guardar en la base de datos
    def save_model(self, request, obj, form, change):
        # Si la contraseña existe y no está encriptada ya por Django (pbkdf2)
        if obj.password and not obj.password.startswith('pbkdf2_'):
            obj.set_password(obj.password) # Aplica el hash seguro
        
        super().save_model(request, obj, form, change)

admin.site.register(User, UserAdmin)