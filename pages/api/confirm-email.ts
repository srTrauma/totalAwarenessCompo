import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const successHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Correo confirmado</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-green-50 flex items-center justify-center min-h-screen">
  <div class="bg-white p-8 rounded-lg shadow-lg text-center">
    <svg class="mx-auto mb-4 w-16 h-16 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
    <h1 class="text-2xl font-bold mb-2 text-green-700">¡Correo confirmado!</h1>
    <p class="text-gray-700 mb-4">Tu correo electrónico ha sido confirmado correctamente.<br>Puedes cerrar esta ventana e iniciar sesión.</p>
    <a href="/Login" class="inline-block px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Ir a iniciar sesión</a>
  </div>
</body>
</html>
`;

const errorHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Error de confirmación</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-red-50 flex items-center justify-center min-h-screen">
  <div class="bg-white p-8 rounded-lg shadow-lg text-center">
    <svg class="mx-auto mb-4 w-16 h-16 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
    </svg>
    <h1 class="text-2xl font-bold mb-2 text-red-700">Error de confirmación</h1>
    <p class="text-gray-700 mb-4">El enlace de confirmación no es válido o ha expirado.</p>
    <a href="/Login" class="inline-block px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Ir a iniciar sesión</a>
  </div>
</body>
</html>
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    res.setHeader("Content-Type", "text/html");
    return res.status(400).send(errorHtml);
  }

  const user = await prisma.user.findFirst({
    where: { emailConfirmationToken: token },
  });

  if (!user) {
    res.setHeader("Content-Type", "text/html");
    return res.status(400).send(errorHtml);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailConfirmed: true,
      emailConfirmationToken: null,
    },
  });

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(successHtml);
}