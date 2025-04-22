import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET para listar miembros de una empresa
  if (req.method === 'GET') {
    try {
      const { companyId } = req.query;
      const userId = req.headers.userid as string;

      if (!companyId) {
        return res.status(400).json({ message: 'El ID de la empresa es obligatorio' });
      }

      // Verificar que el usuario tiene permisos para ver los miembros
      const userMembership = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: Number(userId),
            companyId: Number(companyId),
          }
        },
        include: {
          role: true,
        }
      });

      if (!userMembership || !userMembership.approved) {
        return res.status(403).json({ message: 'No tienes permisos para ver los miembros de esta empresa' });
      }

      // Obtener todos los miembros de la empresa
      const members = await prisma.userCompany.findMany({
        where: {
          companyId: Number(companyId),
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
        },
        orderBy: [
          { approved: 'asc' },
          { role: { level: 'asc' } },
        ],
      });

      res.status(200).json(members);
    } catch (error) {
      console.error('Error al listar miembros:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } 
  // PUT para aprobar/rechazar solicitudes o cambiar roles
  else if (req.method === 'PUT') {
    try {
      const { membershipId, approved, roleId } = req.body;
      const userId = req.headers.userid as string;

      if (!membershipId || (approved === undefined && !roleId)) {
        return res.status(400).json({ message: 'Parámetros incompletos para la operación' });
      }

      // Obtener la membresía que se va a modificar
      const membership = await prisma.userCompany.findUnique({
        where: { id: membershipId },
        include: {
          company: true,
        },
      });

      if (!membership) {
        return res.status(404).json({ message: 'Membresía no encontrada' });
      }

      // Verificar que el usuario actual es propietario o admin de la empresa
      const requestingUserMembership = await prisma.userCompany.findUnique({
        where: {
          userId_companyId: {
            userId: Number(userId),
            companyId: membership.companyId,
          },
        },
        include: {
          role: true,
        },
      });

      // Si no es propietario ni tiene rol de administrador (nivel <= 2), no tiene permisos
      const isOwner = membership.company.ownerId === Number(userId);
      const isAdmin = requestingUserMembership?.role?.level !== undefined && requestingUserMembership.role.level <= 2;
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
      }

      // Si se está actualizando el rol, verificar que el usuario tenga permiso
      if (roleId) {
        // Solo el owner puede asignar roles de ADMIN
        const newRole = await prisma.role.findUnique({
          where: { id: roleId }
        });
        
        if (!newRole) {
          return res.status(404).json({ message: 'Rol no encontrado' });
        }
        
        if (newRole.level <= 2 && !isOwner) {
          return res.status(403).json({ message: 'Solo el propietario puede asignar roles de administrador' });
        }

        // Actualizar el rol
        const updatedMembership = await prisma.userCompany.update({
          where: { id: membershipId },
          data: { roleId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            role: true,
          },
        });
        
        return res.status(200).json({
          message: 'Rol actualizado correctamente',
          membership: updatedMembership,
        });
      }
      
      // Procesar aprobación/rechazo
      if (approved !== undefined) {
        if (approved) {
          // Aprobar la membresía
          const updatedMembership = await prisma.userCompany.update({
            where: { id: membershipId },
            data: { approved: true },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              role: true,
            },
          });
          
          return res.status(200).json({
            message: 'Solicitud aprobada correctamente',
            membership: updatedMembership,
          });
        } else {
          // Rechazar la solicitud (eliminar la membresía)
          await prisma.userCompany.delete({
            where: { id: membershipId },
          });
          
          return res.status(200).json({
            message: 'Solicitud rechazada correctamente',
          });
        }
      }

      return res.status(400).json({ message: 'Operación no especificada' });
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
  // DELETE para eliminar un miembro de la empresa
  else if (req.method === 'DELETE') {
    try {
      const { membershipId } = req.body;
      const userId = req.headers.userid as string;

      if (!membershipId) {
        return res.status(400).json({ message: 'El ID de membresía es obligatorio' });
      }

      // Obtener la membresía que se va a eliminar
      const membership = await prisma.userCompany.findUnique({
        where: { id: membershipId },
        include: {
          company: true,
        },
      });

      if (!membership) {
        return res.status(404).json({ message: 'Membresía no encontrada' });
      }

      // Verificar permisos: solo el propietario, un admin o el propio usuario pueden eliminar la membresía
      const isOwner = membership.company.ownerId === Number(userId);
      const isSelf = membership.userId === Number(userId);
      
      // Si no es propietario ni el usuario mismo, verificar si es admin
      if (!isOwner && !isSelf) {
        const requestingUserMembership = await prisma.userCompany.findUnique({
          where: {
            userId_companyId: {
              userId: Number(userId),
              companyId: membership.companyId,
            },
          },
          include: {
            role: true,
          },
        });
        
        const isAdmin = requestingUserMembership?.role?.level !== undefined && requestingUserMembership.role.level <= 2;
        
        if (!isAdmin) {
          return res.status(403).json({ message: 'No tienes permisos para eliminar este miembro' });
        }
      }

      // No permitir eliminar al propietario de la empresa
      if (membership.company.ownerId === membership.userId) {
        return res.status(400).json({ message: 'No se puede eliminar al propietario de la empresa' });
      }

      // Eliminar la membresía
      await prisma.userCompany.delete({
        where: { id: membershipId },
      });

      res.status(200).json({ message: 'Miembro eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar miembro:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}