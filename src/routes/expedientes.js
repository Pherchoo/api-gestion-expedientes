const express = require('express');
const router = express.Router();
const { upload, uploadExpediente } = require('../controllers/expedienteController');

// Ruta de subida de archivo (un solo archivo)
router.post('/upload', upload.single('archivo'), uploadExpediente);

module.exports = router;