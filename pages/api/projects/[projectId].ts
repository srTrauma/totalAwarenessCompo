import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'PUT') {
    return handlePut(req, res);
  } else {
    return res.status(405).json({ message: 'Método no permitido' });
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  try {
    const projectId = parseInt(req.query.projectId as string);
    const userId = parseInt(req.headers.userid as string);
    const { name } = req.body;

    if (isNaN(projectId) || isNaN(userId)) {
      return res.status(400).json({ message: 'ID de proyecto o usuario inválido' });
    }

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'El nombre del proyecto es requerido' });
    }

    if (name.trim().length > 100) {
      return res.status(400).json({ message: 'El nombre del proyecto no puede exceder 100 caracteres' });
    }

    // Verificar que el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, companyId: true }
    });

    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Verificar permisos - debe ser miembro del proyecto con rol ADMIN/OWNER o owner de la empresa
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    const company = await prisma.company.findUnique({
      where: { id: project.companyId },
      select: { ownerId: true }
    });

    const isCompanyOwner = company && company.ownerId === userId;
    const canManage = (membership && (membership.role === 'ADMIN' || membership.role === 'OWNER')) || isCompanyOwner;

    if (!canManage) {
      return res.status(403).json({ message: 'No tienes permisos para editar este proyecto' });
    }

    // Actualizar el proyecto
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name: name.trim() },
      select: {
        id: true,
        name: true,
        description: true,
        companyId: true,
        company: { select: { id: true, name: true } }
      }
    });

    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Error al actualizar proyecto:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const projectId = parseInt(req.query.projectId as string);
    const userId = parseInt(req.query.userId as string);

    if (isNaN(projectId) || isNaN(userId)) {
      return res.status(400).json({ message: 'ID de proyecto o usuario inválido' });
    }

    // Obtener el proyecto con datos básicos (siempre)
    const projectBasic = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        companyId: true,
        company: { select: { id: true, name: true } },
      },
    });
    if (!projectBasic) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }

    // Verificar si el usuario pertenece a la empresa (tabla userCompany)
    const companyUser = await prisma.userCompany.findFirst({
      where: {
        companyId: projectBasic.companyId,
        userId: userId,
      },
    });
    if (!companyUser) {
      return res.status(403).json({ message: 'No tienes acceso a este proyecto' });
    }

    // Verificar si el usuario es miembro del proyecto
    const membership = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
    });

    // NUEVO: comprobar si es owner de la empresa
    const company = await prisma.company.findUnique({
      where: { id: projectBasic.companyId },
      select: { ownerId: true }
    });
    const isCompanyOwner = company && company.ownerId === userId;

    if (!membership) {
      // Si NO es miembro, devolver solo datos básicos
      return res.status(200).json({
        ...projectBasic,
        members: [],
        groups: [],
        canManage: isCompanyOwner, // <-- ahora el owner de la empresa puede gestionar aunque no sea miembro
      });
    }

    // Si es miembro, devolver todos los datos completos
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        companyId: true,
        company: { select: { id: true, name: true } },
        members: {
          select: {
            id: true,
            userId: true,
            role: true,
            joinedAt: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
              },
            },
          },
          orderBy: { joinedAt: 'desc' },
        },
        groups: {
          select: {
            id: true,
            name: true,
            description: true,
            _count: { select: { tasks: true } },
          },
        },
      },
    });
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    const canManage = membership.role === 'ADMIN' || membership.role === 'OWNER' || isCompanyOwner;
    const formattedProject = {
      ...project,
      groups: project.groups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        taskCount: group._count.tasks,
      })),
      canManage,
    };
    return res.status(200).json(formattedProject);
  } catch (error) {
    console.error('Error al obtener proyecto:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  } finally {
    await prisma.$disconnect();
  }
}
