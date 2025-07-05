# APP WEB - Proyecto Full Stack

Un proyecto full stack moderno que combina Django como backend y React con Vite como frontend.

## 🚀 Tecnologías Utilizadas

### Backend
- **Django 5.2.4** - Framework web de Python
- **SQLite** - Base de datos (por defecto)
- **Python** - Lenguaje de programación

### Frontend
- **React 19.1.0** - Biblioteca de JavaScript para interfaces de usuario
- **Vite 7.0.0** - Herramienta de construcción y desarrollo
- **ESLint** - Linter para JavaScript/React
- **CSS3** - Estilos

### Herramientas de Desarrollo
- **pnpm** - Gestor de paquetes para el frontend
- **pip** - Gestor de paquetes para Python
- **Git** - Control de versiones

## 📁 Estructura del Proyecto

```
APP WEB/
├── backend/                 # Aplicación Django
│   ├── BackWeb/            # Configuración principal del proyecto
│   │   ├── settings.py     # Configuraciones de Django
│   │   ├── urls.py         # URLs principales
│   │   ├── wsgi.py         # Configuración WSGI
│   │   └── asgi.py         # Configuración ASGI
│   ├── mi_app/             # Aplicación Django personalizada
│   │   ├── models.py       # Modelos de datos
│   │   ├── views.py        # Vistas
│   │   ├── admin.py        # Configuración del admin
│   │   └── apps.py         # Configuración de la app
│   ├── manage.py           # Utilidad de línea de comandos de Django
│   └── db.sqlite3          # Base de datos SQLite
└── frontend/               # Aplicación React
    ├── src/                # Código fuente
    │   ├── App.jsx         # Componente principal
    │   ├── main.jsx        # Punto de entrada
    │   ├── App.css         # Estilos del componente principal
    │   └── index.css       # Estilos globales
    ├── public/             # Archivos públicos
    ├── package.json        # Dependencias y scripts de npm
    ├── vite.config.js      # Configuración de Vite
    └── eslint.config.js    # Configuración de ESLint
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- **Python 3.8+** instalado en tu sistema
- **Node.js 16+** y **pnpm** instalados
- **Git** para clonar el repositorio

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd "APP WEB"
```

### 2. Configuración del Backend (Django)

#### Crear un entorno virtual
```bash
cd backend
python -m venv venv

# En Windows
venv\Scripts\activate

# En macOS/Linux
source venv/bin/activate
```

#### Instalar dependencias
```bash
pip install -r requirements.txt
```

#### Configurar la base de datos
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Crear un superusuario (opcional)
```bash
python manage.py createsuperuser
```

### 3. Configuración del Frontend (React)

```bash
cd ../frontend
pnpm install
```

## 🚀 Ejecución del Proyecto

### Ejecutar el Backend

```bash
cd backend
# Activar el entorno virtual si no está activado
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

python manage.py runserver
```

El backend estará disponible en: `http://localhost:8000`

### Ejecutar el Frontend

En una nueva terminal:

```bash
cd frontend
pnpm run dev
```

El frontend estará disponible en: `http://localhost:5173`

## 📝 Scripts Disponibles

### Backend (Django)
- `python manage.py runserver` - Ejecutar el servidor de desarrollo
- `python manage.py makemigrations` - Crear migraciones
- `python manage.py migrate` - Aplicar migraciones
- `python manage.py createsuperuser` - Crear superusuario
- `python manage.py collectstatic` - Recopilar archivos estáticos

### Frontend (React)
- `pnpm run dev` - Ejecutar servidor de desarrollo
- `pnpm run build` - Construir para producción
- `pnpm run preview` - Previsualizar build de producción
- `pnpm run lint` - Ejecutar linter

## 🔧 Configuración Adicional

### Variables de Entorno

Para producción, considera crear un archivo `.env` en el backend con:

```env
SECRET_KEY=tu-clave-secreta-aqui
DEBUG=False
ALLOWED_HOSTS=tu-dominio.com,www.tu-dominio.com
```

### Base de Datos

El proyecto usa SQLite por defecto. Para usar PostgreSQL o MySQL:

1. Instala el driver correspondiente:
   ```bash
   pip install psycopg2-binary  # Para PostgreSQL
   # o
   pip install mysqlclient      # Para MySQL
   ```

2. Actualiza la configuración en `backend/BackWeb/settings.py`

## 🌐 URLs Importantes

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin de Django**: http://localhost:8000/admin

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

**¡Feliz desarrollo! 🎉**