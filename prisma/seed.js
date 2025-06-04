const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Datos de ejemplo para usuarios
const usersData = [
  { name: 'admin', email: 'admin@example.com', password: 'admin123', profileImage: 'https://i.pravatar.cc/150?img=1', faqProfile: 'admin' },
  { name: 'maria_garcia', email: 'maria@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=2', faqProfile: 'user' },
  { name: 'juan_lopez', email: 'juan@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=3', faqProfile: 'user' },
  { name: 'ana_martinez', email: 'ana@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=4', faqProfile: 'user' },
  { name: 'carlos_rodriguez', email: 'carlos@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=5', faqProfile: 'user' },
  { name: 'sofia_hernandez', email: 'sofia@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=6', faqProfile: 'user' },
  { name: 'diego_perez', email: 'diego@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=7', faqProfile: 'user' },
  { name: 'lucia_sanchez', email: 'lucia@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=8', faqProfile: 'user' },
  { name: 'miguel_torres', email: 'miguel@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=9', faqProfile: 'user' },
  { name: 'elena_ramirez', email: 'elena@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=10', faqProfile: 'user' },
  { name: 'pablo_flores', email: 'pablo@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=11', faqProfile: 'user' },
  { name: 'carmen_vargas', email: 'carmen@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=12', faqProfile: 'user' },
  { name: 'roberto_jimenez', email: 'roberto@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=13', faqProfile: 'user' },
  { name: 'valeria_morales', email: 'valeria@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=14', faqProfile: 'user' },
  { name: 'fernando_castro', email: 'fernando@example.com', password: 'password123', profileImage: 'https://i.pravatar.cc/150?img=15', faqProfile: 'user' }
];

// Datos de ejemplo para empresas
const companiesData = [
  { name: 'TechCorp Solutions', description: 'Empresa líder en soluciones tecnológicas', public: true },
  { name: 'Innovar Digital', description: 'Transformación digital para empresas', public: true },
  { name: 'GreenTech Industries', description: 'Tecnología sostenible y eco-friendly', public: false },
  { name: 'DataFlow Analytics', description: 'Análisis de datos y business intelligence', public: true },
  { name: 'CloudSync Services', description: 'Servicios en la nube y sincronización', public: false },
  { name: 'AI Future Labs', description: 'Laboratorio de inteligencia artificial', public: true },
  { name: 'WebDev Masters', description: 'Desarrollo web profesional', public: true },
  { name: 'Mobile First Co', description: 'Aplicaciones móviles innovadoras', public: false }
];

// Datos de ejemplo para proyectos
const projectsData = [
  { name: 'Plataforma E-commerce', description: 'Desarrollo de tienda online completa' },
  { name: 'App Mobile Banking', description: 'Aplicación bancaria para móviles' },
  { name: 'Sistema CRM', description: 'Customer Relationship Management' },
  { name: 'Dashboard Analytics', description: 'Panel de control y análisis' },
  { name: 'API REST Microservicios', description: 'Arquitectura de microservicios' },
  { name: 'Sistema de Inventario', description: 'Gestión de inventario en tiempo real' },
  { name: 'Portal Empleados', description: 'Portal interno para empleados' },
  { name: 'Chat Bot IA', description: 'Asistente virtual con IA' }
];

// Datos de ejemplo para grupos
const groupsData = [
  { name: 'Frontend Team', description: 'Equipo de desarrollo frontend' },
  { name: 'Backend Team', description: 'Equipo de desarrollo backend' },
  { name: 'QA Testing', description: 'Equipo de calidad y testing' },
  { name: 'DevOps', description: 'Operaciones y despliegue' },
  { name: 'UI/UX Design', description: 'Diseño de interfaces' },
  { name: 'Data Science', description: 'Análisis de datos' },
  { name: 'Marketing Digital', description: 'Estrategias de marketing' },
  { name: 'Soporte Técnico', description: 'Atención al cliente' }
];

// Datos de ejemplo para tareas
const tasksData = [
  { title: 'Diseñar mockups de la página principal', description: 'Crear wireframes y mockups para la landing page', priority: 'high', status: 'in_progress' },
  { title: 'Implementar autenticación JWT', description: 'Sistema de login y registro con tokens JWT', priority: 'urgent', status: 'pending' },
  { title: 'Configurar base de datos', description: 'Setup inicial de PostgreSQL y migraciones', priority: 'high', status: 'completed' },
  { title: 'Crear tests unitarios', description: 'Cobertura de tests para componentes principales', priority: 'medium', status: 'pending' },
  { title: 'Optimizar consultas SQL', description: 'Mejorar performance de queries lentas', priority: 'medium', status: 'in_progress' },
  { title: 'Documentar API endpoints', description: 'Swagger/OpenAPI documentation', priority: 'low', status: 'pending' },
  { title: 'Setup CI/CD pipeline', description: 'Configurar despliegue automático', priority: 'high', status: 'completed' },
  { title: 'Implementar notificaciones push', description: 'Sistema de notificaciones en tiempo real', priority: 'medium', status: 'pending' },
  { title: 'Auditoria de seguridad', description: 'Revisión completa de vulnerabilidades', priority: 'urgent', status: 'pending' },
  { title: 'Migración a React 18', description: 'Actualizar versión de React', priority: 'low', status: 'in_progress' }
];

// Datos de ejemplo para posts
const postsData = [
  { title: '¡Buscamos Desarrollador Full Stack!', content: 'Únete a nuestro equipo de desarrollo. Ofrecemos excelente ambiente laboral y crecimiento profesional.', type: 'job_offer', imageUrl: 'https://picsum.photos/400/200?random=1' },
  { title: 'Nueva actualización de la plataforma', content: 'Hemos lanzado nuevas funcionalidades que mejorarán tu experiencia de usuario.', type: 'news', imageUrl: 'https://picsum.photos/400/200?random=2' },
  { title: 'Evento: Tech Conference 2025', content: 'No te pierdas la conferencia más importante del año. Registro gratuito para empleados.', type: 'event', imageUrl: 'https://picsum.photos/400/200?random=3' },
  { title: 'Resultados del último trimestre', content: 'Excelentes resultados financieros gracias al trabajo en equipo.', type: 'general', imageUrl: 'https://picsum.photos/400/200?random=4' },
  { title: 'Nuevas políticas de trabajo remoto', content: 'Implementamos flexibilidad total para trabajo desde casa.', type: 'news', imageUrl: 'https://picsum.photos/400/200?random=5' },
  { title: 'Vacante: Diseñador UX/UI Senior', content: 'Buscamos talento creativo para liderar nuestros proyectos de diseño.', type: 'job_offer', imageUrl: 'https://picsum.photos/400/200?random=6' }
];

// Datos de ejemplo para FAQs
const faqsData = [
  { question: '¿Cómo puedo registrarme en la plataforma?', answer: 'Puedes registrarte haciendo clic en el botón "Registro" en la página principal y completando el formulario.', profile: 'user' },
  { question: '¿Cómo restablezco mi contraseña?', answer: 'Haz clic en "Olvidé mi contraseña" en la página de login y sigue las instrucciones enviadas a tu email.', profile: 'user' },
  { question: '¿Puedo cambiar mi foto de perfil?', answer: 'Sí, ve a tu perfil y haz clic en "Editar perfil" para cambiar tu imagen.', profile: 'user' },
  { question: '¿Cómo creo una nueva empresa?', answer: 'En el dashboard, selecciona "Nueva Empresa" y completa la información requerida.', profile: 'user' },
  { question: '¿Cómo invito usuarios a mi empresa?', answer: 'Ve a la sección "Miembros" de tu empresa y usa la función "Invitar Usuario".', profile: 'admin' },
  { question: '¿Puedo cambiar los permisos de un usuario?', answer: 'Sí, como administrador puedes modificar roles desde la gestión de miembros.', profile: 'admin' },
  { question: '¿Cómo elimino una empresa?', answer: 'Solo el propietario puede eliminar una empresa desde la configuración avanzada.', profile: 'admin' },
  { question: '¿Dónde veo las estadísticas de uso?', answer: 'Las estadísticas están disponibles en el panel de administración.', profile: 'admin' },
  { question: '¿La plataforma tiene soporte 24/7?', answer: 'Ofrecemos soporte por email de lunes a viernes de 9 AM a 6 PM.', profile: 'user' },
  { question: '¿Puedo exportar los datos de mi empresa?', answer: 'Sí, puedes exportar datos desde la sección de configuración.', profile: 'user' },
  { question: '¿Hay límite en el número de proyectos?', answer: 'No hay límite en la cantidad de proyectos que puedes crear.', profile: 'user' },
  { question: '¿Cómo asigno tareas a miembros del equipo?', answer: 'Desde la vista de proyecto, selecciona la tarea y asígnala a un miembro específico.', profile: 'user' }
];

async function main() {
  console.log('🚀 Iniciando limpieza de la base de datos...');
  
  // Limpiar datos existentes en orden correcto (debido a las relaciones)
  await prisma.taskAttachment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.groupMember.deleteMany({});
  await prisma.group.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.invitation.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.userCompany.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.faq.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  
  console.log('✅ Base de datos limpiada');

  // 1. Crear roles
  console.log('📝 Creando roles...');
  const roles = [
    { name: 'OWNER', description: 'Propietario de la empresa', level: 1 },
    { name: 'ADMIN', description: 'Administrador con permisos elevados', level: 2 },
    { name: 'MEMBER', description: 'Miembro con permisos estándar', level: 3 },
    { name: 'VIEWER', description: 'Usuario con permisos de solo lectura', level: 4 },
  ];

  const createdRoles = {};
  for (const role of roles) {
    const createdRole = await prisma.role.create({ data: role });
    createdRoles[role.name] = createdRole;
    console.log(`✅ Rol ${role.name} creado`);
  }

  // 2. Crear usuarios (ya validados)
  console.log('👥 Creando usuarios...');
  const createdUsers = [];
  for (const userData of usersData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
        emailConfirmed: true // Ya confirmados
      }
    });
    createdUsers.push(user);
    console.log(`✅ Usuario ${userData.name} creado`);
  }

  // 3. Crear empresas
  console.log('🏢 Creando empresas...');
  const createdCompanies = [];
  for (let i = 0; i < companiesData.length; i++) {
    const companyData = companiesData[i];
    const owner = createdUsers[i % createdUsers.length];
    
    const company = await prisma.company.create({
      data: {
        ...companyData,
        ownerId: owner.id
      }
    });
    createdCompanies.push(company);
    console.log(`✅ Empresa ${companyData.name} creada`);
  }

  // 4. Crear membresías de usuarios en empresas
  console.log('🤝 Creando membresías...');
  for (const company of createdCompanies) {
    // El owner siempre es miembro con rol OWNER
    await prisma.userCompany.create({
      data: {
        userId: company.ownerId,
        companyId: company.id,
        roleId: createdRoles.OWNER.id,
        approved: true
      }
    });

    // Agregar otros miembros aleatorios
    const randomMembers = createdUsers.filter(u => u.id !== company.ownerId).slice(0, Math.floor(Math.random() * 5) + 2);
    for (const member of randomMembers) {
      const roleNames = ['ADMIN', 'MEMBER', 'VIEWER'];
      const randomRole = roleNames[Math.floor(Math.random() * roleNames.length)];
      
      await prisma.userCompany.create({
        data: {
          userId: member.id,
          companyId: company.id,
          roleId: createdRoles[randomRole].id,
          approved: true
        }
      });
    }
  }
  console.log('✅ Membresías creadas');

  // 5. Crear proyectos
  console.log('📋 Creando proyectos...');
  const createdProjects = [];
  for (let i = 0; i < projectsData.length; i++) {
    const projectData = projectsData[i];
    const company = createdCompanies[i % createdCompanies.length];
    
    const project = await prisma.project.create({
      data: {
        ...projectData,
        companyId: company.id
      }
    });
    createdProjects.push(project);
    console.log(`✅ Proyecto ${projectData.name} creado`);
  }

  // 6. Crear miembros de proyectos
  console.log('👨‍💻 Asignando miembros a proyectos...');
  for (const project of createdProjects) {
    const companyMembers = await prisma.userCompany.findMany({
      where: { companyId: project.companyId },
      include: { user: true }
    });

    const projectMembers = companyMembers.slice(0, Math.floor(Math.random() * companyMembers.length) + 1);
    for (const member of projectMembers) {
      await prisma.projectMember.create({
        data: {
          userId: member.userId,
          projectId: project.id,
          role: member.roleId === createdRoles.OWNER.id ? 'leader' : 'member'
        }
      });
    }
  }
  console.log('✅ Miembros de proyectos asignados');

  // 7. Crear grupos
  console.log('👥 Creando grupos...');
  const createdGroups = [];
  for (let i = 0; i < groupsData.length; i++) {
    const groupData = groupsData[i];
    const project = createdProjects[i % createdProjects.length];
    
    const group = await prisma.group.create({
      data: {
        ...groupData,
        projectId: project.id
      }
    });
    createdGroups.push(group);
    console.log(`✅ Grupo ${groupData.name} creado`);
  }

  // 8. Crear miembros de grupos
  console.log('🎯 Asignando miembros a grupos...');
  for (const group of createdGroups) {
    const projectMembers = await prisma.projectMember.findMany({
      where: { projectId: group.projectId }
    });

    const groupMembers = projectMembers.slice(0, Math.floor(Math.random() * projectMembers.length) + 1);
    for (const member of groupMembers) {
      await prisma.groupMember.create({
        data: {
          userId: member.userId,
          groupId: group.id,
          role: member.role === 'leader' ? 'leader' : 'member'
        }
      });
    }
  }
  console.log('✅ Miembros de grupos asignados');

  // 9. Crear tareas
  console.log('📝 Creando tareas...');
  for (let i = 0; i < tasksData.length; i++) {
    const taskData = tasksData[i];
    const group = createdGroups[i % createdGroups.length];
    const creator = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const assignee = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 30) + 1);
    
    await prisma.task.create({
      data: {
        ...taskData,
        groupId: group.id,
        creatorId: creator.id,
        assigneeId: assignee.id,
        dueDate: dueDate
      }
    });
    console.log(`✅ Tarea "${taskData.title}" creada`);
  }

  // 10. Crear posts
  console.log('📢 Creando posts...');
  for (let i = 0; i < postsData.length; i++) {
    const postData = postsData[i];
    const company = createdCompanies[i % createdCompanies.length];
    const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    
    await prisma.post.create({
      data: {
        ...postData,
        authorId: author.id,
        companyId: company.id
      }
    });
    console.log(`✅ Post "${postData.title}" creado`);
  }

  // 11. Crear FAQs
  console.log('❓ Creando FAQs...');
  for (const faqData of faqsData) {
    const creator = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const responder = createdUsers.find(u => u.faqProfile === 'admin') || createdUsers[0];
    
    await prisma.faq.create({
      data: {
        ...faqData,
        createdByUserId: creator.id,
        createdByUserName: creator.name,
        respondedByUserId: responder.id,
        respondedByUserName: responder.name,
        respondedAt: new Date()
      }
    });
    console.log(`✅ FAQ "${faqData.question}" creada`);
  }

  // 12. Crear notificaciones
  console.log('🔔 Creando notificaciones...');
  const notificationsData = [
    { title: 'Bienvenido a la plataforma', message: 'Tu cuenta ha sido creada exitosamente' },
    { title: 'Nueva tarea asignada', message: 'Se te ha asignado una nueva tarea en el proyecto' },
    { title: 'Invitación a empresa', message: 'Has sido invitado a unirte a una empresa' },
    { title: 'Proyecto completado', message: 'El proyecto ha sido marcado como completado' },
    { title: 'Nuevo miembro en equipo', message: 'Un nuevo miembro se ha unido a tu equipo' }
  ];

  for (const user of createdUsers) {
    const randomNotifications = notificationsData.slice(0, Math.floor(Math.random() * 3) + 1);
    for (const notif of randomNotifications) {
      await prisma.notification.create({
        data: {
          ...notif,
          userId: user.id,
          read: Math.random() > 0.5
        }
      });
    }
  }
  console.log('✅ Notificaciones creadas');

  // 13. Crear algunas invitaciones pendientes
  console.log('📧 Creando invitaciones...');
  for (let i = 0; i < 5; i++) {
    const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
    const company = createdCompanies[Math.floor(Math.random() * createdCompanies.length)];
    const project = createdProjects.filter(p => p.companyId === company.id)[0];
    
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    
    await prisma.invitation.create({
      data: {
        userId: user.id,
        companyId: company.id,
        projectId: project?.id,
        status: 'PENDING',
        role: 'MEMBER',
        expires: expires
      }
    });
  }
  console.log('✅ Invitaciones creadas');

  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('\n📊 Resumen de datos creados:');
  console.log(`👥 Usuarios: ${createdUsers.length}`);
  console.log(`🏢 Empresas: ${createdCompanies.length}`);
  console.log(`📋 Proyectos: ${createdProjects.length}`);
  console.log(`👨‍💻 Grupos: ${createdGroups.length}`);
  console.log(`📝 Tareas: ${tasksData.length}`);
  console.log(`📢 Posts: ${postsData.length}`);
  console.log(`❓ FAQs: ${faqsData.length}`);
  console.log('\n✅ Todos los usuarios están validados y listos para usar');
  console.log('🔑 Credenciales de ejemplo:');
  console.log('   Email: admin@example.com | Password: admin123');
  console.log('   Email: maria@example.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  });