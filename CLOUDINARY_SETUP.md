# Configuración de Cloudinary para Producción

## Problema en Render
Render no permite escribir archivos en el sistema de archivos de forma persistente, por lo que las imágenes subidas se pierden al reiniciar el servidor. Por esto, necesitamos usar un servicio de almacenamiento externo como Cloudinary.

## Configuración de Cloudinary

### 1. Crear cuenta en Cloudinary
1. Ve a [cloudinary.com](https://cloudinary.com) y crea una cuenta gratuita
2. Una vez creada, ve al Dashboard
3. Copia los valores de:
   - Cloud Name
   - API Key
   - API Secret

### 2. Configurar variables de entorno en Render
En tu proyecto de Render, ve a Environment y agrega estas variables:

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### 3. Desarrollo local
Para desarrollo local, crea un archivo `.env.local` con:

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

## Funcionamiento

- **Desarrollo**: Las imágenes se guardan en `public/uploads/` localmente
- **Producción**: Las imágenes se suben a Cloudinary automáticamente

## APIs modificadas

Las siguientes APIs ahora soportan Cloudinary:
- `/api/upload-image.ts` - Subida general de imágenes
- `/api/upload-profile-image.ts` - Subida de imágenes de perfil

## Ventajas de Cloudinary

1. **Persistencia**: Las imágenes no se pierden al reiniciar el servidor
2. **Optimización**: Cloudinary optimiza automáticamente las imágenes
3. **CDN**: Las imágenes se sirven desde un CDN global
4. **Transformaciones**: Redimensionado automático y optimización de calidad
5. **Capacidad**: 25GB gratis al mes

## Transformaciones aplicadas

### Imágenes de perfil
- Tamaño: 400x400px
- Crop: fill con gravity face (enfoca en caras)
- Optimización automática de calidad y formato

### Otras imágenes
- Límite máximo: 1200x1200px
- Optimización automática de calidad y formato
