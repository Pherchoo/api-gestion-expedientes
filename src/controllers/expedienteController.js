const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const fileType = require('file-type');
const Expediente = require('../models/Expediente');

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

const uploadExpediente = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const file = req.file;

    // Nueva forma de file-type (v16+)
    const fileTypeResult = await fileType.fromBuffer(file.buffer);
    
    if (!fileTypeResult || !['image/jpeg', 'image/png', 'application/pdf'].includes(fileTypeResult.mime)) {
      return res.status(400).json({ message: 'Solo se permiten archivos JPG, PNG o PDF' });
    }

    const nombreGuardado = `${uuidv4()}.${fileTypeResult.ext}`;
    const uploadsDir = path.join(__dirname, '../../uploads');
    const uploadPath = path.join(uploadsDir, nombreGuardado);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    fs.writeFileSync(uploadPath, file.buffer);

    const expediente = await Expediente.create({
      nombreOriginal: file.originalname,
      nombreGuardado,
      tipoMime: fileTypeResult.mime,
      tamaño: file.size,
      ruta: uploadPath
    });

    res.status(201).json({
      message: 'Archivo subido correctamente y de forma segura',
      expediente: {
        id: expediente._id,
        nombreOriginal: expediente.nombreOriginal,
        nombreGuardado: expediente.nombreGuardado,
        tipo: expediente.tipoMime
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar el archivo', error: error.message });
  }
};

module.exports = { upload, uploadExpediente };