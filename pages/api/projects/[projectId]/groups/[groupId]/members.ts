import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId, groupId } = req.query;
  const userId = req.headers.userid ? parseInt(req.headers.userid as string) : null;
  if (!userId) return res.status(401).json({ message: 'No autorizado' });
  if (!projectId || isNaN(Number(projectId)) || !groupId || isNaN(Number(groupId))) {
    return res.status(400).json({ message: 'ID de proyecto o grupo inválido' });
  }
  const projectIdNum = Number(projectId);
  const groupIdNum = Number(groupId);

  try {
    // Verificar que el usuario es miembro del proyecto
    const membership = await prisma.projectMember.findFirst({
      where: { userId, projectId: projectIdNum }
    });
    if (!membership) return res.status(403).json({ message: 'No tienes acceso a este proyecto' });

    if (req.method === 'GET') {
      // Listar miembros del grupo
      const group = await prisma.group.findUnique({
        where: { id: groupIdNum },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, profileImage: true } }
            }
          }
        }
      });
      if (!group) return res.status(404).json({ message: 'Grupo no encontrado' });
      return res.status(200).json(group.members);
    }

    if (req.method === 'POST') {
      // Solo admin/owner/leader o owner de la empresa pueden agregar miembros
      let isCompanyOwner = false;
      if (!['owner', 'admin', 'leader'].includes(membership.role)) {
        // Solo si no es admin/owner/leader, comprobamos si es owner de la empresa
        const projectData = await prisma.project.findUnique({ where: { id: projectIdNum }, include: { company: true } });
        isCompanyOwner = !!(projectData && projectData.company && projectData.company.ownerId === userId);
        if (!isCompanyOwner) {
          return res.status(403).json({ message: 'Sin permisos para agregar miembros' });
        }
      }
      const { userId: newUserId } = req.body;
      if (!newUserId) return res.status(400).json({ message: 'userId requerido' });
      // Obtener el proyecto para saber el companyId
      const project = await prisma.project.findUnique({ where: { id: projectIdNum } });
      if (!project) return res.status(404).json({ message: 'Proyecto no encontrado' });
      // Verificar que el usuario a agregar es miembro de la empresa
      const userCompany = await prisma.userCompany.findFirst({
        where: { userId: newUserId, companyId: project.companyId, approved: true }
      });
      if (!userCompany) return res.status(400).json({ message: 'El usuario no es miembro de la empresa' });
      // Si no es miembro del proyecto, agregarlo como 'member'
      let targetMembership = await prisma.projectMember.findFirst({
        where: { userId: newUserId, projectId: projectIdNum }
      });
      if (!targetMembership) {
        targetMembership = await prisma.projectMember.create({
          data: { userId: newUserId, projectId: projectIdNum, role: 'member' }
        });
      }
      // Verificar que no esté ya en el grupo
      const exists = await prisma.groupMember.findFirst({
        where: { userId: newUserId, groupId: groupIdNum }
      });
      if (exists) return res.status(400).json({ message: 'El usuario ya es miembro del grupo' });
      const newMember = await prisma.groupMember.create({
        data: { userId: newUserId, groupId: groupIdNum, role: 'member' },
        include: { user: { select: { id: true, name: true, email: true, profileImage: true } } }
      });
      return res.status(201).json(newMember);
    }

    if (req.method === 'DELETE') {
      // Solo admin/owner/leader pueden eliminar miembros
      if (!['owner', 'admin', 'leader'].includes(membership.role)) {
        return res.status(403).json({ message: 'Sin permisos para eliminar miembros' });
      }
      const { userId: removeUserId } = req.body;
      if (!removeUserId) return res.status(400).json({ message: 'userId requerido' });
      await prisma.groupMember.deleteMany({
        where: { userId: removeUserId, groupId: groupIdNum }
      });
      return res.status(200).json({ message: 'Miembro eliminado del grupo' });
    }

    return res.status(405).json({ message: 'Método no permitido' });
  } catch (error) {
    console.error('Error en miembros de grupo:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
