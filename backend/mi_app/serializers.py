from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Cliente

Usuario = get_user_model()

class UsuarioSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])

    class Meta:
        model = Usuario
        fields = ('id', 'email', 'username', 'password', 'nombre', 'rol', 'zona_acceso')
        extra_kwargs = {
            'password': {'write_only': True}
        }

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