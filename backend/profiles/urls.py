from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EgresadoViewSet, EmpresaViewSet, PadronEgresadoViewSet

router = DefaultRouter()
router.register(r'egresados', EgresadoViewSet, basename='egresado')
router.register(r'empresas', EmpresaViewSet, basename='empresa')
router.register(r'padron', PadronEgresadoViewSet, basename='padron')

urlpatterns = router.urls