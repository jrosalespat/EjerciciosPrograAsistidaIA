const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// Mi endpoint de prueba
app.get('/api/saludo', (req,res)=>{
  res.json('hola mundo');
});

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secreto_super_seguro', (err, user) => {
    if (err) {
      return res.status(403).json({ mensaje: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// POST - Registrar usuario
app.post('/api/auth/registro', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const { data: usuarioExistente } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    // Hashear contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insertar usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .insert([
        { nombre, email, password: hashedPassword, rol: 'usuario' }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al insertar usuario:', error);
      return res.status(500).json({ mensaje: 'Error al registrar usuario' });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
});

// POST - Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    // Generar token
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'secreto_super_seguro',
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al hacer login:', error);
    res.status(500).json({ mensaje: 'Error al hacer login' });
  }
});



// GET - Obtener todos los eventos
app.get('/api/eventos', async (req, res) => {
  try {
    const { data: eventos, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error al obtener eventos:', error);
      return res.status(500).json({ mensaje: 'Error al obtener eventos' });
    }

    res.json(eventos || []);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ mensaje: 'Error al obtener eventos' });
  }
});

// GET - Obtener un evento por ID
app.get('/api/eventos/:id', async (req, res) => {
  try {
    const { data: evento, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !evento) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    res.json(evento);
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ mensaje: 'Error al obtener evento' });
  }
});

// POST - Crear nuevo evento
app.post('/api/eventos', async (req, res) => {
  try {
    const { titulo, fecha, descripcion } = req.body;
    
    if (!titulo || !fecha) {
      return res.status(400).json({ mensaje: 'Título y fecha son requeridos' });
    }
    
    const { data: evento, error } = await supabase
      .from('eventos')
      .insert([
        { titulo, fecha, descripcion: descripcion || '' }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al crear evento:', error);
      return res.status(500).json({ mensaje: 'Error al crear evento' });
    }
    
    res.status(201).json(evento);
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ mensaje: 'Error al crear evento' });
  }
});

// PUT - Actualizar evento
app.put('/api/eventos/:id', async (req, res) => {
  try {
    const { titulo, fecha, descripcion } = req.body;
    
    const { data: evento, error } = await supabase
      .from('eventos')
      .update({
        titulo: titulo || undefined,
        fecha: fecha || undefined,
        descripcion: descripcion !== undefined ? descripcion : undefined
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !evento) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }
    
    res.json(evento);
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ mensaje: 'Error al actualizar evento' });
  }
});

// DELETE - Eliminar evento
app.delete('/api/eventos/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', req.params.id);

    if (error) {
      console.error('Error al eliminar evento:', error);
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }
    
    res.json({ mensaje: 'Evento eliminado' });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ mensaje: 'Error al eliminar evento' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
