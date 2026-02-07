# 🚀 Guía de Despliegue Paso a Paso

Esta guía te llevará a través del proceso completo de despliegue del CRM Seguros en producción.

## ✅ Checklist Pre-Despliegue

- [ ] Tienes cuenta en GitHub con el código subido
- [ ] Tienes cuenta en MongoDB Atlas
- [ ] Tienes cuenta en Railway
- [ ] Tienes cuenta en Vercel

---

## Paso 1: MongoDB Atlas (Base de Datos)

### 1.1 Crear Proyecto
1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Click en **New Project**
3. Nombre: `crm-seguros`
4. Click **Next** → **Create Project**

### 1.2 Crear Cluster
1. Click en **Build a Cluster**
2. Selecciona **M0 (Free)**
3. Proveedor: AWS (o el que prefieras)
4. Región: Selecciona la más cercana a ti
5. Click **Create Cluster** (tarda 1-3 minutos)

### 1.3 Configurar Acceso
1. Ve a **Database Access** (menú lateral)
2. Click **Add New Database User**
3. Método de autenticación: Password
4. Username: `crmuser`
5. Password: Genera uno seguro (guárdalo!)
6. Built-in Role: **Read and Write to Any Database**
7. Click **Add User**

### 1.4 Configurar Network Access
1. Ve a **Network Access** (menú lateral)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
4. Confirmar

### 1.5 Obtener URI de Conexión
1. Ve a **Clusters** → Click **Connect**
2. Selecciona **Drivers**
3. Selecciona **Node.js**
4. Copia la URI:
   ```
   mongodb+srv://crmuser:<password>@cluster0.xxxxx.mongodb.net/crm-seguros?retryWrites=true&w=majority
   ```
5. Reemplaza `<password>` con la contraseña que creaste

💾 **Guarda esta URI**, la necesitarás para Railway.

---

## Paso 2: Railway (Backend)

### 2.1 Crear Proyecto
1. Ve a [Railway](https://railway.app/dashboard)
2. Click **New Project**
3. Selecciona **Deploy from GitHub repo**
4. Selecciona tu repositorio `crm-seguros`

### 2.2 Configurar Variables de Entorno
1. Ve a la pestaña **Variables**
2. Agrega las siguientes variables:

```
MONGODB_URI=mongodb+srv://crmuser:TU_PASSWORD@cluster0.xxxxx.mongodb.net/crm-seguros?retryWrites=true&w=majority
JWT_SECRET=GENERA_UNO_SEGURO_ABAJO
NODE_ENV=production
ALLOWED_ORIGINS=https://TU_URL_VERCEL.vercel.app
```

**Para generar JWT_SECRET**, ejecuta localmente:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2.3 Configurar Comando de Inicio
1. Ve a **Settings**
2. En **Start Command**, escribe:
   ```
   npm run server:prod
   ```
3. En **Root Directory**, deja vacío (o pon `.`)

### 2.4 Generar Dominio
1. Ve a **Settings**
2. Sección **Domains**
3. Click **Generate Domain**
4. Copia la URL (ej: `https://crm-seguros-api.up.railway.app`)

💾 **Guarda esta URL**, la necesitarás para Vercel.

### 2.5 Ejecutar Seed
1. Ve a la pestaña **Deployments**
2. Click en los tres puntos del deployment activo
3. Selecciona **Shell**
4. Ejecuta:
   ```bash
   npm run seed
   ```
5. Verás que se creó el usuario admin

✅ **Backend desplegado!**

---

## Paso 3: Vercel (Frontend)

### 3.1 Importar Proyecto
1. Ve a [Vercel](https://vercel.com/dashboard)
2. Click **Add New...** → **Project**
3. Importa tu repositorio de GitHub

### 3.2 Configurar Variables de Entorno
1. En **Environment Variables**, agrega:
   ```
   VITE_API_URL=https://TU_URL_RAILWAY.app/api
   ```
   (Reemplaza con la URL de Railway)

### 3.3 Configurar Build Settings
1. **Framework Preset**: Vite
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Root Directory**: `./`

### 3.4 Deploy
1. Click **Deploy**
2. Espera a que termine (1-2 minutos)

✅ **Frontend desplegado!**

---

## Paso 4: Configuración Final

### 4.1 Configurar CORS en Railway
1. Ve a Railway → tu proyecto → Variables
2. Edita `ALLOWED_ORIGINS` y pon la URL exacta de Vercel:
   ```
   ALLOWED_ORIGINS=https://crm-seguros.vercel.app
   ```
3. Railway reiniciará automáticamente

### 4.2 Crear Usuario Admin
1. Ve a tu frontend en Vercel
2. Navega a: `https://tu-app.vercel.app/setup.html`
3. Completa el formulario:
   - Email: `admin@crm.com`
   - Password: `admin123` (o el que quieras)
   - Nombre: `Administrador`
4. Click **Crear / Actualizar Admin**

### 4.3 Verificar Funcionamiento
1. Ve a la página principal
2. Inicia sesión con las credenciales creadas
3. Deberías ver:
   - Dashboard con datos
   - Lista de clientes
   - Vencimientos ordenados

---

## 🎉 Verificación Final

### Prueba estas funcionalidades:
- [ ] Login funciona
- [ ] Se ven los clientes
- [ ] Filtros funcionan
- [ ] Crear nuevo cliente
- [ ] Editar cliente
- [ ] Ver página de vencimientos
- [ ] Sidebar minimizable funciona
- [ ] Vencimientos ordenados correctamente

### URLs importantes:
- Frontend: `https://tu-app.vercel.app`
- Backend Health: `https://tu-api-railway.app/api/health`
- Setup Admin: `https://tu-app.vercel.app/setup.html`

---

## 🐛 Solución de Problemas Comunes

### "Failed to fetch" / Error de conexión
- Verifica que `VITE_API_URL` en Vercel tenga `/api` al final
- Verifica que `ALLOWED_ORIGINS` en Railway tenga la URL exacta de Vercel

### "No autorizado" / Error 401
- El token expiró, cierra sesión y vuelve a entrar
- O el JWT_SECRET cambió entre deployments

### No se ven los datos
- Verifica que ejecutaste `npm run seed` en Railway
- Verifica la conexión a MongoDB Atlas

### Error de CORS
- Asegúrate de que `ALLOWED_ORIGINS` incluya el dominio exacto de Vercel
- Incluye `https://` y sin barra al final

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Railway (Deployments → Logs)
2. Revisa la consola del navegador (F12)
3. Verifica que todas las variables de entorno estén configuradas

¡Listo! Tu CRM Seguros está en producción. 🚀
