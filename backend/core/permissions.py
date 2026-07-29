from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        # 1. ¿Es una petición de lectura? (GET, HEAD, OPTIONS)
        if request.method in permissions.SAFE_METHODS:
            return True  # Cualquiera (o cualquier autenticado) puede leer
            
        # 2. Si no es un método seguro (es POST, PUT, DELETE...), verificamos el rol
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.rol in ['admin_uth', 'soporte_ti'] or request.user.is_superuser)
        )