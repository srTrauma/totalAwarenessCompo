import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'El email es requerido' });
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return res.status(200).json({ 
        message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.' 
      });
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      }
    });

    // Configurar nodemailer usando las variables de entorno correctas
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // URL de reset (cambiar en producción)
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Configurar email
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
        </html>
      `
    };    // Enviar email
    try {
      // Verificar si las credenciales están configuradas
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️ Credenciales de email no configuradas. Email simulado.');
        console.log('📧 Email que se enviaría a:', email);
        console.log('🔗 URL de reset:', resetUrl);
        
        return res.status(200).json({ 
          message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
          debug: process.env.NODE_ENV === 'development' ? { resetUrl } : undefined
        });
      }

      await transporter.sendMail(mailOptions);
      console.log('✅ Email de reset enviado exitosamente a:', email);
    } catch (emailError) {
      console.error('❌ Error enviando email:', emailError);
      
      // En desarrollo, mostrar el enlace directamente
      if (process.env.NODE_ENV === 'development') {
        console.log('🔗 Para desarrollo, usa este enlace directamente:', resetUrl);
        return res.status(200).json({ 
          message: 'Error de email, pero puedes usar este enlace de desarrollo.',
          resetUrl: resetUrl
        });
      }
      
      return res.status(500).json({ 
        message: 'Error al enviar el email. Verifica tu configuración de email.' 
      });
    }

    res.status(200).json({ 
      message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.' 
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
