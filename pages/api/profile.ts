import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers.userid as string;

  if (!userId) {
    return res.status(401).json({ message: 'Usuario no autenticado' });
  }

  if (req.method === 'GET') {
    try {      const user = await prisma.user.findUnique({
        where: { id: Number(userId) },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          faqProfile: true,
          createdAt: true,
          emailConfirmed: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else if (req.method === 'PUT') {    try {
      const { name, email, faqProfile } = req.body;

      if (!name || !email) {
        return res.status(400).json({ message: 'Nombre y email son obligatorios' });
      }

      // Verificar si el email ya está en uso por otro usuario
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          id: { not: Number(userId) }
        }
      });

      if (existingUser) {
        return res.status(409).json({ message: 'Este email ya está en uso' });
      }      const updatedUser = await prisma.user.update({
        where: { id: Number(userId) },
        data: { 
          name, 
          email, 
          faqProfile: faqProfile || null 
        },
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
          faqProfile: true,
          createdAt: true,
          emailConfirmed: true
        }
      });

      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}