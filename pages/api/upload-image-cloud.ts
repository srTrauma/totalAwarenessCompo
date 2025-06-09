import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
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
    // Parsear el formulario
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    const [fields, files] = await form.parse(req);
    const image = Array.isArray(files.image) ? files.image[0] : files.image;
    const type = Array.isArray(fields.type) ? fields.type[0] : fields.type || 'general';

    if (!image) {
      return res.status(400).json({ message: 'No se encontró ninguna imagen' });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(image.mimetype || '')) {
      return res.status(400).json({ message: 'Tipo de archivo no válido' });
    }

    // Subir a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image.filepath, {
      folder: `total-awareness/${type}`,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    });

    res.status(200).json({
      message: 'Imagen subida correctamente',
      imageUrl: uploadResult.secure_url,
      originalName: image.originalFilename,
      size: image.size,
      type: image.mimetype,
      cloudinaryId: uploadResult.public_id
    });

  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
