from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAuthE2ETests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # Estos son los datos reales que el modelo acepta
        self.user_model_data = {
            "email": "nuevo@test.com",
            "password": "StrongPassword123!",
            "nombres": "Aarón",
            "apellido_paterno": "Torres",
            "apellido_materno": "Corte",
            "rol": "egresado" 
        }
        # Djoser necesita estos extras para el registro
        self.djoser_data = self.user_model_data.copy()
        self.djoser_data["re_password"] = "StrongPassword123!"

    def test_registro_usuario_djoser(self):
        response = self.client.post('/api/v1/auth/users/', self.djoser_data)
        if response.status_code != status.HTTP_201_CREATED:
            print("ERROR DE DJOSER DETALLADO:", response.data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_generacion_token_jwt(self):
        # Creamos una copia limpia para el modelo sin campos extra de Djoser
        model_data = self.user_model_data.copy()
        
        # El modelo User no tiene re_password, así que lo eliminamos antes de crearlo
        if 're_password' in model_data:
            del model_data['re_password']
            
        user = User.objects.create_user(**model_data)
        user.is_active = True
        user.save()
        
        response = self.client.post('/api/v1/auth/jwt/create/', {
            "email": model_data["email"],
            "password": model_data["password"]
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)