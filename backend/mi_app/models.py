from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.contrib.auth.hashers import make_password
import uuid

class Usuario(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255, default='', db_index=True)
    email = models.EmailField(unique=True, default='', db_index=True)
    password = models.CharField(max_length=128, default=make_password('changeme'))
    username = models.CharField(max_length=150, unique=True, default='', db_index=True)
    first_name = models.CharField(max_length=150, default='')
    last_name = models.CharField(max_length=150, default='')
    rol = models.CharField(max_length=50, default='usuario', db_index=True)
    zona_acceso = models.CharField(max_length=50, default='general', db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'nombre']

    class Meta:
        db_table = 'usuarios'  # Nombre exacto de la tabla en Supabase
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        indexes = [
            models.Index(fields=['rol', 'zona_acceso']),
            models.Index(fields=['created_at', 'is_active'])
        ]

    def get_full_name(self):
        return f"{self.nombre} ({self.username})"

    def __str__(self):
        return self.get_full_name()

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

class Categoria(models.Model):
    id = models.BigAutoField(primary_key=True)
    nombre = models.TextField()

    class Meta:
        db_table = 'categorias'
        ordering = ['nombre']

    def __str__(self):
        return self.nombre

class Producto(models.Model):
    id = models.BigAutoField(primary_key=True)
    nombre = models.CharField(max_length=255)
    descripcion = models.TextField(null=True, blank=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()
    imagen_url = models.URLField(null=True, blank=True)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'productos'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.nombre} - ${self.precio}"

class Venta(models.Model):
    id = models.BigAutoField(primary_key=True)
    cliente_cedula = models.CharField(max_length=20, null=True, blank=True)  # Referencia directa por cédula
    total = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ventas'
        ordering = ['-created_at']

    def __str__(self):
        return f"Venta #{self.id} - {self.cliente_cedula} - ${self.total}"

class VentaItem(models.Model):
    id = models.BigAutoField(primary_key=True)
    venta_id = models.BigIntegerField(null=True, blank=True)  # Referencia directa por ID
    producto_id = models.BigIntegerField(null=True, blank=True)  # Referencia directa por ID
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'detalles_venta'
        ordering = ['-created_at']

    def __str__(self):
        return f"Detalle venta #{self.venta_id} - Producto #{self.producto_id} x{self.cantidad}"
