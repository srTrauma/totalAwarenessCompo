import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ message: "El email ya está registrado" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const token = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      emailConfirmed: false,
      emailConfirmationToken: token,
    },
  });

  // Configura el transporter de nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.CONTACT_EMAIL_USER,
      pass: process.env.CONTACT_EMAIL_PASS,
    },
  });

  const confirmUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/confirm-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.CONTACT_EMAIL_USER,
    to: email,
    subject: "Confirma tu correo electrónico",
    html: `<p>Hola ${name},</p>
           <p>Por favor confirma tu correo haciendo clic en el siguiente enlace:</p>
           <a href="${confirmUrl}">${confirmUrl}</a>`,
  });

  res.status(201).json({ message: "Usuario registrado. Revisa tu correo para confirmar tu email." });
}