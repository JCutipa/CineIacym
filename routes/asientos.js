const express = require('express');
const router = express.Router();
const Reserva = require('../models/Reserva');

router.get('/', async (req, res) => {
  try {
    const asientosOcupados = await Reserva.aggregate([
      { $unwind: "$asientos" },
      { $match: { "asientos.ocupado": true } },
      { $project: { 
          _id: 0,
          fila: "$asientos.fila",
          numero: "$asientos.numero"
      }}
    ]);
    
    res.json(asientosOcupados);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;