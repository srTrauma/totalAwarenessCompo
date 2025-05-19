const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Eliminar todos los roles existentes
  await prisma.role.deleteMany({});
  console.log('Todos los roles han sido eliminados.');

  // Eliminar todas las FAQs existentes
  await prisma.faq.deleteMany({});
  console.log('Todas las FAQs han sido eliminadas.');

  // Crear roles
  const roles = [
    { name: 'OWNER', description: 'Propietario de la empresa', level: 1 },
    { name: 'ADMIN', description: 'Administrador con permisos elevados', level: 2 },
    { name: 'MEMBER', description: 'Miembro con permisos estándar', level: 3 },
    { name: 'VIEWER', description: 'Usuario con permisos de solo lectura', level: 4 },
  ];

  for (const role of roles) {
    await prisma.role.create({
      data: role,
    });
    console.log(`Rol ${role.name} creado`);
  }

  // Crear FAQs
  const faqs = [
    { question: '¿Cómo puedo registrarme?', answer: 'Puedes registrarte haciendo clic en el botón de registro en la página principal.' },
    { question: '¿Cómo restablezco mi contraseña?', answer: 'Haz clic en "Olvidé mi contraseña" en la página de inicio de sesión y sigue las instrucciones.' },
    { question: '¿Dónde puedo encontrar más información?', answer: 'Consulta la sección de ayuda en el menú principal.' },
  ];

  for (const faq of faqs) {
    await prisma.faq.create({
      data: faq,
    });
    console.log(`FAQ "${faq.question}" creada`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });