const mongoose = require('mongoose');

const expedienteSchema = new mongoose.Schema({
  nombreOriginal: {
    type: String,
    required: true
  },
  nombreGuardado: {
    type: String,
    required: true,
    unique: true
  },
  tipoMime: {
    type: String,
    required: true
  },
  tamaño: {
    type: Number,
    required: true
  },
  ruta: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Expediente', expedienteSchema);
