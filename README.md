# CRM Seguros

Mini-CRM para gestionar clientes de seguros y controlar vencimientos de pólizas.

## Características

- **Dashboard** con KPIs y próximos vencimientos
- **Gestión de Clientes** con CRUD completo y filtros avanzados
- **Vencimientos** ordenados por urgencia con semáforo visual
- **Ajustes** para personalizar colores por mes y ventana de alerta
- **DataProvider Pattern** con soporte para Mock (localStorage) y API HTTP

## Stack Tecnológico

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router
- React Hook Form + Zod
- React Query
- Zustand
- dayjs

### Backend (Scaffold)
- Node.js + Express
- Mongoose (MongoDB)
- TypeScript

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (frontend)
npm run dev

# Iniciar servidor backend (opcional, solo scaffold)
npm run server
```

## Configuración

El proyecto usa por defecto el `MockDataProvider` que guarda los datos en `localStorage`. Para cambiar a la API HTTP:

1. Crear archivo `.env` en la raíz:
```
VITE_USE_MOCK=false
```

2. Asegurarse de que el backend esté corriendo en `http://localhost:3001`

## Estructura del Proyecto

```
src/
  app/              # Routing y layout
  components/        # Componentes UI y compartidos
  features/          # Features por dominio
    clientes/
    vencimientos/
    ajustes/
    dashboard/
  lib/              # Utilidades
  mocks/            # MockDataProvider
  api/              # HttpDataProvider
  config/           # Configuración
  types.ts          # Tipos TypeScript

server/             # Backend scaffold (no conectado por defecto)
  models/
  controllers/
  routes/
```

## Uso

### Mock Data Provider (Por defecto)
Los datos se guardan en `localStorage` y se generan automáticamente 40 clientes de ejemplo al iniciar.

### Backend API
El backend está preparado pero no se usa por defecto. Para activarlo:
1. Configurar MongoDB
2. Cambiar `VITE_USE_MOCK=false` en `.env`
3. Ejecutar `npm run server`

## Rutas

- `/dashboard` - Dashboard principal
- `/clientes` - Listado y gestión de clientes
- `/vencimientos` - Vencimientos próximos
- `/ajustes/colores-mes` - Configuración de colores y alertas

## Scripts

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Preview de la build de producción
- `npm run server` - Inicia el servidor backend (scaffold)

