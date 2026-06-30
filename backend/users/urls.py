from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet

router = DefaultRouter()

#registrar viewset de usuarios personalizados
router.register(r'users', CustomUserViewSet, basename='custom_users')

# Exponer
urlpatterns = router.urls