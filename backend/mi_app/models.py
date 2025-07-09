from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.contrib.auth.hashers import make_password
import uuid

class Usuario(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255, default='')
    email = models.EmailField(unique=True, default='')
    password = models.CharField(max_length=128, default=make_password('changeme'))
    username = models.CharField(max_length=150, unique=True, default='')
    first_name = models.CharField(max_length=150, default='')
    last_name = models.CharField(max_length=150, default='')
    rol = models.CharField(max_length=50, default='usuario')
    zona_acceso = models.CharField(max_length=50, default='general')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nombre']

    class Meta:
        db_table = 'usuarios'  # Nombre exacto de la tabla en Supabase
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

class Cliente(models.Model):
    cedula = models.CharField(max_length=20, primary_key=True)
    nombre = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telefono = models.CharField(max_length=20, null=True, blank=True)
    ciudad = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'clientes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nombre} - {self.cedula}"
