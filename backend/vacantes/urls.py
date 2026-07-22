from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VacanteViewSet, PostulacionViewSet

router = DefaultRouter()
router.register(r'postulaciones', PostulacionViewSet, basename='postulacion')
router.register(r'', VacanteViewSet, basename='vacante')

urlpatterns = [
    path('', include(router.urls)),
]