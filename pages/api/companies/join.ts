import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { userId, companyId } = req.body;

    if (!userId || !companyId) {
      return res.status(400).json({ message: 'El ID del usuario y el ID de la empresa son obligatorios' });
    }

    // Verificar que el usuario y la empresa existen
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        owner: true
      }
    });

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    // Verificar si el usuario ya es miembro de la empresa
    const existingMembership = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId,
        }
      }
    });

    if (existingMembership) {
      return res.status(400).json({ message: 'Ya eres miembro de esta empresa' });
    }

    // Obtener el rol de MEMBER por defecto
    const memberRole = await prisma.role.findFirst({
      where: { name: 'MEMBER' },
    });

    if (!memberRole) {
      return res.status(500).json({ message: 'Error al obtener el rol de miembro' });
    }

    // Verificar si la empresa es pública o privada
    const needsApproval = !company.public;

    // Añadir el usuario a la empresa
    const membership = await prisma.userCompany.create({
      data: {
        userId,
        companyId,
        roleId: memberRole.id,
        approved: !needsApproval, // Si es pública, se aprueba automáticamente
      },
    });

    // Crear notificación para el propietario
    let notificationTitle: string;
    let notificationMessage: string;

    if (company.public) {
      notificationTitle = "Nuevo miembro en tu empresa";
      notificationMessage = `${user.name} se ha unido a tu empresa "${company.name}".`;
    } else {
      notificationTitle = "Nueva solicitud de membresía";
      notificationMessage = `${user.name} ha solicitado unirse a tu empresa "${company.name}". Revisa las solicitudes pendientes para aprobar o rechazar.`;
    }

    await prisma.notification.create({
      data: {
        userId: company.ownerId,
        title: notificationTitle,
        message: notificationMessage,
      },
    });

    // Obtener administradores para también notificarles
    const adminMemberships = await prisma.userCompany.findMany({
      where: {
        companyId: companyId,
        approved: true,
        role: {
          level: {
            lte: 2 // OWNER (1) y ADMIN (2)
          }
        },
        userId: {
          not: company.ownerId // Excluir al propietario ya que ya se le notificó
        }
      },
      include: {
        user: true
      }
    });

    // Crear notificaciones para administradores
    for (const adminMembership of adminMemberships) {
      await prisma.notification.create({
        data: {
          userId: adminMembership.userId,
          title: notificationTitle,
          message: notificationMessage,
        },
      });
    }    // Enviar email al propietario
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.CONTACT_EMAIL_USER,
          pass: process.env.CONTACT_EMAIL_PASS,
        },
      });

      const emailSubject = company.public 
        ? `Nuevo miembro en ${company.name}` 
        : `Nueva solicitud para ${company.name}`;

      const emailMessage = company.public
        ? `Hola ${company.owner.name},\n\n${user.name} (${user.email}) se ha unido a tu empresa "${company.name}".\n\nPuedes ver los detalles en tu panel de control.`
        : `Hola ${company.owner.name},\n\n${user.name} (${user.email}) ha solicitado unirse a tu empresa "${company.name}".\n\nPuedes revisar y aprobar/rechazar la solicitud en tu panel de gestión de miembros.`;

      await transporter.sendMail({
        from: process.env.CONTACT_EMAIL_USER,
        to: company.owner.email,
        subject: emailSubject,
        text: emailMessage,
        html: `
          <h2>${emailSubject}</h2>
          <p>Hola ${company.owner.name},</p>
          <p>${company.public 
            ? `<strong>${user.name}</strong> (${user.email}) se ha unido a tu empresa "<strong>${company.name}</strong>".`
            : `<strong>${user.name}</strong> (${user.email}) ha solicitado unirse a tu empresa "<strong>${company.name}</strong>".`
          }</p>
          <p>${company.public 
            ? 'Puedes ver los detalles en tu panel de control.'
            : 'Puedes revisar y aprobar/rechazar la solicitud en tu panel de gestión de miembros.'
          }</p>
          <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/Dashboard" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir al panel de control</a></p>
        `,
      });
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      // No fallar la operación si el email falla
    }

    res.status(201).json({ 
      message: needsApproval 
        ? 'Solicitud enviada correctamente. Necesita aprobación del propietario.' 
        : 'Te has unido correctamente a la empresa.',
      membership 
    });
  } catch (error) {
    console.error('Error al unirse a la empresa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
  