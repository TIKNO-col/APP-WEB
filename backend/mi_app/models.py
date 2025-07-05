from django.db import models
import uuid

class Usuario(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    nombre = models.CharField(max_length=255)
    correo = models.EmailField()

    def __str__(self):
        return f"{self.nombre} ({self.correo})"

    class Meta:
        db_table = 'usuarios'  # Nombre exacto de la tabla en Supabase
