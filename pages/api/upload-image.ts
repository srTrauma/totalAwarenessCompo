import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurar para no parsear el body automáticamente
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const isProduction = process.env.NODE_ENV === 'production';

    // Parsear el formulario
    const form = formidable({
      uploadDir: isProduction ? undefined : path.join(process.cwd(), 'public/uploads/temp'),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    // Crear directorio temporal si no existe (solo en desarrollo)
    if (!isProduction) {
      const tempDir = path.join(process.cwd(), 'public/uploads/temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
    }

    const [fields, files] = await form.parse(req);
    const image = Array.isArray(files.image) ? files.image[0] : files.image;
    const type = Array.isArray(fields.type) ? fields.type[0] : fields.type || 'general';

    if (!image) {
      return res.status(400).json({ message: 'No se encontró ninguna imagen' });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.mimetype || '')) {
      // Eliminar archivo temporal
      if (!isProduction && fs.existsSync(image.filepath)) {
        fs.unlinkSync(image.filepath);
      }
      return res.status(400).json({ message: 'Tipo de archivo no válido' });
    }

    let imageUrl: string;
    let response: any = {
      message: 'Imagen subida correctamente',
      originalName: image.originalFilename,
      size: image.size,
      type: image.mimetype
    };

    if (isProduction) {
      // Usar Cloudinary en producción
      const uploadResult = await cloudinary.uploader.upload(image.filepath, {
        folder: `total-awareness/${type}`,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      });
      
      imageUrl = uploadResult.secure_url;
      response.cloudinaryId = uploadResult.public_id;
    } else {
      // Usar sistema de archivos local en desarrollo
      let targetDir = '';
      switch (type) {
        case 'profile':
          targetDir = 'profiles';
          break;
        case 'post':
          targetDir = 'posts';
          break;
        case 'company':
          targetDir = 'companies';
          break;
        default:
          targetDir = 'general';
          break;
      }

      // Crear directorio de destino si no existe
      const uploadDir = path.join(process.cwd(), 'public/uploads', targetDir);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generar nombre único para el archivo
      const fileExtension = path.extname(image.originalFilename || '');
      const uniqueFileName = `${type}_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
      const newPath = path.join(uploadDir, uniqueFileName);

      // Mover archivo a la ubicación final
      fs.renameSync(image.filepath, newPath);

      // URL pública del archivo
      imageUrl = `/uploads/${targetDir}/${uniqueFileName}`;
    }

    response.imageUrl = imageUrl;
    res.status(200).json(response);

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
