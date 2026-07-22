from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permisos personalizados para permitir que solo el propietario de un objeto pueda editarlo.
    Los usuarios autenticados pueden ver los objetos, pero solo el propietario puede modificarlos.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.rol in ['soporte_ti', 'admin_uth'] or request.user.is_superuser:
            return True  # Usuarios con rol de soporte o admin pueden editar cualquier objeto
        # Write permissions are only allowed to the owner of the object.
        return obj.user == request.user

class IsEmpresaAprobadaOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow approved companies to create or edit objects.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True  # SAFE METHODS aprobados para todos
        if request.user.rol in ['soporte_ti', 'admin_uth'] or request.user.is_superuser:
            return True  # Usuarios con rol de soporte o admin pueden crear/editar
        if not hasattr(request.user, 'empresa'):
            return False
        # Check if the empresa is approved
        return request.user.empresa.status == 'aprobada'