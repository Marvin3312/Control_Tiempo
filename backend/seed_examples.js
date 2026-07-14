const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando poblado de ejemplos...');

  // 1. Departamentos
  let dpto1 = await prisma.departamentos.findFirst({ where: { nombredepto: 'Tecnología' } });
  if (!dpto1) dpto1 = await prisma.departamentos.create({ data: { nombredepto: 'Tecnología' } });

  let dpto2 = await prisma.departamentos.findFirst({ where: { nombredepto: 'Recursos Humanos' } });
  if (!dpto2) dpto2 = await prisma.departamentos.create({ data: { nombredepto: 'Recursos Humanos' } });

  // 2. Puestos
  let puesto1 = await prisma.puestos.findFirst({ where: { nombrepuesto: 'Desarrollador Senior' } });
  if (!puesto1) puesto1 = await prisma.puestos.create({ data: { nombrepuesto: 'Desarrollador Senior' } });

  let puesto2 = await prisma.puestos.findFirst({ where: { nombrepuesto: 'Reclutador' } });
  if (!puesto2) puesto2 = await prisma.puestos.create({ data: { nombrepuesto: 'Reclutador' } });

  // 3. Clientes
  let cliente1 = await prisma.clientes.findFirst({ where: { nombrecliente: 'Acme Corp' } });
  if (!cliente1) cliente1 = await prisma.clientes.create({ data: { nombrecliente: 'Acme Corp', activo: true } });

  let cliente2 = await prisma.clientes.findFirst({ where: { nombrecliente: 'Globex Inc' } });
  if (!cliente2) cliente2 = await prisma.clientes.create({ data: { nombrecliente: 'Globex Inc', activo: true } });

  // 4. Proyectos
  let proyecto1 = await prisma.proyectos.findFirst({ where: { nombreproyecto: 'Portal Web Acme' } });
  if (!proyecto1) proyecto1 = await prisma.proyectos.create({ data: { nombreproyecto: 'Portal Web Acme', clienteid: cliente1.clienteid, activo: true } });

  let proyecto2 = await prisma.proyectos.findFirst({ where: { nombreproyecto: 'Sistema Interno Globex' } });
  if (!proyecto2) proyecto2 = await prisma.proyectos.create({ data: { nombreproyecto: 'Sistema Interno Globex', clienteid: cliente2.clienteid, activo: true } });

  // 5. Tareas
  let tarea1 = await prisma.tareas.findFirst({ where: { descripciontarea: 'Desarrollo Frontend' } });
  if (!tarea1) tarea1 = await prisma.tareas.create({ data: { descripciontarea: 'Desarrollo Frontend', proyectoid: proyecto1.proyectoid, escargable: true } });

  let tarea2 = await prisma.tareas.findFirst({ where: { descripciontarea: 'Reunión de Requerimientos' } });
  if (!tarea2) tarea2 = await prisma.tareas.create({ data: { descripciontarea: 'Reunión de Requerimientos', proyectoid: proyecto1.proyectoid, escargable: false } });

  let tarea3 = await prisma.tareas.findFirst({ where: { descripciontarea: 'Desarrollo Backend' } });
  if (!tarea3) tarea3 = await prisma.tareas.create({ data: { descripciontarea: 'Desarrollo Backend', proyectoid: proyecto2.proyectoid, escargable: true } });

  // 6. Empleados
  let emp1 = await prisma.empleados.findFirst({ where: { email: 'juan@demo.com' } });
  if (!emp1) emp1 = await prisma.empleados.create({
    data: { 
      nombrecompleto: 'Juan Pérez', 
      email: 'juan@demo.com', 
      departamentoid: dpto1.departamentoid, 
      puestoid: puesto1.puestoid, 
      activo: true 
    }
  });

  let emp2 = await prisma.empleados.findFirst({ where: { email: 'maria@demo.com' } });
  if (!emp2) emp2 = await prisma.empleados.create({
    data: { 
      nombrecompleto: 'María Gómez', 
      email: 'maria@demo.com', 
      departamentoid: dpto2.departamentoid, 
      puestoid: puesto2.puestoid, 
      activo: true 
    }
  });

  // 7. Registros de tiempo para tener datos en el Dashboard
  await prisma.registros_tiempo.create({
    data: {
      empleadoid: emp1.empleadoid,
      tareaid: tarea1.tareaid,
      fecha: new Date(),
      horas: 4,
      descripcion: 'Trabajo en React'
    }
  });

  await prisma.registros_tiempo.create({
    data: {
      empleadoid: emp1.empleadoid,
      tareaid: tarea3.tareaid,
      fecha: new Date(new Date().setDate(new Date().getDate() - 1)),
      horas: 6,
      descripcion: 'API Node.js'
    }
  });

  await prisma.registros_tiempo.create({
    data: {
      empleadoid: emp2.empleadoid,
      tareaid: tarea2.tareaid,
      fecha: new Date(),
      horas: 2,
      descripcion: 'Reunión con cliente'
    }
  });

  console.log('¡Base de datos poblada exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
