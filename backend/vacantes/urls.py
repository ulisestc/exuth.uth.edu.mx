from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VacanteViewSet

router = DefaultRouter()
router.register(r'', VacanteViewSet, basename='vacante')

urlpatterns = [
    path('', include(router.urls)),
]