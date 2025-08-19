// Modifica tu código para debuggear:
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log("Iniciando carga de películas..."); // [1]
    const response = await fetch('/api/peliculas');
    console.log("Respuesta recibida:", response); // [2]
    
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const peliculas = await response.json();
    console.log("Películas recibidas:", peliculas); // [3]
    
    const container = document.getElementById('peliculas-container');
    if (!container) throw new Error('Contenedor no encontrado');
    
    if (peliculas.length === 0) {
      container.innerHTML = '<p class="text-center">No hay películas disponibles</p>';
      return;
    }
    
    peliculas.forEach(pelicula => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';
      card.innerHTML = `
        <div class="card pelicula-card h-100">
          <img src="${pelicula.imagen}" class="card-img-top" 
               alt="${pelicula.titulo}" 
               style="height: 300px; object-fit: cover;">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${pelicula.titulo}</h5>
            <a href="/sala/${pelicula._id}" class="btn btn-primary mt-auto">Reservar</a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error:', error);
    const container = document.getElementById('peliculas-container') || document.body;
    container.innerHTML = `
      <div class="alert alert-danger">
        Error al cargar películas: ${error.message}
      </div>
    `;
  }
});
