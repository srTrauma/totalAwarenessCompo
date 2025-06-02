import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { workspaceId, groupId } = req.query;
  const userId = req.headers.userid as string;

  if (!userId) {
    return res.status(401).json({ message: "Usuario no autenticado" });
  }

  if (!workspaceId || isNaN(Number(workspaceId)) || !groupId || isNaN(Number(groupId))) {
    return res.status(400).json({ message: "ID de workspace o grupo inválido" });
  }

  const workspaceIdNum = Number(workspaceId);
  const groupIdNum = Number(groupId);
  const userIdNum = Number(userId);

  try {
    // Verificar que el usuario es miembro del workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId: userIdNum,
        workspaceId: workspaceIdNum
      }
    });

    if (!membership) {
      return res.status(403).json({ message: "No tienes acceso a este workspace" });
    }

    // Verificar que el grupo pertenece al workspace
    const group = await prisma.workspaceGroup.findFirst({
      where: {
        id: groupIdNum,
        workspaceId: workspaceIdNum
      }
    });

    if (!group) {
      return res.status(404).json({ message: "Grupo no encontrado" });
    }

    if (req.method === "POST") {
      // Agregar miembro al grupo
      // Verificar permisos (solo owner/admin del workspace o líder del grupo)
      const isWorkspaceAdmin = membership.role === "owner" || membership.role === "admin";
      const isGroupLeader = await prisma.groupMember.findFirst({
        where: {
          userId: userIdNum,
          groupId: groupIdNum,
          role: "leader"
        }
      });

      if (!isWorkspaceAdmin && !isGroupLeader) {
        return res.status(403).json({ message: "No tienes permisos para agregar miembros a este grupo" });
      }

      const { userId: newMemberUserId } = req.body;

      if (!newMemberUserId) {
        return res.status(400).json({ message: "ID de usuario es obligatorio" });
      }

      // Verificar que el usuario a agregar es miembro del workspace
      const newMemberWorkspaceMembership = await prisma.workspaceMember.findFirst({
        where: {
          userId: newMemberUserId,
          workspaceId: workspaceIdNum
        }
      });

      if (!newMemberWorkspaceMembership) {
        return res.status(400).json({ message: "El usuario no es miembro de este workspace" });
      }

      // Verificar que no es ya miembro del grupo
      const existingMembership = await prisma.groupMember.findFirst({
        where: {
          userId: newMemberUserId,
          groupId: groupIdNum
        }
      });

      if (existingMembership) {
        return res.status(400).json({ message: "El usuario ya es miembro de este grupo" });
      }

      // Agregar al grupo
      const newMember = await prisma.groupMember.create({
        data: {
          userId: newMemberUserId,
          groupId: groupIdNum,
          role: "member"
        },
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
      });

      return res.status(201).json(newMember);
    }

    if (req.method === "DELETE") {
      // Eliminar miembro del grupo
      const { userId: memberToRemoveId } = req.body;

      if (!memberToRemoveId) {
        return res.status(400).json({ message: "ID de usuario es obligatorio" });
      }

      // Verificar permisos
      const isWorkspaceAdmin = membership.role === "owner" || membership.role === "admin";
      const isGroupLeader = await prisma.groupMember.findFirst({
        where: {
          userId: userIdNum,
          groupId: groupIdNum,
          role: "leader"
        }
      });
      const isSelf = userIdNum === memberToRemoveId;

      if (!isWorkspaceAdmin && !isGroupLeader && !isSelf) {
        return res.status(403).json({ message: "No tienes permisos para eliminar este miembro" });
      }

      // Eliminar del grupo
      await prisma.groupMember.deleteMany({
        where: {
          userId: memberToRemoveId,
          groupId: groupIdNum
        }
      });

      return res.status(200).json({ message: "Miembro eliminado del grupo" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    console.error("Error en miembros de grupo API:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
