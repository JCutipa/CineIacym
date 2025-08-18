const mongoose = require('mongoose');

const peliculaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    unique: true
  },
  imagen: {
    type: String,
    required: true
  },
  votos: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Pelicula', peliculaSchema);