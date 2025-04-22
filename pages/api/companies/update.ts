
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { companyId, name, description, public: isPublic } = req.body;
    const userId = req.headers.userid as string;

    if (!companyId) {
      return res.status(400).json({ message: 'El ID de la empresa es obligatorio' });
    }

    // Verificar que la empresa existe
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return res.status(404).json({ message: 'Empresa no encontrada' });
    }

    // Verificar que el usuario tiene permisos para actualizar la empresa
    const userMembership = await prisma.userCompany.findUnique({
      where: {
        userId_companyId: {
          userId: Number(userId),
          companyId,
        }
      },
      include: {
        role: true,
      }
    });

    // Solo el propietario o admin puede actualizar la empresa
    const isOwner = company.ownerId === Number(userId);
    const isAdmin = userMembership?.role?.level !== undefined && userMembership.role.level <= 2;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'No tienes permisos para actualizar esta empresa' });
    }

    // Solo el propietario puede cambiar si la empresa es pública o no
    if (isPublic !== undefined && !isOwner) {
      return res.status(403).json({ message: 'Solo el propietario puede cambiar el estado público de la empresa' });
    }

    // Si se cambia el nombre, verificar que no exista otra empresa del mismo propietario con ese nombre
    if (name && name !== company.name) {
      const existingCompany = await prisma.company.findFirst({
        where: {
          name,
          ownerId: company.ownerId,
          id: { not: companyId }
        }
      });

      if (existingCompany) {
        return res.status(400).json({ message: 'Ya existe una empresa con ese nombre' });
      }
    }

    // Actualizar la empresa
    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: name || company.name,
        description: description !== undefined ? description : company.description,
        public: isPublic !== undefined ? isPublic : company.public,
      }
    });

    res.status(200).json({
      message: 'Empresa actualizada correctamente',
      company: updatedCompany,
    });
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}