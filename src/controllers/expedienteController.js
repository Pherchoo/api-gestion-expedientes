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

// CREATE - Subir expediente
const uploadExpediente = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subio ningun archivo' });
    }

    const file = req.file;

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
      tamanio: file.size,
      ruta: uploadPath
    });

    res.status(201).json({
      message: 'Archivo subido correctamente',
      expediente: {
        id: expediente._id,
        nombreOriginal: expediente.nombreOriginal,
        nombreGuardado: expediente.nombreGuardado,
        tipo: expediente.tipoMime,
        tamanio: expediente.tamanio,
        fechaCreacion: expediente.createdAt
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar el archivo', error: error.message });
  }
};

// READ - Obtener todos los expedientes
const getAllExpedientes = async (req, res) => {
  try {
    const expedientes = await Expediente.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: 'Expedientes obtenidos correctamente',
      total: expedientes.length,
      expedientes: expedientes.map(exp => ({
        id: exp._id,
        nombreOriginal: exp.nombreOriginal,
        nombreGuardado: exp.nombreGuardado,
        tipo: exp.tipoMime,
        tamanio: exp.tamanio,
        fechaCreacion: exp.createdAt,
        fechaActualizacion: exp.updatedAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener expedientes', error: error.message });
  }
};

// READ - Obtener un expediente por ID
const getExpedienteById = async (req, res) => {
  try {
    const expediente = await Expediente.findById(req.params.id);

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    res.status(200).json({
      message: 'Expediente obtenido correctamente',
      expediente: {
        id: expediente._id,
        nombreOriginal: expediente.nombreOriginal,
        nombreGuardado: expediente.nombreGuardado,
        tipo: expediente.tipoMime,
        tamanio: expediente.tamanio,
        ruta: expediente.ruta,
        fechaCreacion: expediente.createdAt,
        fechaActualizacion: expediente.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener expediente', error: error.message });
  }
};

// UPDATE - Actualizar metadata de expediente
const updateExpediente = async (req, res) => {
  try {
    const expediente = await Expediente.findById(req.params.id);

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    const { nombreOriginal } = req.body;

    if (nombreOriginal) {
      expediente.nombreOriginal = nombreOriginal;
    }

    await expediente.save();

    res.status(200).json({
      message: 'Expediente actualizado correctamente',
      expediente: {
        id: expediente._id,
        nombreOriginal: expediente.nombreOriginal,
        nombreGuardado: expediente.nombreGuardado,
        tipo: expediente.tipoMime,
        tamanio: expediente.tamanio,
        fechaCreacion: expediente.createdAt,
        fechaActualizacion: expediente.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar expediente', error: error.message });
  }
};

// DELETE - Eliminar expediente
const deleteExpediente = async (req, res) => {
  try {
    const expediente = await Expediente.findById(req.params.id);

    if (!expediente) {
      return res.status(404).json({ message: 'Expediente no encontrado' });
    }

    // Eliminar archivo fisico si existe
    if (fs.existsSync(expediente.ruta)) {
      fs.unlinkSync(expediente.ruta);
    }

    await Expediente.findByIdAndDelete(req.params.id);

    res.status(200).json({
      message: 'Expediente eliminado correctamente',
      expediente: {
        id: expediente._id,
        nombreOriginal: expediente.nombreOriginal
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar expediente', error: error.message });
  }
};

module.exports = {
  upload,
  uploadExpediente,
  getAllExpedientes,
  getExpedienteById,
  updateExpediente,
  deleteExpediente
};
