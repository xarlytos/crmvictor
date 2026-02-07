# CRM Seguros

Mini-CRM para gestionar clientes de seguros y controlar vencimientos de pólizas.

## 🚀 Demo en Vivo

- **Frontend**: [https://crm-seguros.vercel.app](https://tu-url-vercel.vercel.app)
- **Backend**: [https://crm-seguros-api.railway.app](https://tu-url-railway.app)

## ✨ Características

- **Dashboard** con KPIs y próximos vencimientos
- **Gestión de Clientes** con CRUD completo y filtros avanzados
- **Múltiples Vencimientos** por cliente (RC, Mercancías, ACC, Flotas, PYME)
- **Vencimientos** ordenados por urgencia con semáforo visual
- **Ajustes** para personalizar colores por mes y ventana de alerta
- **Autenticación** con JWT (email/password)
- **API REST** completa con Node.js + Express + MongoDB
- **Sidebar minimizable** para mejor visualización

## 🛠 Stack Tecnológico

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Router
- React Hook Form + Zod
- React Query
- Zustand

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT para autenticación
- bcryptjs para hash de contraseñas

## 📦 Instalación Local

```bash
# Clonar repositorio
git clone <repo-url>
cd crm-seguros

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de MongoDB Atlas

# Crear datos iniciales (usuario admin + clientes de ejemplo)
npm run seed

# Iniciar desarrollo (frontend + backend)
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Credenciales por defecto
- **Email**: `admin@crm.com`
- **Password**: `admin123`

## 🚀 Despliegue en Producción

### 1. MongoDB Atlas (Base de Datos)

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un nuevo proyecto llamado "crm-seguros"
3. Crea un cluster gratuito (M0)
4. Configura un usuario de base de datos
5. Añade acceso desde cualquier IP (`0.0.0.0/0`)
6. Copia la URI de conexión

### 2. Railway (Backend)

1. Ve a [Railway](https://railway.app)
2. Crea un nuevo proyecto
3. Selecciona "Deploy from GitHub repo"
4. Selecciona tu repositorio
5. Configura las variables de entorno en Railway:
   ```
   MONGODB_URI=tu_uri_de_mongodb_atlas
   JWT_SECRET=tu_secreto_jwt_seguro_generado
   NODE_ENV=production
   ALLOWED_ORIGINS=https://tu-app.vercel.app
   ```
6. Establece el comando de inicio:
   - **Start Command**: `npm run server:prod`
7. Genera un dominio (Settings → Domains → Generate Domain)
8. Copia la URL del backend (la necesitarás para Vercel)

### 3. Vercel (Frontend)

1. Ve a [Vercel](https://vercel.com)
2. Importa tu repositorio de GitHub
3. Configura las variables de entorno:
   ```
   VITE_API_URL=https://tu-backend-railway.app/api
   ```
4. Configura el build:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Deploy

### 4. Configuración Final

1. Ve a la URL de Railway y ejecuta el setup:
   ```
   POST https://tu-backend-railway.app/api/setup/admin
   ```
   O visita `https://tu-frontend-vercel.app/setup.html`

2. Inicia sesión con las credenciales admin

3. ¡Listo! El CRM está en producción.

## 📁 Estructura del Proyecto

```
crm-seguros/
├── backend/                 # Backend Node.js
│   ├── controllers/         # Lógica de negocio
│   ├── middleware/          # Auth middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   ├── db.ts                # Conexión MongoDB
│   ├── index.ts             # Entry point
│   └── seed.ts              # Datos iniciales
├── src/                     # Frontend React
│   ├── api/                 # HttpDataProvider
│   ├── app/                 # Routing y layout
│   ├── components/          # Componentes UI
│   ├── features/            # Features por dominio
│   │   ├── clientes/
│   │   ├── vencimientos/
│   │   ├── ajustes/
│   │   └── dashboard/
│   └── types.ts             # Tipos TypeScript
├── .env.example             # Variables de entorno ejemplo
├── package.json
└── README.md
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Tokens JWT con expiración (7 días)
- ✅ CORS configurado
- ✅ Validación de datos en todos los endpoints
- ✅ Rutas protegidas con middleware

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia frontend y backend
npm run dev:frontend     # Solo frontend
npm run dev:backend      # Solo backend

# Producción
npm run server:prod      # Backend en producción
npm run build            # Compilar frontend

# Utilidades
npm run seed             # Crear datos iniciales
npm run setup            # Instalar + seed
```

## 🐛 Solución de Problemas

### Error de CORS
Asegúrate de que `ALLOWED_ORIGINS` en Railway incluya tu URL de Vercel exacta.

### Error de conexión a MongoDB
1. Verifica que la URI sea correcta
2. Asegúrate de que el usuario tenga permisos
3. Verifica que la IP tenga acceso (0.0.0.0/0 en Atlas)

### Error JWT
El `JWT_SECRET` debe tener al menos 32 caracteres en producción.

## 📄 Licencia

Proyecto privado - Uso exclusivo.
