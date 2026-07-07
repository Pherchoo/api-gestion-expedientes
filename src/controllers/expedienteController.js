const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const fileType = require('file-type');
const Expediente = require('../models/Expediente');

// Configuración de Multer
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB máximo
});

// Controlador para subir expediente
const uploadExpediente = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const file = req.file;

    // Verificar tipo real del archivo
    const detectedType = await fileType.fromBuffer(file.buffer);
    if (!detectedType || !['image/jpeg', 'image/png', 'application/pdf'].includes(detectedType.mime)) {
      return res.status(400).json({ message: 'Solo se permiten archivos JPG, PNG o PDF' });
    }

    // Nombre seguro
    const nombreGuardado = `${uuidv4()}.${detectedType.ext}`;
    const uploadsDir = path.join(__dirname, '../../uploads');
    const uploadPath = path.join(uploadsDir, nombreGuardado);

    // Crear carpeta si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Guardar archivo
    fs.writeFileSync(uploadPath, file.buffer);

    // Guardar en base de datos
    const expediente = await Expediente.create({
      nombreOriginal: file.originalname,
      nombreGuardado,
      tipoMime: detectedType.mime,
      tamaño: file.size,
      ruta: uploadPath
    });

    res.status(201).json({
      message: 'Archivo subido de forma segura',
      expediente: {
        id: expediente._id,
        nombreOriginal: expediente.nombreOriginal,
        nombreGuardado: expediente.nombreGuardado
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar el archivo', error: error.message });
  }
};

module.exports = { upload, uploadExpediente };