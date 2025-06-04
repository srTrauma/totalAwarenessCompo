import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

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
      uploadDir: path.join(process.cwd(), 'public/uploads/profiles'),
      keepExtensions: true,
      maxFileSize: 2 * 1024 * 1024, // 2MB
    });

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public/uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
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
      fs.unlinkSync(image.filepath);
      return res.status(400).json({ message: 'Tipo de archivo no válido' });
    }

    // Generar nombre único para el archivo
    const fileExtension = path.extname(image.originalFilename || '');
    const uniqueFileName = `profile_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
    const newPath = path.join(uploadDir, uniqueFileName);

    // Mover archivo a la ubicación final
    fs.renameSync(image.filepath, newPath);

    // URL pública del archivo
    const imageUrl = `/uploads/profiles/${uniqueFileName}`;

    // Si hay un userId en los campos, actualizar la base de datos
    const userId = Array.isArray(fields.userId) ? fields.userId[0] : fields.userId;
    if (userId) {
      try {
        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: { profileImage: imageUrl }
        });
      } catch (error) {
        console.error('Error updating user profile image:', error);
        // No retornar error aquí, el archivo ya se subió correctamente
      }
    }

    res.status(200).json({
      message: 'Imagen subida correctamente',
      imageUrl
    });

  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
