require('dotenv').config();
const mongoose = require('mongoose');
const Pelicula = require('./models/Pelicula');
const Reserva = require('./models/Reserva'); // Asegúrate de tener este modelo

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cine';

async function initDB() {
  try {
    console.log("🔄 Conectando a MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado a:", mongoose.connection.name);

    // Limpieza de datos
    console.log("🧹 Limpiando datos existentes...");
    const [peliculasDeleted, reservasDeleted] = await Promise.all([
      Pelicula.deleteMany({}),
      Reserva.deleteMany({})
    ]);
    
    console.log(`🗑️ ${peliculasDeleted.deletedCount} películas eliminadas`);
    console.log(`🗑️ ${reservasDeleted.deletedCount} reservas eliminadas`);

    // Insertar nuevos datos
    console.log("📥 Insertando películas de ejemplo...");
    const peliculas = [
      {
        titulo: "Narnia",
        imagen: "https://via.placeholder.com/300x450?text=Narnia",
        horarios: ["18:00", "21:00"],
        duracion: "120 min",
        genero: "Aventura"
      },
       {
        titulo: "Narni3",
        imagen: "https://via.placeholder.com/300x450?text=Narnia",
        horarios: ["18:00", "21:00"],
        duracion: "120 min",
        genero: "Aventura"
      },

       {
        titulo: "Narni2",
        imagen: "https://via.placeholder.com/300x450?text=Narnia",
        horarios: ["18:00", "21:00"],
        duracion: "120 min",
        genero: "Aventura"
      },
      // ... otras películas
    ];
    
    const result = await Pelicula.insertMany(peliculas);
    console.log(`🎬 ${result.length} películas insertadas`);

    console.log('✨ Base de datos reinicializada completamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

initDB();