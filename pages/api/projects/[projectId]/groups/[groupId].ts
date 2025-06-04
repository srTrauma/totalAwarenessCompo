import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { groupId } = req.query;
  if (!groupId || isNaN(Number(groupId))) {
    return res.status(400).json({ message: 'groupId inválido' });
  }
  try {
    if (req.method === 'GET') {
      const group = await prisma.group.findUnique({
        where: { id: Number(groupId) },
        include: { members: { include: { user: true } }, tasks: true },
      });
      if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });
      return res.status(200).json(group);
    } else if (req.method === 'PUT') {
      const { name, description } = req.body;
      const updated = await prisma.group.update({
        where: { id: Number(groupId) },
        data: { name, description },
      });
      return res.status(200).json(updated);
    } else if (req.method === 'DELETE') {
      await prisma.group.delete({ where: { id: Number(groupId) } });
      return res.status(204).end();
    } else {
      return res.status(405).json({ message: 'Método no permitido' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
