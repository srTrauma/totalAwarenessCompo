import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  const projectIdNum = parseInt(projectId as string);

  if (isNaN(projectIdNum)) {
    return res.status(400).json({ message: 'ID de proyecto inválido' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method === 'GET') {
      // Obtener miembros del proyecto
      const project = await prisma.project.findFirst({
        where: {
          id: projectIdNum,
          members: {
            some: {
              userId: userId
            }
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              }
            }
          }
        }
      });

      if (!project) {
        return res.status(404).json({ message: 'Proyecto no encontrado' });
      }

      const allMembers = project.members.map(member => ({
        id: member.user.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user
      }));

      res.status(200).json(allMembers);

    } else if (req.method === 'POST') {
      // Agregar miembro al proyecto
      const { userEmail, role = 'member' } = req.body;

      // Verificar que el usuario actual es admin
      const project = await prisma.project.findFirst({
        where: {
          id: projectIdNum,
          members: {
            some: {
              userId: userId,
              role: { in: ['admin', 'owner'] }
            }
          }
        }
      });

      if (!project) {
        return res.status(403).json({ message: 'Sin permisos para agregar miembros' });
      }

      if (!userEmail) {
        return res.status(400).json({ message: 'Email del usuario es requerido' });
      }

      // Buscar el usuario por email
      const targetUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true
        }
      });

      if (!targetUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verificar que no esté ya como miembro
      const existingMember = await prisma.projectMember.findFirst({
        where: {
          projectId: projectIdNum,
          userId: targetUser.id
        }
      });

      if (existingMember) {
        return res.status(400).json({ message: 'El usuario ya es miembro del proyecto' });
      }

      const validRoles = ['member', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }

      // Agregar el miembro
      const newMember = await prisma.projectMember.create({
        data: {
          projectId: projectIdNum,
          userId: targetUser.id,
          role: role
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true
            }
          }
        }
      });

      res.status(201).json({
        id: newMember.user.id,
        role: newMember.role,
        joinedAt: newMember.joinedAt,
        user: newMember.user
      });
    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }
  } catch (error) {
    console.error('Error en miembros de proyecto API:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
