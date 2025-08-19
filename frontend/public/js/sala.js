document.addEventListener('DOMContentLoaded', async () => {
  const peliculaId = document.getElementById('pelicula-id').value;
  const asientosContainer = document.getElementById('asientos-container');
  const confirmarBtn = document.getElementById('confirmar-reserva');
  
  let asientosSeleccionados = [];
  
  try {
    // 1. Obtener asientos ocupados del servidor
    const response = await fetch('/api/asientos');
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    const asientosOcupados = await response.json();
    console.log('Asientos ocupados recibidos:', asientosOcupados);

    // 2. Crear cuadrícula de asientos (6 filas x 8 columnas)
    const filas = ['A', 'B', 'C', 'D', 'E', 'F'];
    const columnas = 8;
    
    filas.forEach(fila => {
      const filaDiv = document.createElement('div');
      filaDiv.className = 'row justify-content-center mb-2';
      
      for (let i = 1; i <= columnas; i++) {
        const asientoDiv = document.createElement('div');
        asientoDiv.className = 'col-auto';
        
        const asientoBtn = document.createElement('button');
        asientoBtn.className = 'btn asiento';
        asientoBtn.textContent = `${fila}${i}`;
        
        // Verificar si el asiento está ocupado
        const estaOcupado = asientosOcupados.some(a => 
          a.fila === fila && a.numero === i
        );
        
        if (estaOcupado) {
          asientoBtn.classList.add('btn-danger');
          asientoBtn.disabled = true;
        } else {
          asientoBtn.classList.add('btn-success');
          
          // Evento para seleccionar/deseleccionar asientos
          asientoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            asientoBtn.classList.toggle('btn-warning');
            
            const index = asientosSeleccionados.findIndex(a => 
              a.fila === fila && a.numero === i
            );
            
            if (index === -1) {
              asientosSeleccionados.push({ fila, numero: i });
            } else {
              asientosSeleccionados.splice(index, 1);
            }
            
            confirmarBtn.disabled = asientosSeleccionados.length === 0;
            console.log('Asientos seleccionados:', asientosSeleccionados);
          });
        }
        
        asientoDiv.appendChild(asientoBtn);
        filaDiv.appendChild(asientoDiv);
      }
      
      asientosContainer.appendChild(filaDiv);
    });

    // 3. Configurar botón de confirmación
    confirmarBtn.addEventListener('click', async () => {
      if (asientosSeleccionados.length === 0) {
        alert('Por favor selecciona al menos un asiento');
        return;
      }
      
      try {
        console.log('Iniciando proceso de reserva...');
        
        // Primero: Mostrar vista previa
        const previewResponse = await fetch('/api/reservas/preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            peliculaId,
            asientos: asientosSeleccionados
          })
        });

        // Verificar si la respuesta es JSON
        const contentType = previewResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const errorText = await previewResponse.text();
          throw new Error(`El servidor respondió con: ${errorText.substring(0, 100)}...`);
        }

        if (!previewResponse.ok) {
          const errorData = await previewResponse.json();
          throw new Error(errorData.message || 'Error en la vista previa');
        }

        const previewData = await previewResponse.json();
        console.log('Datos de vista previa:', previewData);

        // Crear y mostrar modal de vista previa
        const modalHTML = `
          <div class="modal fade" id="previewModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Resumen de tu reserva</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                  <h4>${previewData.pelicula}</h4>
                  <p><strong>Asientos:</strong> ${previewData.asientos.map(a => `${a.fila}${a.numero}`).join(', ')}</p>
                  <img src="${previewData.qrCode}" alt="Código QR" class="img-fluid mb-3" style="max-width: 200px;">
                  <p><strong>Fecha:</strong> ${previewData.fecha}</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Modificar</button>
                  <button id="confirmar-final" type="button" class="btn btn-primary">Confirmar Reserva</button>
                </div>
              </div>
            </div>
          </div>
        `;

        // Insertar modal en el DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('previewModal'));
        modal.show();

        // Configurar evento para confirmación final
        document.getElementById('confirmar-final').addEventListener('click', async () => {
  modal.hide();
  
  try {
    const response = await fetch('/api/reservas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf' // Especificamos que esperamos un PDF
      },
      body: JSON.stringify({
        peliculaId,
        asientos: asientosSeleccionados
      })
    });

        if (!response.ok) {
            const errorData = await response.json();
            
            if (errorData.error === 'Asientos ocupados') {
                // 1. Mostrar mensaje claro al usuario
                alert(errorData.message);
                
                // 2. Actualizar la interfaz para reflejar asientos ocupados
                errorData.asientosOcupados.forEach(asientoStr => {
                    const [fila, numero] = [asientoStr[0], asientoStr.slice(1)];
                    const botonAsiento = [...document.querySelectorAll('.asiento')]
                        .find(btn => btn.textContent === asientoStr);
                    
                    if (botonAsiento) {
                        botonAsiento.classList.remove('btn-success', 'btn-warning');
                        botonAsiento.classList.add('btn-danger');
                        botonAsiento.disabled = true;
                        
                        // Animación para destacar el cambio
                        botonAsiento.classList.add('asiento-recien-ocupado');
                        setTimeout(() => {
                            botonAsiento.classList.remove('asiento-recien-ocupado');
                        }, 1500);
                    }
                });
                
                // 3. Limpiar selección actual
                asientosSeleccionados = [];
                confirmarBtn.disabled = true;
                return;
            }
            
            throw new Error(errorData.message || 'Error en el servidor');
        }

    // Descargar el PDF
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket-reserva-${Date.now()}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setTimeout(() => window.location.href = '/', 3000);

  } catch (error) {
    console.error('Error al confirmar reserva:', error);
    alert(`Error al confirmar reserva: ${error.message}`);
  }
});
      } catch (error) {
        console.error('Error en proceso de reserva:', error);
        alert('Error al procesar reserva: ' + error.message);
      }
    });
    
  } catch (error) {
    console.error('Error al cargar asientos:', error);
    asientosContainer.innerHTML = `
      <div class="alert alert-danger">
        Error al cargar los asientos: ${error.message}
      </div>
    `;
  }

});


