import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
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
    // Parsear el formulario
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024, // 2MB
    });

    const [fields, files] = await form.parse(req);
    const image = Array.isArray(files.image) ? files.image[0] : files.image;
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;

    if (!image) {
      return res.status(400).json({ message: 'No se encontró ninguna imagen' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'ID de usuario requerido' });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.mimetype || '')) {
      return res.status(400).json({ message: 'Tipo de archivo no válido' });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Subir a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image.filepath, {
      folder: 'total-awareness/profiles',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    });

    // Actualizar la base de datos con la nueva imagen
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { profileImage: uploadResult.secure_url },
      select: { id: true, name: true, email: true, profileImage: true }
    });

    res.status(200).json({
      message: 'Imagen de perfil actualizada correctamente',
      imageUrl: uploadResult.secure_url,
      user: updatedUser,
      cloudinaryId: uploadResult.public_id
    });

  } catch (error) {
    console.error('Error uploading profile image to Cloudinary:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}
