
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { userId, name, description, isPublic } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ message: 'El ID del usuario y el nombre de la empresa son obligatorios' });
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si ya existe una empresa con ese nombre para este usuario
    const existingCompany = await prisma.company.findFirst({
      where: {
        name,
        ownerId: userId,
      },
    });

    if (existingCompany) {
      return res.status(400).json({ message: 'Ya tienes una empresa con ese nombre' });
    }

    // Obtener el rol de OWNER (id=1)
    const ownerRole = await prisma.role.findFirst({
      where: { name: 'OWNER' },
    });

    if (!ownerRole) {
      return res.status(500).json({ message: 'Error al obtener el rol de propietario' });
    }

    // Crear la empresa
    const company = await prisma.company.create({
      data: {
        name,
        description,
        public: isPublic || false,
        owner: {
          connect: { id: userId },
        },
        members: {
          create: {
            userId,
            roleId: ownerRole.id,
            approved: true, // El propietario está aprobado automáticamente
          }
        }
      },
    });

    res.status(201).json(company);
  } catch (error) {
    console.error('Error al crear empresa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}