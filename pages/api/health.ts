import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const config = {
      nodeEnv: process.env.NODE_ENV,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL,
      emailConfigured: {
        user: !!process.env.EMAIL_USER,
        pass: !!process.env.EMAIL_PASS,
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || '587'
      },
      database: {
        url: !!process.env.DATABASE_URL,
        type: process.env.DATABASE_URL?.includes('file:') ? 'SQLite' : 'Other'
      },
      cloudinary: {
        configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
      },
      timestamp: new Date().toISOString()
    };

    console.log('📊 Health check ejecutado:', config);

    return res.status(200).json({
      status: 'OK',
      message: 'Sistema funcionando correctamente',
      config,
      recommendations: getRecommendations(config)
    });

  } catch (error) {
    console.error('❌ Error en health check:', error);
    return res.status(500).json({ 
      status: 'ERROR',
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

function getRecommendations(config: any): string[] {
  const recommendations: string[] = [];

  if (!config.emailConfigured.user || !config.emailConfigured.pass) {
    recommendations.push('⚠️ Configurar EMAIL_USER y EMAIL_PASS para el reset de contraseñas');
  }

  if (!config.cloudinary.configured) {
    recommendations.push('💡 Configurar Cloudinary para subida de imágenes (opcional)');
  }

  if (config.nodeEnv === 'development' && !config.baseUrl?.includes('localhost')) {
    recommendations.push('🔧 NEXT_PUBLIC_BASE_URL apunta a producción en desarrollo');
  }

  if (config.nodeEnv === 'production' && config.baseUrl?.includes('localhost')) {
    recommendations.push('🚨 NEXT_PUBLIC_BASE_URL apunta a localhost en producción');
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Configuración óptima del sistema');
  }

  return recommendations;
}
