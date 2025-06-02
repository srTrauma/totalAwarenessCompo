import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const userId = req.headers.userid as string;

    if (!userId) {
      return res.status(400).json({ message: 'El ID del usuario es obligatorio' });
    }

    // Obtener todas las empresas donde el usuario es propietario
    const ownedCompanies = await prisma.company.findMany({
      where: {
        ownerId: Number(userId),
      },
      select: {
        id: true,
        name: true,
        description: true,
        public: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json(ownedCompanies);
  } catch (error) {
    console.error('Error al obtener empresas propias:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}
