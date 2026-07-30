const express = require('express');
const multer = require('multer');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  upload,
  uploadExpediente,
  getAllExpedientes,
  getExpedienteById,
  updateExpediente,
  deleteExpediente
} = require('../controllers/expedienteController');

// Todas las rutas requieren token
router.use(verifyToken);

// CREATE - Subir expediente (con manejo de error de tamano)
router.post('/upload', (req, res, next) => {
  upload.single('archivo')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'El archivo excede el tamano maximo de 2MB' });
      }
      return res.status(400).json({ message: 'Error al subir el archivo' });
    } else if (err) {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
    next();
  });
}, uploadExpediente);

// READ - Obtener todos los expedientes
router.get('/', getAllExpedientes);

// READ - Obtener expediente por ID
router.get('/:id', getExpedienteById);

// UPDATE - Actualizar expediente
router.put('/:id', updateExpediente);

// DELETE - Eliminar expediente
router.delete('/:id', deleteExpediente);

module.exports = router;
