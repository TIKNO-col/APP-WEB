from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegistroUsuarioView,
    CustomTokenObtainPairView,
    PerfilUsuarioView,
    ListaUsuariosView
)

urlpatterns = [
    path('auth/registro/', RegistroUsuarioView.as_view(), name='auth_registro'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('usuarios/perfil/', PerfilUsuarioView.as_view(), name='perfil_usuario'),
    path('usuarios/', ListaUsuariosView.as_view(), name='lista_usuarios'),
]