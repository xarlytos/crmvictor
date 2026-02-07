# Backend - CRM Seguros

Backend completo para el CRM de seguros con Node.js, Express, MongoDB y autenticación JWT.

## Características

- ✅ **Autenticación JWT** - Login seguro con tokens
- ✅ **API RESTful** - Endpoints para clientes, vencimientos y configuración
- ✅ **MongoDB** - Base de datos con Mongoose
- ✅ **Validaciones** - Validaciones de datos en todos los endpoints
- ✅ **CORS configurado** - Listo para Vercel frontend
- ✅ **Protección de rutas** - Middleware de autenticación

## Estructura

```
backend/
├── controllers/       # Lógica de negocio
│   ├── auth.controller.ts
│   ├── clientes.controller.ts
│   ├── vencimientos.controller.ts
│   └── config.controller.ts
├── middleware/        # Middlewares
│   └── auth.ts        # JWT auth middleware
├── models/            # Modelos Mongoose
│   ├── Usuario.ts
│   ├── Cliente.ts
│   └── Config.ts
├── routes/            # Rutas API
│   ├── auth.ts
│   ├── clientes.ts
│   ├── vencimientos.ts
│   └── config.ts
├── db.ts              # Conexión MongoDB
├── index.ts           # Entry point
└── seed.ts            # Script para datos iniciales
```

## Instalación y Configuración

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/crm-seguros?retryWrites=true&w=majority

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_secreto_jwt_super_seguro

# Configuración
NODE_ENV=development
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Crear base de datos en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un nuevo proyecto llamado "crm-seguros"
3. Crea un cluster gratuito (M0)
4. Configura un usuario de base de datos
5. Añade acceso desde cualquier IP (0.0.0.0/0) para Railway
6. Copia la URI de conexión

### 4. Seed inicial (crear usuario admin y datos de ejemplo)

```bash
npm run seed
```

Esto creará:
- Usuario admin: `admin@crm.com` / `admin123`
- Configuración por defecto
- 3 clientes de ejemplo

### 5. Iniciar servidor

**Desarrollo completo (frontend + backend):**
```bash
npm run dev
```

**Solo backend (hot reload):**
```bash
npm run dev:backend
# o
npm run server
```

**Producción:**
```bash
npm run server:prod
```

## API Endpoints

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |
| GET | `/api/auth/me` | Obtener usuario actual | Sí |
| PUT | `/api/auth/profile` | Actualizar perfil | Sí |
| PUT | `/api/auth/change-password` | Cambiar contraseña | Sí |

### Clientes

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/clientes` | Listar clientes (con filtros) | Sí |
| GET | `/api/clientes/:id` | Obtener cliente por ID | Sí |
| POST | `/api/clientes` | Crear nuevo cliente | Sí |
| PUT | `/api/clientes/:id` | Actualizar cliente | Sí |
| DELETE | `/api/clientes/:id` | Eliminar cliente | Sí |
| POST | `/api/clientes/bulk-delete` | Eliminar múltiples clientes | Sí |

**Query params para GET /api/clientes:**
- `search` - Búsqueda por texto
- `estados` - Filtrar por estados (comma-separated)
- `tiposCarga` - Filtrar por tipos de carga
- `transportes` - Filtrar por tipos de transporte
- `mesVencimiento` - Filtrar por mes de vencimiento
- `proximosDias` - Filtrar por vencimientos próximos

### Vencimientos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/vencimientos` | Listar vencimientos próximos | Sí |
| GET | `/api/vencimientos/resumen` | Resumen para dashboard | Sí |

**Query params:**
- `days` - Días hacia adelante
- `mes` - Filtrar por mes específico
- `estado` - Filtrar por estado del cliente

### Configuración

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/api/config` | Obtener configuración | Sí |
| PUT | `/api/config` | Actualizar configuración | Sí |

## Despliegue en Railway

### 1. Preparar el repositorio

Asegúrate de que todo esté commitado:
```bash
git add .
git commit -m "Backend completo listo para producción"
```

### 2. Crear proyecto en Railway

1. Ve a [Railway](https://railway.app)
2. Crea un nuevo proyecto
3. Selecciona "Deploy from GitHub repo"
4. Selecciona tu repositorio

### 3. Configurar variables de entorno

En el dashboard de Railway, ve a "Variables" y añade:

```
MONGODB_URI=tu_uri_de_mongodb_atlas
JWT_SECRET=tu_secreto_jwt_seguro
NODE_ENV=production
ALLOWED_ORIGINS=https://tu-app.vercel.app
```

### 4. Configurar comando de inicio

En Railway, ve a "Settings" y establece:
- **Start Command**: `npm run server:prod`
- **Root Directory**: (dejar en blanco o poner `.`)

### 5. Generar dominio

Railway asignará automáticamente un dominio. También puedes configurar uno personalizado.

### 6. Ejecutar seed (primera vez)

Ve a "Shell" en Railway y ejecuta:
```bash
npm run seed
```

## Despliegue Frontend en Vercel

### 1. Preparar variables de entorno

Crea un archivo `.env.production`:

```env
VITE_API_URL=https://tu-api-railway.app/api
VITE_USE_MOCK=false
```

### 2. Configurar build

En Vercel, asegúrate de que:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. Configurar variables de entorno en Vercel

En el dashboard de Vercel, añade:
```
VITE_API_URL=https://tu-api-railway.app/api
```

## Solución de Problemas

### Error de CORS

Asegúrate de que `ALLOWED_ORIGINS` en Railway incluya tu URL de Vercel exacta.

### Error de conexión a MongoDB

1. Verifica que la URI sea correcta
2. Asegúrate de que el usuario tenga permisos
3. Verifica que la IP de Railway tenga acceso (pon 0.0.0.0/0 en Atlas)

### Error JWT

El `JWT_SECRET` debe tener al menos 32 caracteres en producción.

## Desarrollo

Para trabajar con el backend localmente:

1. Inicia MongoDB local o usa Atlas
2. Configura `.env` con `NODE_ENV=development`
3. Ejecuta:
   - `npm run dev` - Frontend y backend simultáneamente
   - `npm run dev:backend` - Solo backend
   - `npm run dev:frontend` - Solo frontend
4. El backend estará en http://localhost:3001
5. El frontend estará en http://localhost:5173

Para usar el mock en lugar del backend:
```env
VITE_USE_MOCK=true
```

## Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración (7 días)
- ✅ CORS configurado
- ✅ Validación de datos en todos los endpoints
- ✅ Rutas protegidas con middleware

## Licencia

Proyecto privado - Uso exclusivo.
