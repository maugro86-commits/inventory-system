// ====================================
// UNITANQUES Y BRITE TANKS
// ====================================

async function loadUnitanques() {
    renderTanksCategory('tanks1000', APP_STATE.data.unitanques.filter(t => t.nombre.includes('1000L')));
    renderTanksCategory('tanks2000', APP_STATE.data.unitanques.filter(t => t.nombre.includes('2000L') && t.tipo === 'unitanque'));
    renderTanksCategory('tanks120', APP_STATE.data.unitanques.filter(t => t.nombre.includes('120L')));
    renderTanksCategory('tanksBrite', APP_STATE.data.unitanques.filter(t => t.tipo === 'brite'));
}

function renderTanksCategory(containerId, tanques) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (tanques.length === 0) {
        container.innerHTML = '<p style="color: var(--gray-500); text-align: center;">No hay tanques en esta categoría</p>';
        return;
    }
    
    container.innerHTML = tanques.map(tanque => `
        <div class="tank-card ${tanque.ocupado ? 'ocupado' : 'vacio'}" onclick="showTankDetails('${tanque.id}')">
            <div class="tank-header">
                <span class="tank-name">${tanque.nombre}</span>
                <span class="tank-status status-badge ${tanque.ocupado ? 'activo' : 'bajo'}">
                    ${tanque.ocupado ? 'Ocupado' : 'Vacío'}
                </span>
            </div>
            <div class="tank-info">
                <p><strong>Capacidad:</strong> ${tanque.capacidad}L</p>
                ${tanque.ocupado ? `
                    <p><strong>Volumen actual:</strong> ${tanque.volumen}L</p>
                    <p><strong>Estilo:</strong> ${tanque.estilo}</p>
                    <p><strong>Lote:</strong> ${tanque.lote}</p>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function showTankDetails(id) {
    const tanque = APP_STATE.data.unitanques.find(t => t.id === id);
    if (!tanque) return;
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-database"></i> ${tanque.nombre}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div style="background: var(--gray-100); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="margin-bottom: 10px;"><strong>Capacidad:</strong> ${tanque.capacidad}L</p>
                        <p style="margin-bottom: 10px;"><strong>Tipo:</strong> ${tanque.tipo === 'brite' ? 'Brite Tank' : 'Unitanque'}</p>
                        <p style="margin-bottom: 10px;">
                            <strong>Estado:</strong> 
                            <span class="status-badge ${tanque.ocupado ? 'activo' : 'bajo'}">
                                ${tanque.ocupado ? 'Ocupado' : 'Vacío'}
                            </span>
                        </p>
                        ${tanque.ocupado ? `
                            <hr style="margin: 15px 0;">
                            <p style="margin-bottom: 10px;"><strong>Volumen actual:</strong> ${tanque.volumen}L</p>
                            <p style="margin-bottom: 10px;"><strong>Estilo:</strong> ${tanque.estilo}</p>
                            <p style="margin-bottom: 10px;"><strong>Lote:</strong> ${tanque.lote}</p>
                        ` : ''}
                    </div>
                    
                    ${tanque.ocupado ? `
                        <button class="btn-danger btn-large" onclick="vaciarTanque('${tanque.id}')">
                            <i class="fas fa-times"></i> Vaciar Tanque
                        </button>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

async function vaciarTanque(id) {
    if (!confirm('¿Estás seguro de vaciar este tanque? Esta acción no se puede deshacer.')) return;
    
    try {
        showLoading('Vaciando tanque...');
        await API.request('updateUnitanque', {
            id: id,
            ocupado: false,
            volumen: 0,
            estilo: '',
            lote: ''
        });
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadUnitanques();
        showToast('Tanque vaciado correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}
