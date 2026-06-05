const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Almacenamiento en memoria
let eventos = [];


// Mi endpoint de prueba
app.get('/api/saludo', (req,res)=>{
  res.json('hola mundo');
});



// GET - Obtener todos los eventos
app.get('/api/eventos', (req, res) => {
  res.json(eventos);
});

// GET - Obtener un evento por ID
app.get('/api/eventos/:id', (req, res) => {
  const evento = eventos.find(e => e.id === req.params.id);
  if (!evento) {
    return res.status(404).json({ mensaje: 'Evento no encontrado' });
  }
  res.json(evento);
});

// POST - Crear nuevo evento
app.post('/api/eventos', (req, res) => {
  const { titulo, fecha, descripcion } = req.body;
  
  if (!titulo || !fecha) {
    return res.status(400).json({ mensaje: 'Título y fecha son requeridos' });
  }
  
  const nuevoEvento = {
    id: Date.now().toString(),
    titulo,
    fecha,
    descripcion: descripcion || ''
  };
  
  eventos.push(nuevoEvento);
  res.status(201).json(nuevoEvento);
});

// PUT - Actualizar evento
app.put('/api/eventos/:id', (req, res) => {
  const index = eventos.findIndex(e => e.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ mensaje: 'Evento no encontrado' });
  }
  
  const { titulo, fecha, descripcion } = req.body;
  
  eventos[index] = {
    ...eventos[index],
    titulo: titulo || eventos[index].titulo,
    fecha: fecha || eventos[index].fecha,
    descripcion: descripcion !== undefined ? descripcion : eventos[index].descripcion
  };
  
  res.json(eventos[index]);
});

// DELETE - Eliminar evento
app.delete('/api/eventos/:id', (req, res) => {
  const index = eventos.findIndex(e => e.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ mensaje: 'Evento no encontrado' });
  }
  
  eventos.splice(index, 1);
  res.json({ mensaje: 'Evento eliminado' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
