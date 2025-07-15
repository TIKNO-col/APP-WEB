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
    CategoriaSerializer,
    VentaSerializer,
    VentaItemSerializer
)
from .models import Cliente, Producto, Categoria, Venta, VentaItem

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

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
    serializer_class = VentaSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente permitir acceso sin autenticación

    def get_queryset(self):
        queryset = Venta.objects.all()
        
        # Filtrar por cliente si se proporciona
        cliente_cedula = self.request.query_params.get('cliente', None)
        if cliente_cedula:
            queryset = queryset.filter(cliente_cedula=cliente_cedula)
        
        # Filtrar por fecha si se proporciona
        fecha_inicio = self.request.query_params.get('fecha_inicio', None)
        fecha_fin = self.request.query_params.get('fecha_fin', None)
        
        if fecha_inicio:
            queryset = queryset.filter(created_at__date__gte=fecha_inicio)
        if fecha_fin:
            queryset = queryset.filter(created_at__date__lte=fecha_fin)
        
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                venta = serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response(
                    {'detail': str(e)}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        if request.user.rol != 'admin':
            return Response(
                {'detail': 'Solo los administradores pueden eliminar ventas'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

class VentaItemViewSet(viewsets.ModelViewSet):
    queryset = VentaItem.objects.all()
    serializer_class = VentaItemSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente permitir acceso sin autenticación

    def get_queryset(self):
        queryset = VentaItem.objects.all()
        
        # Filtrar por venta si se proporciona
        venta_id = self.request.query_params.get('venta', None)
        if venta_id:
            queryset = queryset.filter(venta_id=venta_id)
        
        return queryset.order_by('-created_at')

class ListaUsuariosView(ListAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_queryset(self):
        queryset = Usuario.objects.select_related().all()
        if self.request.user.rol != 'admin':
            queryset = queryset.filter(id=self.request.user.id)
        return queryset.order_by('-created_at')

class PerfilUsuarioView(RetrieveUpdateAPIView):
    serializer_class = UsuarioSerializer
    permission_classes = (permissions.IsAuthenticated,)
    
    def get_object(self):
        if self.kwargs.get('pk'):
            return Usuario.objects.select_related().get(pk=self.kwargs['pk'])
        return self.request.user

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if request.user.rol != 'admin':
            if 'rol' in request.data or 'zona_acceso' in request.data:
                return Response(
                    {'detail': 'No tienes permiso para modificar roles o zonas de acceso'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def delete(self, request, *args, **kwargs):
        if not request.user.rol == 'admin':
            return Response({'detail': 'No tienes permiso para eliminar usuarios'}, 
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

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
    permission_classes = [permissions.AllowAny]  # Temporalmente permitir acceso sin autenticación

    def get_queryset(self):
        return Categoria.objects.all().order_by('nombre')

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [permissions.AllowAny]  # Temporalmente permitir acceso sin autenticación

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
