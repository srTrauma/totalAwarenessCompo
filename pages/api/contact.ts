import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL_USER, // tu email de envío
        pass: process.env.CONTACT_EMAIL_PASS, // tu contraseña o app password
      },
    });

    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: 'jaimequermarijuan@gmail.com',
      subject: 'Nuevo mensaje de contacto desde Total Awareness',
      text: message,
      html: `<p><strong>Nombre:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Mensaje:</strong><br/>${message}</p>`,
    });

    res.status(200).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error enviando email:', error);
    res.status(500).json({ message: 'Error al enviar el mensaje' });
  }
}