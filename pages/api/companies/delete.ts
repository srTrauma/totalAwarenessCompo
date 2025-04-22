
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const { companyId } = req.body;
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

    // Solo el propietario puede eliminar la empresa
    if (company.ownerId !== Number(userId)) {
      return res.status(403).json({ message: 'Solo el propietario puede eliminar la empresa' });
    }

    // Eliminar la empresa
    // Prisma eliminará automáticamente las relaciones debido a onDelete: Cascade
    await prisma.company.delete({
      where: { id: companyId },
    });

    res.status(200).json({ message: 'Empresa eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar empresa:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}