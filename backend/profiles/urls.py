from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EgresadoViewSet, EmpresaViewSet

router = DefaultRouter()
router.register(r'egresados', EgresadoViewSet, basename='egresado')
router.register(r'empresas', EmpresaViewSet, basename='empresa')

urlpatterns = router.urls