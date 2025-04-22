import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear roles si no existen
  const roles = [
    { name: 'OWNER', description: 'Propietario de la empresa', level: 1 },
    { name: 'ADMIN', description: 'Administrador con permisos elevados', level: 2 },
    { name: 'MEMBER', description: 'Miembro con permisos estándar', level: 3 },
    { name: 'VIEWER', description: 'Usuario con permisos de solo lectura', level: 4 },
  ]

  for (const role of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: role.name },
    })

    if (!existingRole) {
      await prisma.role.create({
        data: role,
      })
      console.log(`Rol ${role.name} creado`)
    } else {
      console.log(`Rol ${role.name} ya existe`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })