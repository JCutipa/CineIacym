const mongoose = require('mongoose');
const asientoSchema = require('./Asiento');

const reservaSchema = new mongoose.Schema({
  pelicula: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pelicula',
    required: true
  },
  asientos: [asientoSchema],
  fecha: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reserva', reservaSchema);