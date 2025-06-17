import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔍 Iniciando forgot-password endpoint');
  console.log('🌍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 EMAIL_USER configurado:', !!process.env.EMAIL_USER);
  console.log('🔧 EMAIL_PASS configurado:', !!process.env.EMAIL_PASS);
  console.log('🔧 DATABASE_URL configurado:', !!process.env.DATABASE_URL);

  // Solo permitir POST
  if (req.method !== 'POST') {
    console.log('❌ Método no permitido:', req.method);
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email } = req.body;
    console.log('📧 Email recibido:', email ? email.substring(0, 3) + '***' : 'undefined');    // Validación de entrada
    if (!email) {
      console.log('❌ Email no proporcionado');
      return res.status(400).json({ message: 'El email es requerido' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      console.log('❌ Email inválido:', email);
      return res.status(400).json({ message: 'Email inválido' });
    }

    console.log('✅ Email válido, buscando usuario...');

    // Verificar conexión a base de datos
    let user;
    try {
      console.log('🔍 Conectando a base de datos...');
      user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });
      console.log('✅ Consulta de usuario completada:', !!user);    } catch (dbError) {
      console.error('❌ Error de base de datos:', dbError);
      return res.status(500).json({ 
        message: 'Error de conexión a la base de datos',
        error: process.env.NODE_ENV === 'development' ? String(dbError) : undefined
      });
    }    if (!user) {
      console.log('❌ Usuario no encontrado para email:', email.substring(0, 3) + '***');
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ 
        message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.' 
      });
    }

    console.log('✅ Usuario encontrado, generando token...');

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    console.log('🔑 Token generado, guardando en DB...');

    // Guardar token en la base de datos
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetExpires
        }
      });
      console.log('✅ Token guardado en base de datos');
    } catch (updateError) {
      console.error('❌ Error actualizando usuario:', updateError);
      return res.status(500).json({ 
        message: 'Error guardando token de reset',
        error: process.env.NODE_ENV === 'development' ? String(updateError) : undefined
      });
    }    // Verificar configuración de email
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    console.log('📧 Configuración de email:');
    console.log('  - EMAIL_USER:', !!emailUser);
    console.log('  - EMAIL_PASS:', !!emailPass);
    console.log('  - BASE_URL:', baseUrl);

    if (!emailUser || !emailPass) {
      console.log('⚠️ Credenciales de email no configuradas');
      console.log('🔗 URL de reset (para logs):', `${baseUrl}/reset-password?token=${resetToken}`);
      
      return res.status(200).json({ 
        message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        ...(process.env.NODE_ENV === 'development' && { 
          resetUrl: `${baseUrl}/reset-password?token=${resetToken}`,
          note: 'Email no configurado - usando enlace directo en desarrollo'
        })
      });
    }    console.log('📧 Configurando transporter de nodemailer...');

    // Configurar nodemailer usando las variables de entorno correctas
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // URL de reset
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    console.log('🔗 URL de reset generada:', resetUrl.substring(0, 50) + '...');

    // Configurar email
    const mailOptions = {
      from: process.env.EMAIL_FROM || emailUser,
      to: email,
      subject: 'Restablecer tu contraseña - Total Awareness',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background: #0056b3; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Restablecer Contraseña</h1>
              <p>Total Awareness</p>
            </div>
            <div class="content">
              <p>Hola,</p>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta asociada con este email.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">🔑 Restablecer Contraseña</a>
              </div>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                  <li>Este enlace expira en <strong>1 hora</strong></li>
                  <li>Solo se puede usar una vez</li>
                  <li>Si no solicitaste este cambio, ignora este email</li>
                </ul>
              </div>
              
              <p>Si el botón no funciona, copia y pega esta URL en tu navegador:</p>
              <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace;">
                ${resetUrl}
              </p>
              
              <p>Si tienes problemas, contacta con soporte.</p>
              <p>Saludos,<br>Equipo de Total Awareness</p>
            </div>
            <div class="footer">
              <p>Este email fue enviado automáticamente, por favor no responder.</p>
            </div>
          </div>
        </body>
        </html>      `
    };

    // Enviar email
    console.log('📤 Intentando enviar email...');
    try {
      await transporter.sendMail(mailOptions);
      console.log('✅ Email de reset enviado exitosamente a:', email.substring(0, 3) + '***');    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
      
      // Mostrar detalles del error de forma segura
      const errorDetails = emailError as any;
      console.error('❌ Detalles del error:', {
        code: errorDetails?.code,
        command: errorDetails?.command,
        response: errorDetails?.response
      });
      
      // En desarrollo, mostrar el enlace directamente
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Para desarrollo, usa este enlace directamente:', resetUrl);
        return res.status(200).json({ 
          message: 'Error de email, pero puedes usar este enlace de desarrollo.',
          resetUrl: resetUrl,
          error: String(emailError)
        });
      }
      
      // En producción, devolver éxito pero loguear el enlace para depuración
      console.log('🔗 URL de reset para logs de producción:', resetUrl);
      return res.status(200).json({ 
        message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        note: 'Email delivery failed but token was created. Check server logs.'
      });
    }

    console.log('✅ Proceso completado exitosamente');
    res.status(200).json({ 
      message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.' 
    });

  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  } finally {
    await prisma.$disconnect();
  }
}
