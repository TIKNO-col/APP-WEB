from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from .serializers import (
    UsuarioSerializer, 
    CustomTokenObtainPairSerializer, 
    ClienteSerializer,
    ProductoSerializer,
    CategoriaSerializer
)
from .models import Cliente, Producto, Categoria

Usuario = get_user_model()

class RegistroUsuarioView(CreateAPIView):
    queryset = Usuario.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UsuarioSerializer

    def create(self, request, *args, **kwargs):
        if request.user.rol != 'admin':
            return Response(
                {'detail': 'Solo los administradores pueden crear nuevos usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class PerfilUsuarioView(RetrieveUpdateAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Usuario.objects.all()

    def get_object(self):
        if self.kwargs.get('pk'):
            return super().get_object()
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Si no es admin, no puede cambiar roles ni zonas de acceso
        if request.user.rol != 'admin':
            if 'rol' in request.data or 'zona_acceso' in request.data:
                return Response(
                    {'detail': 'No tienes permiso para modificar roles o zonas de acceso'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            if 'password' in request.data and request.data['password']:
                instance.set_password(request.data['password'])
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        if not request.user.rol == 'admin':
            return Response({'detail': 'No tienes permiso para eliminar usuarios'}, 
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class ListaUsuariosView(ListAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Usuario.objects.all()

    def get_queryset(self):
        if self.request.user.rol == 'admin':
            return Usuario.objects.all().order_by('-created_at')
        return Usuario.objects.filter(id=self.request.user.id)

class UsuarioDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Usuario.objects.all()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Si no es admin, no puede cambiar roles ni zonas de acceso
        if request.user.rol != 'admin' and request.user.id != instance.id:
            return Response(
                {'detail': 'No tienes permiso para modificar otros usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )

        if request.user.rol != 'admin':
            if 'rol' in request.data or 'zona_acceso' in request.data:
                return Response(
                    {'detail': 'No tienes permiso para modificar roles o zonas de acceso'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            if 'password' in request.data and request.data['password']:
                instance.set_password(request.data['password'])
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_object(self):
        obj = super().get_object()
        self.check_object_permissions(self.request, obj)
        return obj

    def destroy(self, request, *args, **kwargs):
        if not request.user.rol == 'admin':
            return Response(
                {'detail': 'No tienes permiso para eliminar usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            usuario = self.get_object()
            if usuario.id == request.user.id:
                return Response(
                    {'detail': 'No puedes eliminar tu propio usuario'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            usuario.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Usuario.DoesNotExist:
            return Response(
                {'detail': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

    def get_queryset(self):
        # Si es admin, puede ver todos los usuarios
        if self.request.user.rol == 'admin':
            return Usuario.objects.all().order_by('-created_at')
        # Si no es admin, solo puede verse a sí mismo
        return Usuario.objects.filter(id=self.request.user.id)

    def get_object(self):
        obj = Usuario.objects.get(pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj

    def delete(self, request, *args, **kwargs):
        if not request.user.rol == 'admin':
            return Response(
                {'detail': 'No tienes permiso para eliminar usuarios'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            usuario = self.get_object()
            if usuario.id == request.user.id:
                return Response(
                    {'detail': 'No puedes eliminar tu propio usuario'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            usuario.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Usuario.DoesNotExist:
            return Response(
                {'detail': 'Usuario no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'cedula'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Categoria.objects.all().order_by('nombre')

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Producto.objects.all().order_by('-created_at')
        categoria = self.request.query_params.get('categoria', None)
        if categoria is not None:
            queryset = queryset.filter(categoria_id=categoria)
        return queryset

    def create(self, request, *args, **kwargs):
        if request.user.rol != 'admin':
            return Response(
                {'detail': 'Solo los administradores pueden crear productos'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if request.user.rol != 'admin':
            return Response(
                {'detail': 'Solo los administradores pueden modificar productos'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.rol != 'admin':
            return Response(
                {'detail': 'Solo los administradores pueden eliminar productos'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
