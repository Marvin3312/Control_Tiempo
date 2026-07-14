const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

app.use(cors());
app.use(express.json());

// ==========================================
// Middleware de Autenticación
// ==========================================
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Función helper para registrar en auditoría
async function registrarAuditoria(req, accion, tabla, registroId, detalles = {}) {
  try {
    const usuarioid = req.user?.id || null;
    await prisma.auditoria.create({
      data: {
        usuarioid: usuarioid ? Number(usuarioid) : null,
        accion,
        tabla_afectada: tabla,
        registro_id: registroId ? Number(registroId) : null,
        detalles
      }
    });
  } catch (error) {
    console.error('Error guardando en auditoría:', error);
  }
}

// ==========================================
// Rutas de Autenticación
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    // Buscar empleado por el nuevo campo email
    const empleado = await prisma.empleados.findFirst({
      where: { email: email }
    });

    if (!empleado) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Por ahora, como acabamos de quitar Supabase, si la tabla no tiene contraseña,
    // puedes usar una contraseña por defecto o crear un endpoint de registro.
    // Esto es un placeholder hasta revisar la tabla.
    let isValid = false;
    if (empleado.password_hash) {
      isValid = await bcrypt.compare(password, empleado.password_hash);
    } else {
      // Fallback temporal si aún no hay contraseñas encriptadas
      isValid = password === '123456'; 
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: empleado.empleadoid, email: empleado.email, role: empleado.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: empleado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const empleado = await prisma.empleados.findUnique({
      where: { empleadoid: req.user.id }
    });
    
    if (empleado) {
      empleado.puestos = await prisma.puestos.findUnique({ where: { puestoid: empleado.puestoid } });
      empleado.departamentos = await prisma.departamentos.findUnique({ where: { departamentoid: empleado.departamentoid } });
    }
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

// ==========================================
// Rutas de Catálogos (Protegidas)
// ==========================================
app.get('/api/clientes', authMiddleware, async (req, res) => {
  try {
    const clientes = await prisma.clientes.findMany({ where: { activo: true }, orderBy: { clienteid: 'asc' } });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Clientes → Proyectos → Tareas (3 niveles, todo en un solo request)
app.get('/api/clientes-con-proyectos', authMiddleware, async (req, res) => {
  try {
    const clientes = await prisma.clientes.findMany({
      orderBy: { nombrecliente: 'asc' },
      include: {
        proyectos: {
          orderBy: { nombreproyecto: 'asc' },
          include: {
            tareas: {
              orderBy: { descripciontarea: 'asc' }
            }
          }
        }
      }
    });
    res.json(clientes);
  } catch (error) {
    console.error('Error GET /api/clientes-con-proyectos:', error);
    res.status(500).json({ error: 'Error al obtener clientes con proyectos' });
  }
});

app.post('/api/clientes', authMiddleware, async (req, res) => {
  try {
    const { nombrecliente, parentclienteid, activo } = req.body;
    if (!nombrecliente || !nombrecliente.trim()) {
      return res.status(400).json({ error: 'El nombre del cliente es requerido.' });
    }
    const data = {
      nombrecliente: nombrecliente.trim(),
      activo: activo !== undefined ? activo : true,
      parentclienteid: parentclienteid ? Number(parentclienteid) : null,
    };
    const cliente = await prisma.clientes.create({ data });
    await registrarAuditoria(req, 'CREATE', 'clientes', cliente.clienteid, data);
    res.json(cliente);
  } catch (error) {
    console.error('Error POST /api/clientes:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: `Ya existe un cliente con el nombre "${req.body.nombrecliente}". Por favor usa un nombre diferente.` });
    }
    res.status(500).json({ error: 'Error al crear cliente', detail: error.message });
  }
});

app.put('/api/clientes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await prisma.clientes.update({
      where: { clienteid: Number(id) },
      data: req.body
    });
    await registrarAuditoria(req, 'UPDATE', 'clientes', id, req.body);
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

app.delete('/api/clientes/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.clientes.update({
      where: { clienteid: Number(id) },
      data: { activo: false }
    });
    await registrarAuditoria(req, 'DELETE', 'clientes', id, { accion: 'borrado logico' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

app.get('/api/proyectos', authMiddleware, async (req, res) => {
  try {
    const proyectos = await prisma.proyectos.findMany({ where: { activo: true }, orderBy: { proyectoid: 'asc' } });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

app.post('/api/proyectos', authMiddleware, async (req, res) => {
  try {
    const { nombreproyecto, clienteid, referenciacaseware, activo } = req.body;
    const data = {
      nombreproyecto,
      clienteid: Number(clienteid),
      activo: activo !== undefined ? activo : true,
      referenciacaseware: referenciacaseware && referenciacaseware.trim() !== '' ? referenciacaseware.trim() : null,
    };
    const proyecto = await prisma.proyectos.create({ data });
    await registrarAuditoria(req, 'CREATE', 'proyectos', proyecto.proyectoid, data);
    res.json(proyecto);
  } catch (error) {
    console.error('Error POST /api/proyectos:', error);
    res.status(500).json({ error: 'Error al crear proyecto', detail: error.message });
  }
});

app.put('/api/proyectos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const proyecto = await prisma.proyectos.update({
      where: { proyectoid: Number(id) },
      data: req.body
    });
    await registrarAuditoria(req, 'UPDATE', 'proyectos', id, req.body);
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
});

app.delete('/api/proyectos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.proyectos.update({
      where: { proyectoid: Number(id) },
      data: { activo: false }
    });
    await registrarAuditoria(req, 'DELETE', 'proyectos', id, { accion: 'borrado logico' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
});

app.get('/api/tareas', authMiddleware, async (req, res) => {
  try {
    const tareas = await prisma.tareas.findMany({ orderBy: { tareaid: 'asc' } });
    const proyectos = await prisma.proyectos.findMany();
    
    const tareasConProyectos = tareas.map(t => ({
      ...t,
      proyectos: proyectos.find(p => p.proyectoid === t.proyectoid) || null
    }));
    
    res.json(tareasConProyectos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

app.post('/api/tareas', authMiddleware, async (req, res) => {
  try {
    const { proyectoid, ...rest } = req.body;
    const data = { ...rest, proyectoid: Number(proyectoid) };
    const tarea = await prisma.tareas.create({ data });
    await registrarAuditoria(req, 'CREATE', 'tareas', tarea.tareaid, data);
    res.json(tarea);
  } catch (error) {
    console.error('Error POST /api/tareas:', error);
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

app.put('/api/tareas/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const tarea = await prisma.tareas.update({
      where: { tareaid: Number(id) },
      data: req.body
    });
    await registrarAuditoria(req, 'UPDATE', 'tareas', id, req.body);
    res.json(tarea);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

app.delete('/api/tareas/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tareas.delete({ where: { tareaid: Number(id) } });
    await registrarAuditoria(req, 'DELETE', 'tareas', id, { accion: 'borrado fisico' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

app.get('/api/empleados', authMiddleware, async (req, res) => {
  try {
    const empleados = await prisma.empleados.findMany({ where: { activo: true }, orderBy: { empleadoid: 'asc' } });
    // Join manual para emular includes
    const puestos = await prisma.puestos.findMany();
    const departamentos = await prisma.departamentos.findMany();
    
    const empData = empleados.map(emp => ({
      ...emp,
      puestos: puestos.find(p => p.puestoid === emp.puestoid) || null,
      departamentos: departamentos.find(d => d.departamentoid === emp.departamentoid) || null
    }));
    res.json(empData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener empleados' });
  }
});

app.post('/api/empleados', authMiddleware, async (req, res) => {
  try {
    const { nombrecompleto, puestoid, departamentoid, activo, email, password_hash, role } = req.body;
    const data = {
      nombrecompleto,
      puestoid:       Number(puestoid),
      departamentoid: Number(departamentoid),
      activo:         activo !== undefined ? activo : true,
      ...(email        ? { email }        : {}),
      ...(password_hash? { password_hash }: {}),
      ...(role         ? { role }         : {}),
    };
    const emp = await prisma.empleados.create({ data });
    await registrarAuditoria(req, 'CREATE', 'empleados', emp.empleadoid, data);
    res.json(emp);
  } catch (error) {
    console.error('Error POST /api/empleados:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe un empleado con ese correo electrónico.' });
    }
    res.status(500).json({ error: 'Error al crear empleado', detail: error.message });
  }
});

app.put('/api/empleados/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const emp = await prisma.empleados.update({
      where: { empleadoid: Number(id) },
      data: req.body
    });
    await registrarAuditoria(req, 'UPDATE', 'empleados', id, req.body);
    res.json(emp);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
});

app.delete('/api/empleados/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.empleados.update({
      where: { empleadoid: Number(id) },
      data: { activo: false }
    });
    await registrarAuditoria(req, 'DELETE', 'empleados', id, { accion: 'borrado logico' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
});

app.get('/api/departamentos', authMiddleware, async (req, res) => {
  try {
    const dptos = await prisma.departamentos.findMany();
    res.json(dptos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener departamentos' });
  }
});

app.post('/api/reporte-filtrado', authMiddleware, async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin, empleado_id_filtro, cliente_id_filtro, proyecto_id_filtro } = req.body;
    
    // Construir where clause
    const where = {};
    if (fecha_inicio && fecha_fin) {
      where.fecha = { gte: new Date(fecha_inicio), lte: new Date(fecha_fin) };
    }
    if (empleado_id_filtro) where.empleadoid = empleado_id_filtro;
    
    // Para filtrar por cliente y proyecto, necesitamos relaciones. Prisma permite filtrar por relaciones.
    if (proyecto_id_filtro) {
      where.tareas = { proyectoid: proyecto_id_filtro };
    } else if (cliente_id_filtro) {
      where.tareas = { proyectos: { clienteid: cliente_id_filtro } };
    }

    const registros = await prisma.registrosdetiempo.findMany({
      where,
      include: {
        empleados: true,
        tareas: {
          include: {
            proyectos: {
              include: {
                clientes: true
              }
            }
          }
        }
      }
    });

    const reporteData = registros.map(r => ({
      fecha: r.fecha.toISOString(),
      horas: Number(r.horas),
      empleadoid: r.empleadoid,
      empleado: r.empleados?.nombrecompleto,
      tareaid: r.tareaid,
      tarea: r.tareas?.descripciontarea,
      escargable: r.tareas?.escargable,
      proyectoid: r.tareas?.proyectos?.proyectoid,
      proyecto: r.tareas?.proyectos?.nombreproyecto,
      clienteid: r.tareas?.proyectos?.clientes?.clienteid,
      cliente: r.tareas?.proyectos?.clientes?.nombrecliente
    }));

    res.json(reporteData);
  } catch (error) {
    console.error('Error reporte:', error);
    res.status(500).json({ error: 'Error al obtener reporte' });
  }
});

app.get('/api/departamentos', authMiddleware, async (req, res) => {
  try {
    const dptos = await prisma.departamentos.findMany();
    res.json(dptos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener departamentos' });
  }
});

app.get('/api/puestos', authMiddleware, async (req, res) => {
  try {
    const puestos = await prisma.puestos.findMany();
    res.json(puestos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener puestos' });
  }
});

// ==========================================
// Rutas de Registros de Tiempo
// ==========================================
app.get('/api/registros', authMiddleware, async (req, res) => {
  const { empleadoid, fecha } = req.query;
  try {
    const registros = await prisma.registrosdetiempo.findMany({
      where: {
        empleadoid: Number(empleadoid),
        // Convirtiendo la fecha a ISO si es necesario, asumiendo formato YYYY-MM-DD
        fecha: fecha ? new Date(fecha) : undefined
      },
      include: {
        tareas: {
          include: {
            proyectos: {
              include: {
                clientes: true
              }
            }
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
    // Convertir BigInt a string para poder enviarlo como JSON
    const parsed = registros.map(r => ({
      ...r,
      registroid: r.registroid.toString(),
      horas: r.horas.toString()
    }));
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});

app.post('/api/registros', authMiddleware, async (req, res) => {
  try {
    // Si viene un array, es inserción múltiple
    if (Array.isArray(req.body)) {
      const data = req.body.map(r => {
        const h = Number(r.horas);
        if (h > 24) throw new Error(`El número de horas (${h}) excede el máximo permitido (24)`);
        if (h <= 0) throw new Error("Las horas deben ser mayores a 0");
        return {
          ...r,
          fecha: new Date(r.fecha),
          horas: h
        };
      });
      const created = await prisma.registrosdetiempo.createMany({ data });
      return res.json({ count: created.count });
    }

    const { fecha, horas, ...rest } = req.body;
    const registro = await prisma.registrosdetiempo.create({
      data: {
        ...rest,
        fecha: new Date(fecha),
        horas: Number(horas)
      }
    });
    res.json({ ...registro, registroid: registro.registroid.toString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear registro(s)' });
  }
});

app.put('/api/registros/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, horas, registroid, ...rest } = req.body;
    const registro = await prisma.registrosdetiempo.update({
      where: { registroid: BigInt(id) },
      data: {
        ...rest,
        fecha: fecha ? new Date(fecha) : undefined,
        horas: horas ? Number(horas) : undefined
      }
    });
    res.json({ ...registro, registroid: registro.registroid.toString() });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar registro' });
  }
});

// ==========================================
// Auditoría — Log de cambios del sistema
// ==========================================
app.get('/api/auditoria', authMiddleware, async (req, res) => {
  try {
    const { limit = 100, tabla } = req.query;
    const where = tabla ? { tabla_afectada: tabla } : {};
    const registros = await prisma.auditoria.findMany({
      where,
      orderBy: { fecha: 'desc' },
      take: Number(limit),
      include: { empleados: { select: { nombrecompleto: true } } }
    });
    res.json(registros.map(r => ({
      ...r,
      usuario: r.empleados?.nombrecompleto || 'Sistema',
    })));
  } catch (error) {
    console.error('Error GET /api/auditoria:', error);
    res.status(500).json({ error: 'Error al obtener auditoría' });
  }
});

// ==========================================
// Arranque del Servidor
// ==========================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
