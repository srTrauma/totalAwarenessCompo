import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { companyId } = req.body;
    const userId = req.headers.userid as string;

    if (!companyId || !userId) {
      return res.status(400).json({ message: 'El ID de la empresa y el ID del usuario son obligatorios' });
    }

    // Verificar que la empresa existe
    const company = await prisma.company.findUnique({
      where: { id: Number(companyId) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    // Verificar que el usuario es miembro de la empresa
    const membership = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: Number(userId),
          companyId: Number(companyId),
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        role: true,
      }
    });

    if (!membership) {
      return res.status(404).json({ message: 'No eres miembro de esta empresa' });
    }

    // No permitir que el propietario se salga de su propia empresa
    if (company.ownerId === Number(userId)) {
      return res.status(400).json({ 
        message: 'El propietario no puede salirse de su propia empresa. Para eliminar la empresa, ve a la configuración de empresa.' 
      });
    }

    // Eliminar la membresía del usuario
    await prisma.userCompany.delete({
      where: {
        userId_companyId: {
          userId: Number(userId),
          companyId: Number(companyId),
        }
      }
    });

    // Crear notificación para el propietario
    await prisma.notification.create({
      data: {
        userId: company.ownerId,
        title: `${membership.user.name} ha salido de la empresa`,
        message: `${membership.user.name} (${membership.user.email}) ha salido de la empresa "${company.name}".`,
      },
    });

    // También notificar a los administradores
    const adminMemberships = await prisma.userCompany.findMany({
      where: {
        companyId: Number(companyId),
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
          title: `${membership.user.name} ha salido de la empresa`,
          message: `${membership.user.name} (${membership.user.email}) ha salido de la empresa "${company.name}".`,
        },
      });
    }

    res.status(200).json({ 
      message: 'Has salido de la empresa correctamente',
      companyName: company.name 
    });

  } catch (error) {
    console.error('Error al salir de la empresa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
