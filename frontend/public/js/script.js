document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/peliculas');
    const peliculas = await response.json();
    
    const container = document.getElementById('peliculas-container');
    
    peliculas.forEach(pelicula => {
      const card = document.createElement('div');
      card.className = 'col-md-4 mb-4';
      card.innerHTML = `
        <div class="card pelicula-card">
          <img src="${pelicula.imagen}" class="card-img-top" alt="${pelicula.titulo}">
          <div class="card-body">
            <h5 class="card-title">${pelicula.titulo}</h5>
            <a href="/sala/${pelicula._id}" class="btn btn-primary">Reservar</a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error al cargar películas:', error);
  }
});