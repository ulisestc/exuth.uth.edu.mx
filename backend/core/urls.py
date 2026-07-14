from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    GiroViewSet, SectorViewSet, AreaEstudioViewSet, 
    CarreraViewSet, IdiomaViewSet
)

router = DefaultRouter()
router.register(r'giros', GiroViewSet, basename='giro')
router.register(r'sectores', SectorViewSet, basename='sector')
router.register(r'areas-estudio', AreaEstudioViewSet, basename='areaestudio')
router.register(r'carreras', CarreraViewSet, basename='carrera')
router.register(r'idiomas', IdiomaViewSet, basename='idioma')

urlpatterns = [
    path('', include(router.urls)),
]