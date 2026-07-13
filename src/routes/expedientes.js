const express = require('express');
const router = express.Router();
const {
  upload,
  uploadExpediente,
  getAllExpedientes,
  getExpedienteById,
  updateExpediente,
  deleteExpediente
} = require('../controllers/expedienteController');

// CREATE - Subir expediente
router.post('/upload', upload.single('archivo'), uploadExpediente);

// READ - Obtener todos los expedientes
router.get('/', getAllExpedientes);

// READ - Obtener expediente por ID
router.get('/:id', getExpedienteById);

// UPDATE - Actualizar expediente
router.put('/:id', updateExpediente);

// DELETE - Eliminar expediente
router.delete('/:id', deleteExpediente);

module.exports = router;
