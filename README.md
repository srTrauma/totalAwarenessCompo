# 🚀 Total Awareness - Plataforma de Gestión Empresarial

Una plataforma web moderna y completa para la gestión de empresas, proyectos, tareas y publicaciones, construida con **Next.js**, **TypeScript**, **Prisma** y **SQLite**.

## 📋 Tabla de Contenidos

- [✨ Características](#-características)
- [🛠️ Tecnologías](#️-tecnologías)
- [📦 Instalación](#-instalación)
- [🔧 Configuración](#-configuración)
- [🚀 Desarrollo](#-desarrollo)
- [📊 Base de Datos](#-base-de-datos)
- [🔐 Autenticación](#-autenticación)
- [📧 Sistema de Email](#-sistema-de-email)
- [🏢 Estructura del Proyecto](#-estructura-del-proyecto)
- [🌐 Deployment](#-deployment)
- [🤝 Contribución](#-contribución)

## ✨ Características

### 👥 Gestión de Usuarios
- **Registro y autenticación** de usuarios
- **Perfiles personalizables** con imágenes
- **Reset de contraseña por email**
- **Roles y permisos** por empresa

### 🏢 Gestión de Empresas
- **Crear y administrar empresas**
- **Sistema de invitaciones** a miembros
- **Roles de usuario**: Owner, Admin, Member
- **Empresas públicas y privadas**
- **Salir de empresas** (excepto owners)

### 📝 Sistema de Posts
- **Crear publicaciones** por tipo:
  - 📄 General
  - 💼 Ofertas de Empleo
  - 📢 Noticias
  - 📅 Eventos
- **Filtrado avanzado** por tipo y búsqueda
- **Subida de imágenes** con Cloudinary
- **Enlaces externos** en posts
- **Activar/desactivar** publicaciones

### 📋 Gestión de Proyectos y Tareas
- **Proyectos con grupos de trabajo**
- **Tareas asignables** con estados
- **Sistema de archivos** adjuntos
- **Seguimiento de progreso**

### 💬 Sistema de FAQs
- **Preguntas frecuentes** categorizadas
- **Gestión por administradores**
- **Búsqueda de FAQs**

### 📧 Comunicación
- **Formulario de contacto**
- **Sistema de notificaciones**
- **Emails automáticos** para reset de contraseña

## 🛠️ Tecnologías

### Frontend
- **Next.js 14** - Framework React con SSR/SSG
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **React Hot Toast** - Notificaciones
- **Heroicons** - Iconografía
- **React Icons** - Iconos adicionales

### Backend
- **Next.js API Routes** - Backend serverless
- **Prisma ORM** - Base de datos tipada
- **SQLite** - Base de datos local/desarrollo
- **bcryptjs** - Encriptación de contraseñas
- **Nodemailer** - Envío de emails

### Servicios Externos
- **Cloudinary** - Almacenamiento de imágenes
- **Gmail SMTP** - Servicio de email

## 📦 Instalación

### Prerrequisitos

- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Git**

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/totalAwarenessCompo.git
cd totalAwarenessCompo
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Sembrar la base de datos**
```bash
npm run seed
```

4. **Generar el cliente de Prisma**
```bash
npx prisma generate
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DATABASE_URL="file:./prisma/dev.db"
NODE_ENV=development

# Configuración de Email (Gmail)
CONTACT_EMAIL_USER=tu-email@gmail.com
CONTACT_EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM=tu-email@gmail.com

# URL base de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Cloudinary (para subida de imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Configuración de Gmail

Para usar el reset de contraseña por email:

1. **Habilita la verificación en 2 pasos** en tu cuenta de Google
2. Ve a **"Contraseñas de aplicaciones"** en tu cuenta de Google
3. **Genera una nueva contraseña** para "Correo"
4. **Usa esa contraseña** en `EMAIL_PASS` (no tu contraseña normal)

### Configuración de Cloudinary

1. Regístrate en [Cloudinary](https://cloudinary.com/)
2. Copia tus credenciales del dashboard
3. Añádelas al archivo `.env`

## 🚀 Desarrollo

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint

# Base de datos
npx prisma studio    # Abrir Prisma Studio (interfaz gráfica)
npx prisma generate  # Generar cliente de Prisma
npx prisma db push   # Sincronizar esquema con DB
npx prisma migrate   # Crear migraciones
npm run seed         # Sembrar datos iniciales

# Reset completo de la base de datos
npx prisma migrate reset --force
```

### Estructura de Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "node prisma/seed.js"
  }
}
```

## 📊 Base de Datos

### Esquema Principal

- **User** - Usuarios del sistema
- **Company** - Empresas/organizaciones
- **CompanyUser** - Relación usuario-empresa con roles
- **Post** - Publicaciones de empresas
- **Project** - Proyectos empresariales
- **Group** - Grupos de trabajo
- **Task** - Tareas asignables
- **FAQ** - Preguntas frecuentes
- **Notification** - Notificaciones del sistema

### Comandos de Base de Datos

```bash
# Ver base de datos gráficamente
npx prisma studio

# Resetear base de datos completamente
npx prisma migrate reset --force

# Aplicar cambios del esquema
npx prisma db push

# Crear nueva migración
npx prisma migrate dev --name descripcion_cambio

# Generar cliente después de cambios
npx prisma generate
```

## 🔐 Autenticación

### Sistema de Usuarios

- **Registro** con validación de email
- **Login** con nombre de usuario y contraseña
- **Sesiones** almacenadas en sessionStorage
- **Reset de contraseña** por email con tokens seguros

### Roles por Empresa

- **OWNER** - Propietario (todos los permisos)
- **ADMIN** - Administrador (gestión de posts y miembros)
- **MEMBER** - Miembro (acceso básico)

### Rutas Protegidas

Las páginas requieren autenticación:
- `/Dashboard` - Panel principal
- `/Profile` - Perfil de usuario
- `/posts` - Gestión de posts
- `/companies` - Gestión de empresas

## 📧 Sistema de Email

### Reset de Contraseña

1. Usuario solicita reset en `/forgot-password`
2. Se genera token único con expiración de 1 hora
3. Se envía email con enlace seguro
4. Usuario accede a `/reset-password?token=...`
5. Establece nueva contraseña

### Email de Desarrollo

Si las credenciales de Gmail fallan, el sistema muestra el enlace de reset directamente en la consola para desarrollo.

## 🏢 Estructura del Proyecto

```
totalAwarenessCompo/
├── components/           # Componentes React reutilizables
│   ├── companies/       # Componentes específicos de empresas
│   ├── layout/          # Componentes de layout
│   └── *.tsx           # Componentes generales
├── pages/               # Páginas de Next.js
│   ├── api/            # API Routes
│   │   ├── auth/       # Endpoints de autenticación
│   │   ├── companies/  # Endpoints de empresas
│   │   ├── posts/      # Endpoints de posts
│   │   └── *.ts        # Otros endpoints
│   ├── auth/           # Páginas de autenticación
│   ├── companies/      # Páginas de empresas
│   ├── posts/          # Páginas de posts
│   └── *.tsx           # Páginas principales
├── prisma/             # Configuración de base de datos
│   ├── migrations/     # Migraciones de Prisma
│   ├── schema.prisma   # Esquema de base de datos
│   ├── seed.js         # Datos iniciales
│   └── dev.db          # Base de datos SQLite
├── public/             # Archivos estáticos
├── styles/             # Estilos globales
└── *.config.js         # Archivos de configuración
```

## 🌐 Deployment

### Variables de Entorno para Producción

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
NODE_ENV=production
```

### Plataformas Recomendadas

- **Vercel** (recomendado para Next.js)
- **Netlify**
- **Railway**
- **Render**

### Pasos para Deploy

1. **Configura variables de entorno** en tu plataforma
2. **Cambia DATABASE_URL** a una base de datos en producción
3. **Ejecuta migraciones** en producción:
   ```bash
   npx prisma migrate deploy
   ```

## 🤝 Contribución

### Desarrollo Local

1. **Fork** el repositorio
2. **Crea una rama** para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. **Realiza cambios** y commit: `git commit -m 'Agregar nueva funcionalidad'`
4. **Push** a la rama: `git push origin feature/nueva-funcionalidad`
5. **Abre un Pull Request**

### Estándares de Código

- **TypeScript** para tipado estático
- **ESLint** para linting
- **Prettier** para formateo (recomendado)
- **Conventional Commits** para mensajes de commit

### Testing

```bash
# Ejecutar tests (cuando estén configurados)
npm test

# Ejecutar tests en modo watch
npm run test:watch
```

## 🔧 Troubleshooting (Resolución de Problemas)

### Error 500 en Reset de Contraseña (Producción)

Si recibes un error 500 al usar forgot-password en producción:

#### 1. **Verificar Variables de Entorno**
```bash
# En Render (o tu servicio de hosting)
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
NEXT_PUBLIC_BASE_URL=https://tu-dominio.onrender.com
DATABASE_URL=file:./prisma/dev.db
```

#### 2. **Revisar Logs del Servidor**
```bash
# En Render, ve a "Logs" en tu servicio
# Busca líneas que empiecen con:
🔍 Iniciando forgot-password endpoint
❌ Error de base de datos
❌ Error enviando email
```

#### 3. **Página de Testing**
Accede a `/test-forgot-password` para probar el endpoint:
```
https://tu-dominio.onrender.com/test-forgot-password
```

#### 4. **Problemas Comunes y Soluciones**

**📧 Email No Se Envía:**
- Verifica que `EMAIL_USER` y `EMAIL_PASS` estén configurados
- Asegúrate de usar una **contraseña de aplicación** de Gmail, no tu contraseña normal
- Comprueba que la verificación en 2 pasos esté activada

**🗄️ Error de Base de Datos:**
```bash
# Recrear migraciones en producción
npx prisma migrate deploy
npx prisma generate
```

**🌐 URL Incorrecta:**
- `NEXT_PUBLIC_BASE_URL` debe apuntar a tu dominio de producción
- No olvides el `https://`

**🔑 Token No Se Genera:**
- Verifica que el usuario exista en la base de datos
- Comprueba los logs para errores de Prisma

#### 5. **Debugging Paso a Paso**

1. **Usar página de test:**
   ```
   https://tu-app.onrender.com/test-forgot-password
   ```

2. **Verificar respuesta del servidor:**
   - Estado 200: ✅ Éxito (revisa logs para URL)
   - Estado 400: ❌ Email inválido o faltante
   - Estado 500: ❌ Error interno (revisa logs)

3. **Revisar logs detallados:**
   ```
   🔍 Iniciando forgot-password endpoint
   🌍 NODE_ENV: production
   🔧 EMAIL_USER configurado: true/false
   🔧 EMAIL_PASS configurado: true/false
   📧 Email recibido: tes***
   ✅ Email válido, buscando usuario...
   ```

4. **Si no funciona el email:**
   - Los logs mostrarán la URL de reset: `🔗 URL de reset para logs`
   - Copia esa URL y úsala manualmente para probar

### Problemas de Base de Datos

#### Error: "database is locked"
```bash
# Detener el servidor y reiniciar
pkill -f node
npm run dev
```

#### Error: "table doesn't exist"
```bash
# Recrear la base de datos
npx prisma migrate reset --force
npm run seed
```

### Problemas de Desarrollo

#### Puerto ya en uso
```bash
# Cambiar puerto
npm run dev -- -p 3001
# O eliminar proceso
npx kill-port 3000
```

#### Módulos no encontrados
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📞 Soporte

Para preguntas, problemas o sugerencias:

- **Crea un issue** en GitHub
- **Contacta al equipo** través del formulario de contacto
- **Revisa la documentación** de las tecnologías utilizadas

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ por el equipo de Total Awareness**

### 🚨 Inicio Rápido

```bash
# Clonar e instalar
git clone https://github.com/tu-usuario/totalAwarenessCompo.git
cd totalAwarenessCompo
npm install

# Configurar base de datos
npm run seed
npx prisma generate

# Iniciar desarrollo
npm run dev
```

¡Listo para desarrollar! 🎉
