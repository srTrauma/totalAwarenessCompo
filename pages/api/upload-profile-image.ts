import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

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
      uploadDir: isProduction ? undefined : path.join(process.cwd(), 'public/uploads/profiles'),
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024, // 2MB
    });

    // Crear directorio si no existe (solo en desarrollo)
    if (!isProduction) {
      const uploadDir = path.join(process.cwd(), 'public/uploads/profiles');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    }

    const [fields, files] = await form.parse(req);
    const image = Array.isArray(files.image) ? files.image[0] : files.image;

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
        folder: 'total-awareness/profiles',
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      });
      
      imageUrl = uploadResult.secure_url;
      response.cloudinaryId = uploadResult.public_id;
    } else {
      // Usar sistema de archivos local en desarrollo
      const fileExtension = path.extname(image.originalFilename || '');
      const uniqueFileName = `profile_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
      const uploadDir = path.join(process.cwd(), 'public/uploads/profiles');
      const newPath = path.join(uploadDir, uniqueFileName);

      // Mover archivo a la ubicación final
      fs.renameSync(image.filepath, newPath);

      // URL pública del archivo
      imageUrl = `/uploads/profiles/${uniqueFileName}`;
    }

    // Si hay un userId en los campos, actualizar la base de datos
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    if (userId) {
      try {
        const updatedUser = await prisma.user.update({
          where: { id: parseInt(userId) },
          data: { profileImage: imageUrl },
          select: { id: true, name: true, email: true, profileImage: true }
        });
        response.user = updatedUser;
        response.message = 'Imagen de perfil actualizada correctamente';
      } catch (error) {
        console.error('Error updating user profile image:', error);
        // No retornar error aquí, el archivo ya se subió correctamente
      }
    }

    response.imageUrl = imageUrl;
    res.status(200).json(response);

  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}
