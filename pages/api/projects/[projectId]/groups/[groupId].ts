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
      // --- NUEVO: Comprobar permisos para editar grupo ---
      const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
      if (!userId) return res.status(401).json({ message: 'No autorizado' });
      const group = await prisma.group.findUnique({ where: { id: Number(groupId) }, include: { project: true } });
      if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });
      // Comprobar si el usuario es admin/owner del proyecto o owner de la empresa
      const project = await prisma.project.findUnique({ where: { id: group.projectId }, include: { company: true } });
      const membership = await prisma.projectMember.findFirst({ where: { userId, projectId: group.projectId } });
      const isCompanyOwner = project && project.company.ownerId === userId;
      if (!(isCompanyOwner || (membership && (membership.role === 'ADMIN' || membership.role === 'OWNER')))) {
        return res.status(403).json({ message: 'Sin permisos para editar el grupo' });
      }
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
