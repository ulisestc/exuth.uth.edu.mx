from rest_framework.routers import DefaultRouter
from .views import CustomUserViewSet, ReactivateAccountRequestView, ReactivateAccountConfirmView
from django.urls import path

router = DefaultRouter()

#registrar viewset de usuarios personalizados
router.register(r'users', CustomUserViewSet, basename='custom_users')

# Exponer
urlpatterns = [
    path('reactivate/request/', ReactivateAccountRequestView.as_view(), name='reactivate-request'),
    path('reactivate/confirm/', ReactivateAccountConfirmView.as_view(), name='reactivate-confirm'),
] + router.urls