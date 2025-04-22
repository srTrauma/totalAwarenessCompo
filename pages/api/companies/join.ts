
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

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

    // Obtener el rol de MEMBER por defecto (id=3)
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