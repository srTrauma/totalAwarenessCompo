import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { name, email, password } = req.body;
            
            // Validación básica en el servidor
            if (!name || !email || !password) {
                return res.status(400).json({ message: 'Todos los campos son obligatorios' });
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'El formato del email no es válido' });
            }
            
            // Validar longitud de contraseña
            if (password.length < 6) {
                return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
            }
            
            // Verificar si el usuario ya existe
            const existingUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { name },
                        { email }
                    ]
                }
            });
            
            if (existingUser) {
                return res.status(400).json({ 
                    message: existingUser.name === name 
                        ? 'El nombre de usuario ya está en uso' 
                        : 'El email ya está registrado' 
                });
            }
            
            // Cifrar la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Crear usuario
            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
                select: { // No enviamos la contraseña en la respuesta
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true
                }
            });
            
            res.status(201).json({
                message: 'Usuario registrado correctamente',
                user
            });
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    } else {
        res.status(405).json({ message: 'Método no permitido' });
    }
}