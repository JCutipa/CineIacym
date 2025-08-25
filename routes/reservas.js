const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');
const Pelicula = require('../models/Pelicula');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

// Helper functions
const generateQR = async (data) => {
  try {
    return await QRCode.toDataURL(JSON.stringify(data));
  } catch (error) {
    console.error('Error generating QR:', error);
    return null;
  }
};

const buildReservationData = (pelicula, asientos, reserva) => ({
  pelicula: pelicula.titulo,
  asientos: asientos.map(a => `${a.fila}${a.numero}`),
  fecha: reserva.fecha.toLocaleString(),
  reservaId: reserva._id
});

// Vista previa de la reserva
router.post('/preview', async (req, res) => {
  try {
    const { peliculaId, asientos } = req.body;

    // Validación básica
    if (!peliculaId || !asientos || !Array.isArray(asientos)) {
      return res.status(400).json({ error: 'Datos de reserva inválidos' });
    }

    const pelicula = await Pelicula.findById(peliculaId);
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

    const qrData = {
      pelicula: pelicula.titulo,
      asientos,
      fecha: new Date().toISOString()
    };

    const qrCode = await generateQR(qrData);

    res.json({
      pelicula: pelicula.titulo,
      asientos,
      qrCode,
      fecha: new Date().toLocaleString()
    });

  } catch (error) {
    console.error('Error en vista previa:', error);
    res.status(500).json({
      error: 'Error al generar vista previa',
      details: error.message
    });
  }
});

// Confirmación de reserva y generación de PDF
router.post('/', async (req, res) => {  // Cambiado a '/' para coincidir con la ruta base
  try {
    const { peliculaId, asientos } = req.body;

    // Validación de entrada
    if (!peliculaId || !asientos || !Array.isArray(asientos)) {
      return res.status(400).json({ error: 'Datos de reserva inválidos' });
    }

    const pelicula = await Pelicula.findById(peliculaId);
    if (!pelicula) {
      return res.status(404).json({ error: 'Película no encontrada' });
    }

const asientosOcupados = await Reserva.aggregate([
    { $unwind: "$asientos" },
    { $match: {
        $or: asientos.map(a => ({
            "asientos.fila": a.fila,
            "asientos.numero": a.numero,
            "asientos.ocupado": true
        }))
    }}
]);

    if (asientosOcupados.length > 0) {
      return res.status(400).json({ error: 'Algunos asientos ya están ocupados' });
    }

    // Crear reserva
    const reserva = new Reserva({
      pelicula: peliculaId,
      asientos: asientos.map(a => ({
        fila: a.fila,
        numero: a.numero,
        ocupado: true
      })),
      fecha: new Date()
    });

    await reserva.save();

    // Actualizar votos
    await Pelicula.findByIdAndUpdate(peliculaId, { $inc: { votos: 1 } });

    // Generar PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurar headers ANTES de empezar a escribir
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${reserva._id}.pdf`);

    doc.pipe(res);

    // Manejar errores de PDF
    doc.on('error', (err) => {
      console.error('Error al generar PDF:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al generar PDF' });
      }
    });

    // Contenido del PDF
    // Encabezado
    doc.fillColor('#333333')
      .fontSize(20)
      .text('CINE JTC EXTTREME', 50, 50)
      .fontSize(10)
      .text('Gracias por su reserva', 50, 80)
      .moveDown();

    // Línea divisoria
    doc.strokeColor('#aaaaaa')
      .lineWidth(1)
      .moveTo(50, 100)
      .lineTo(550, 100)
      .stroke();

    // Contenido principal
    const reservaData = buildReservationData(pelicula, asientos, reserva);

    doc.fontSize(16)
      .fillColor('#0066cc')
      .text('Ticket de Reserva', { align: 'center' })
      .moveDown();

    doc.fontSize(14)
      .fillColor('#000000')
      .text(`Película: ${reservaData.pelicula}`, { underline: true })
      .moveDown();

    doc.text('Asientos reservados:');
    reservaData.asientos.forEach(asiento => {
      doc.text(`- ${asiento}`);
    });
    doc.moveDown();

    // Código QR
    const qrCode = await generateQR(reservaData);
    if (qrCode) {
      doc.image(qrCode, 400, 150, { width: 100 })
        .fontSize(8)
        .text('Presente este código QR', 400, 260, { width: 100, align: 'center' });
    }

    // Pie de página
    doc.fontSize(10)
      .text(`N° Reserva: ${reservaData.reservaId}`, 50, 700)
      .text(`Fecha: ${reservaData.fecha}`, { align: 'right' })
      .text('Gracias por elegirnos!', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Error al procesar la reserva',
        details: error.message
      });
    }
  }
});

module.exports = router;
