
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Obtener todas las empresas, tanto públicas como privadas
    const companies = await prisma.company.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: [
        { public: 'desc' }, // Primero las públicas
        { createdAt: 'desc' }, // Más recientes primero
      ]
    });

    // Formatear la respuesta para no exponer datos innecesarios
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      description: company.description,
      ownerName: company.owner.name,
      memberCount: company._count.members,
      createdAt: company.createdAt,
      public: company.public,
    }));

    res.status(200).json(formattedCompanies);
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}