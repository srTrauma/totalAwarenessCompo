import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { workspaceId } = req.query;
    const userId = req.headers.userid;
    const { email, role = 'member' } = req.body; // cambiado a minúsculas para coincidir con el esquema

    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Se requiere una dirección de email' });
    }

    const parsedWorkspaceId = parseInt(workspaceId as string);
    const parsedUserId = parseInt(userId as string);

    if (isNaN(parsedWorkspaceId) || isNaN(parsedUserId)) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    // Verificar que el usuario que envía la solicitud sea administrador del workspace
    const requesterMembership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: parsedWorkspaceId,
        userId: parsedUserId,
        role: {
          in: ['owner', 'admin'] // Cambiado para coincidir con el esquema
        }
      },
    });

    if (!requesterMembership) {
      return res.status(403).json({
        message: 'No tienes permisos para invitar usuarios a esta sala de trabajo'
      });
    }

    // Verificar que el workspace exista
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: parsedWorkspaceId,
      },
      include: {
        company: true,
      },
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Sala de trabajo no encontrada' });
    }

    // Buscar el usuario por email
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Si el usuario no existe, crear un usuario nuevo
    if (!user) {
      // Generar una contraseña temporal
      const tempPassword = Math.random().toString(36).slice(-8);
      
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Nombre temporal basado en el email
          password: tempPassword, // Contraseña temporal
          emailConfirmed: false, // Usuario no confirmado
        },
      });      
      
      // Crear una invitación para el nuevo usuario
      await prisma.invitation.create({
        data: {
          userId: user.id,
          companyId: workspace.companyId,
          workspaceId: parsedWorkspaceId,
          role,
          status: "PENDING",
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        },
      });

      // Aquí se enviaría un email de invitación...
      console.log(`Invitación enviada a ${email}`);
    } else {
      // Verificar si el usuario ya es miembro del workspace
      const existingMembership = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: parsedWorkspaceId,
          userId: user.id,
        },
      });

      if (existingMembership) {
        return res.status(400).json({
          message: 'El usuario ya es miembro de esta sala de trabajo'
        });
      }

      // Verificar si ya existe una invitación pendiente
      const existingInvitation = await prisma.invitation.findFirst({
        where: {
          userId: user.id,
          workspaceId: parsedWorkspaceId,
          status: "PENDING",
        },
      });

      if (existingInvitation) {
        return res.status(400).json({
          message: 'Ya existe una invitación pendiente para este usuario'
        });
      }

      // Verificar si el usuario ya es miembro de la compañía
      const isCompanyMember = await prisma.userCompany.findFirst({
        where: {
          companyId: workspace.companyId,
          userId: user.id,
          approved: true
        },
      });

      if (isCompanyMember) {
        // Si ya es miembro de la compañía, añadirlo directamente al workspace
        await prisma.workspaceMember.create({
          data: {
            workspaceId: parsedWorkspaceId,
            userId: user.id,
            role,
          },
        });

        return res.status(200).json({
          message: `${user.name} ha sido añadido a la sala de trabajo`
        });
      } else {        
        // Si no es miembro de la compañía, crear invitación
        await prisma.invitation.create({
          data: {
            userId: user.id,
            companyId: workspace.companyId,
            workspaceId: parsedWorkspaceId,
            role,
            status: "PENDING",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          },
        });

        // Aquí se enviaría un email de invitación...
        console.log(`Invitación enviada a ${email}`);
      }
    }

    return res.status(200).json({
      message: `Invitación enviada a ${email}`
    });
  } catch (error) {
    console.error('Error al invitar usuario:', error);
    return res.status(500).json({
      message: 'Error al procesar la invitación',
      error: (error instanceof Error) ? error.message : String(error)
    });
  }
}