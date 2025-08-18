const express = require('express');
const router = express.Router();
const Pelicula = require('../models/Pelicula');

// Obtener todas las películas (para el frontend)
router.get('/', async (req, res) => {
  try {
    const peliculas = await Pelicula.find().limit(3);
    res.json(peliculas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Estadísticas para el admin (qué película va ganando)
router.get('/estadisticas', async (req, res) => {
  try {
    const peliculas = await Pelicula.find().sort({ votos: -1 });
    res.json(peliculas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear película (para inicializar datos)
router.post('/', async (req, res) => {
  const pelicula = new Pelicula({
    titulo: req.body.titulo,
    imagen: req.body.imagen
  });

  try {
    const nuevaPelicula = await pelicula.save();
    res.status(201).json(nuevaPelicula);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;