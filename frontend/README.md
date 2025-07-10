# Aplicación Web de Ventas

## Requisitos Previos
- Node.js (versión 18 o superior)
- pnpm (versión 8 o superior)

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd frontend
```

2. Instalar dependencias:
```bash
pnpm install
```

## Dependencias Principales

### Producción
- React v19.1.0
- React Router DOM v7.6.3
- Headless UI v2.2.4
- Lucide React v0.525.0
- Supabase JS v2.39.3
- Axios v1.6.7
- Framer Motion - Animaciones fluidas y profesionales

### Desarrollo
- Vite v7.0.0
- Tailwind CSS v3.4.1
- PostCSS v8.4.35
- Autoprefixer v10.4.17
- ESLint v9.29.0

## Configuración

1. Configurar variables de entorno:
- Crear archivo `.env` basado en `.env.example`
- Configurar las variables necesarias

2. Iniciar servidor de desarrollo:
```bash
pnpm run dev
```

3. Construir para producción:
```bash
pnpm run build
```

## Estructura del Proyecto

```
src/
  ├── assets/      # Recursos estáticos
  ├── components/  # Componentes reutilizables
  ├── pages/       # Páginas de la aplicación
  ├── App.jsx      # Componente principal
  └── main.jsx     # Punto de entrada
```

## Convenciones de Código

- Usar nombres descriptivos en español para componentes y funciones
- Seguir principios de diseño responsivo
- Mantener componentes pequeños y reutilizables
- Documentar funciones y componentes complejos

## Implementación de cambios aplicados
IMPORTANTE LEER
### Animaciones con Framer Motion
1. Instalación de la librería:
```bash
pnpm add framer-motion
### nuevas INSTALACIONES
pnpm i @cloudinary/url-gen @cloudinary/react
pnpm install sha.js

```

2. Implementación en componentes:
- Añadida animación de entrada para el logo en la página de login
- Uso de motion.div y motion.img para elementos animados
- Configuración de transiciones suaves y efectos spring