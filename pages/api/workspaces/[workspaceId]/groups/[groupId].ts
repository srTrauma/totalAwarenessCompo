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
    // Verificar que el usuario es miembro del workspace con permisos
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

    if (req.method === "DELETE") {
      // Verificar permisos para eliminar grupos (solo owner/admin)
      if (membership.role !== "owner" && membership.role !== "admin") {
        return res.status(403).json({ message: "No tienes permisos para eliminar grupos" });
      }

      // Eliminar el grupo (esto también eliminará automáticamente las tareas y miembros por CASCADE)
      await prisma.workspaceGroup.delete({
        where: {
          id: groupIdNum
        }
      });

      return res.status(200).json({ message: "Grupo eliminado correctamente" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    console.error("Error en grupo específico API:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
