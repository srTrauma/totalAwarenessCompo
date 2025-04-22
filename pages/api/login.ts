import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { username, password } = req.body;
      
      // Validaciones básicas
      if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
      }
      
      // Buscar usuario por nombre o email
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { name: username },
            { email: username }
          ]
        },
      });
      
      if (!user) {
        // Es mejor no especificar si el usuario no existe o la contraseña es incorrecta
        // por razones de seguridad
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      // Verificar si la contraseña es la temporal
      let isPasswordValid;
      
      if (user.password === 'passwordTemporal') {
        // Para los usuarios migrados con contraseña temporal
        isPasswordValid = password === 'passwordTemporal';
      } else {
        // Verificar con bcrypt para usuarios normales
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }
      
      // No enviar la contraseña al cliente
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(200).json({ 
        message: 'Inicio de sesión exitoso', 
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  } else {
    res.status(405).json({ message: 'Método no permitido' });
  }
}