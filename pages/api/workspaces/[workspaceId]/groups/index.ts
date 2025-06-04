import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { workspaceId } = req.query;
  const userId = req.headers.userid as string;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  if (!workspaceId || isNaN(Number(workspaceId))) {
    return res.status(400).json({ message: "ID de proyecto inválido" });
  }

  const projectIdNum = Number(workspaceId);
  const userIdNum = Number(userId);

  try {
    // Verificar que el usuario es miembro del proyecto
    const membership = await prisma.projectMember.findFirst({
      where: {
        userId: userIdNum,
        projectId: projectIdNum
      }
    });

    if (!membership) {
      return res.status(403).json({ message: "No tienes acceso a este proyecto" });
    }

    if (req.method === "GET") {
      // Obtener todos los grupos del proyecto
      const groups = await prisma.group.findMany({
        where: {
          projectId: projectIdNum
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              }
            }
          },
          _count: {
            select: {
              tasks: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      return res.status(200).json(groups);
    }

    if (req.method === "POST") {
      // Verificar permisos para crear grupos (solo owner/admin)
      if (membership.role !== "owner" && membership.role !== "admin") {
        return res.status(403).json({ message: "No tienes permisos para crear grupos" });
      }

      const { name, description } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "El nombre del grupo es obligatorio" });
      }

      // Verificar que no existe otro grupo con el mismo nombre en el proyecto
      const existingGroup = await prisma.group.findFirst({
        where: {
          projectId: projectIdNum,
          name: name.trim()
        }
      });
      if (existingGroup) {
        return res.status(400).json({ message: "Ya existe un grupo con ese nombre en este proyecto" });
      }

      const newGroup = await prisma.group.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          projectId: projectIdNum
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              }
            }
          },
          _count: {
            select: {
              tasks: true
            }
          }
        }
      });

      // Agregar al creador como líder del grupo
      await prisma.groupMember.create({
        data: {
          userId: userIdNum,
          groupId: newGroup.id,
          role: "leader"
        }
      });

      // Recargar el grupo con la información del miembro
      const groupWithMembers = await prisma.group.findUnique({
        where: { id: newGroup.id },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true
                }
              }
            }
          },
          _count: {
            select: {
              tasks: true
            }
          }
        }
      });
      return res.status(201).json(groupWithMembers);
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    console.error("Error en grupos API:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
