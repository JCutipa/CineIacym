require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000; // ¡Faltaba esta línea!

// En tu conexión a MongoDB (app.js), usa:
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,  // 5 segundos de timeout
  maxPoolSize: 100                 // Conexiones concurrentes
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Configuración de vistas
app.set('views', path.join(__dirname, '../frontend/views'));
app.set('view engine', 'ejs');

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión a MongoDB:', err));

// Rutas
const peliculasRouter = require('./routes/peliculas');
const reservasRouter = require('./routes/reservas');
const asientosRouter = require('./routes/asientos');

app.use('/api/peliculas', peliculasRouter);
app.use('/api/reservas', reservasRouter);
app.use('/api/asientos', asientosRouter);

// Rutas frontend
app.get('/', (req, res) => res.render('index'));
app.get('/sala/:peliculaId', (req, res) => res.render('sala', { peliculaId: req.params.peliculaId }));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
