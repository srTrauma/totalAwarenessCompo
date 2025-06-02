import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { workspaceId } = req.query;
  const workspaceIdNum = parseInt(workspaceId as string);

  if (isNaN(workspaceIdNum)) {
    return res.status(400).json({ message: 'ID de workspace inválido' });
  }

  try {
    const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
    
    if (!userId) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (req.method === 'GET') {
      // Obtener miembros del workspace
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceIdNum,
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

      if (!workspace) {
        return res.status(404).json({ message: 'Workspace no encontrado' });
      }

      const allMembers = workspace.members.map(member => ({
        id: member.user.id,
        role: member.role,
        joinedAt: member.joinedAt,
        user: member.user
      }));

      res.status(200).json(allMembers);

    } else if (req.method === 'POST') {
      // Agregar miembro al workspace
      const { userEmail, role = 'member' } = req.body;

      // Verificar que el usuario actual es admin
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceIdNum,
          members: {
            some: {
              userId: userId,
              role: { in: ['admin', 'owner'] }
            }
          }
        }
      });

      if (!workspace) {
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
      const existingMember = await prisma.workspaceMember.findFirst({
        where: {
          workspaceId: workspaceIdNum,
          userId: targetUser.id
        }
      });

      if (existingMember) {
        return res.status(400).json({ message: 'El usuario ya es miembro del workspace' });
      }

      const validRoles = ['member', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }

      // Agregar el miembro
      const newMember = await prisma.workspaceMember.create({
        data: {
          workspaceId: workspaceIdNum,
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

    } else if (req.method === 'PUT') {
      // Actualizar rol de miembro
      const { targetUserId, role } = req.body;

      if (!targetUserId || !role) {
        return res.status(400).json({ message: 'ID de usuario y rol son requeridos' });
      }

      // Verificar que el usuario actual es admin
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceIdNum,
          members: {
            some: {
              userId: userId,
              role: { in: ['admin', 'owner'] }
            }
          }
        }
      });

      if (!workspace) {
        return res.status(403).json({ message: 'Sin permisos para modificar miembros' });
      }

      const validRoles = ['member', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rol inválido' });
      }

      const updatedMember = await prisma.workspaceMember.update({
        where: {
          userId_workspaceId: {
            workspaceId: workspaceIdNum,
            userId: targetUserId
          }
        },
        data: { role },
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

      res.status(200).json({
        id: updatedMember.user.id,
        role: updatedMember.role,
        joinedAt: updatedMember.joinedAt,
        user: updatedMember.user
      });

    } else if (req.method === 'DELETE') {
      // Remover miembro del workspace
      const { targetUserId } = req.body;

      if (!targetUserId) {
        return res.status(400).json({ message: 'ID de usuario es requerido' });
      }

      // Verificar que el usuario actual es admin
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceIdNum,
          members: {
            some: {
              userId: userId,
              role: { in: ['admin', 'owner'] }
            }
          }
        }
      });

      if (!workspace) {
        return res.status(403).json({ message: 'Sin permisos para remover miembros' });
      }

      await prisma.workspaceMember.delete({
        where: {
          userId_workspaceId: {
            workspaceId: workspaceIdNum,
            userId: targetUserId
          }
        }
      });

      res.status(200).json({ message: 'Miembro removido correctamente' });

    } else {
      res.status(405).json({ message: 'Método no permitido' });
    }

  } catch (error) {
    console.error('Error in workspace members API:', error);
    
    if (error instanceof Error && error.message.includes('Record to')) {
      return res.status(404).json({ message: 'Miembro o workspace no encontrado' });
    }
    
    res.status(500).json({ 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error : 'Error interno'
    });
  } finally {
    await prisma.$disconnect();
  }
}
