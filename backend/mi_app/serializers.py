from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Cliente, Categoria, Producto

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])
    is_admin = serializers.SerializerMethodField()
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Usuario
        fields = ('id', 'email', 'username', 'password', 'nombre', 'rol', 
                 'zona_acceso', 'is_admin', 'created_at_formatted', 'created_at')
        extra_kwargs = {
            'password': {'write_only': True},
            'created_at': {'write_only': True}
        }

    def get_is_admin(self, obj):
        return obj.rol == 'admin'

    def get_created_at_formatted(self, obj):
        return obj.created_at.strftime('%d/%m/%Y %H:%M') if obj.created_at else None

    def create(self, validated_data):
        user = Usuario.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password'],
            nombre=validated_data['nombre'],
            rol=validated_data.get('rol', 'usuario'),
            zona_acceso=validated_data.get('zona_acceso', 'general')
        )
        return user

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            password = validated_data.pop('password')
            if password:
                instance.set_password(password)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Agregar claims personalizados al token
        token['email'] = user.email
        token['nombre'] = user.nombre
        token['rol'] = user.rol
        token['zona_acceso'] = user.zona_acceso
        return token

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['cedula', 'nombre', 'email', 'telefono', 'ciudad', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

class ProductoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)

    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'descripcion', 'precio', 'stock', 'imagen_url', 
                 'categoria', 'categoria_nombre', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']

    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor que 0")
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("El stock no puede ser negativo")
        return value