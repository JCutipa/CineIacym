const mongoose = require('mongoose');

const asientoSchema = new mongoose.Schema({
  fila: {
    type: String,
    required: true
  },
  numero: {
    type: Number,
    required: true
  },
  ocupado: {
    type: Boolean,
    default: false
  }
}, { _id: false });

// No necesitamos un modelo separado para Asiento ya que será un subdocumento
module.exports = asientoSchema;