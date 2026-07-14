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
    const clientes = await prisma.clientes.findMany({ where: { activo: true } });
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

app.get('/api/proyectos', authMiddleware, async (req, res) => {
  try {
    const proyectos = await prisma.proyectos.findMany({ where: { activo: true } });
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

app.get('/api/tareas', authMiddleware, async (req, res) => {
  try {
    const tareas = await prisma.tareas.findMany();
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
      }
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
      const data = req.body.map(r => ({
        ...r,
        fecha: new Date(r.fecha),
        horas: Number(r.horas)
      }));
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
// Arranque del Servidor
// ==========================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
