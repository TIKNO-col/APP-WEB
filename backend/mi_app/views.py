from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import UsuarioSerializer, CustomTokenObtainPairSerializer

Usuario = get_user_model()

class RegistroUsuarioView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UsuarioSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PerfilUsuarioView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UsuarioSerializer

    def get_object(self):
        return self.request.user

class ListaUsuariosView(generics.ListAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        # Solo los administradores pueden ver todos los usuarios
        if self.request.user.rol == 'admin':
            return Usuario.objects.all()
        return Usuario.objects.none()
