// ====================================
// ETIQUETAS POR ESTILO Y FORMATO
// ====================================

async function loadEtiquetas() {
    const tbody = document.getElementById('etiquetasTableBody');
    if (!tbody) return;
    
    try {
        const etiquetas = APP_STATE.data.etiquetas || [];
        
        if (etiquetas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay etiquetas registradas</td></tr>';
            return;
        }
        
        // Agrupar por estilo para mejor visualización
        const grouped = {};
        etiquetas.forEach(etiq => {
            if (!grouped[etiq.estilo]) {
                grouped[etiq.estilo] = { lata: null, botella: null };
            }
            if (etiq.formato === 'lata') {
                grouped[etiq.estilo].lata = etiq;
            } else {
                grouped[etiq.estilo].botella = etiq;
            }
        });
        
        tbody.innerHTML = Object.entries(grouped).map(([estilo, formats]) => `
            ${formats.lata ? `
            <tr>
                <td>${estilo}</td>
                <td><span class="status-badge activo">Lata</span></td>
                <td>${formats.lata.stock}</td>
                <td>
                    <span class="status-badge ${formats.lata.stock <= 500 ? 'bajo' : 'ok'}">
                        ${formats.lata.stock <= 500 ? 'BAJO' : 'OK'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn-secondary" onclick="editEtiqueta('${formats.lata.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteEtiqueta('${formats.lata.id}', '${estilo}', 'Lata')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
            ` : ''}
            ${formats.botella ? `
            <tr>
                <td>${estilo}</td>
                <td><span class="status-badge temporada">Botella</span></td>
                <td>${formats.botella.stock}</td>
                <td>
                    <span class="status-badge ${formats.botella.stock <= 500 ? 'bajo' : 'ok'}">
                        ${formats.botella.stock <= 500 ? 'BAJO' : 'OK'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn-secondary" onclick="editEtiqueta('${formats.botella.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteEtiqueta('${formats.botella.id}', '${estilo}', 'Botella')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
            ` : ''}
        `).join('');
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Error cargando datos</td></tr>';
        console.error('Error:', error);
    }
}

function showAddEtiquetaModal() {
    const estilos = APP_STATE.data.estilos || [];
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-plus"></i> Agregar Etiquetas para Nuevo Estilo</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="addEtiquetaForm">
                        <div class="form-group">
                            <label>Estilo *</label>
                            <select name="estilo" id="estiloSelect" required onchange="checkExistingEtiquetas()">
                                <option value="">Seleccionar estilo...</option>
                                ${estilos.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('')}
                            </select>
                            <small style="color: var(--gray-600); margin-top: 5px; display: block;">
                                Se crearán etiquetas para Lata y Botella
                            </small>
                        </div>
                        <div id="warningExisting" class="info-box" style="display: none; background: var(--warning); color: var(--dark-color);">
                            <i class="fas fa-exclamation-triangle"></i> Este estilo ya tiene etiquetas registradas
                        </div>
                        <div class="form-group">
                            <label>Stock Inicial Latas *</label>
                            <input type="number" name="stockLata" min="0" step="1" value="5000" required>
                        </div>
                        <div class="form-group">
                            <label>Stock Inicial Botellas *</label>
                            <input type="number" name="stockBotella" min="0" step="1" value="5000" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitAddEtiqueta()">
                        <i class="fas fa-save"></i> Crear Etiquetas
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

function checkExistingEtiquetas() {
    const estilo = document.getElementById('estiloSelect')?.value;
    const warning = document.getElementById('warningExisting');
    
    if (!estilo || !warning) return;
    
    const existing = APP_STATE.data.etiquetas.filter(e => e.estilo === estilo);
    
    if (existing.length > 0) {
        warning.style.display = 'block';
    } else {
        warning.style.display = 'none';
    }
}

async function submitAddEtiqueta() {
    const form = document.getElementById('addEtiquetaForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const estilo = formData.get('estilo');
    const stockLata = parseInt(formData.get('stockLata'));
    const stockBotella = parseInt(formData.get('stockBotella'));
    
    // Verificar si ya existen
    const existing = APP_STATE.data.etiquetas.filter(e => e.estilo === estilo);
    if (existing.length > 0) {
        if (!confirm('Este estilo ya tiene etiquetas. ¿Crear duplicados?')) {
            return;
        }
    }
    
    try {
        showLoading('Creando etiquetas...');
        
        // Crear etiqueta para lata
        await API.request('addEtiqueta', {
            estilo: estilo,
            formato: 'lata',
            stock: stockLata
        });
        
        // Crear etiqueta para botella
        await API.request('addEtiqueta', {
            estilo: estilo,
            formato: 'botella',
            stock: stockBotella
        });
        
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadEtiquetas();
        showToast('Etiquetas creadas correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function editEtiqueta(id) {
    const etiqueta = APP_STATE.data.etiquetas.find(e => e.id === id);
    if (!etiqueta) return;
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Editar Etiqueta</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="editEtiquetaForm">
                        <input type="hidden" name="id" value="${etiqueta.id}">
                        <div class="form-group">
                            <label>Estilo</label>
                            <input type="text" value="${etiqueta.estilo}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Formato</label>
                            <input type="text" value="${etiqueta.formato === 'lata' ? 'Lata' : 'Botella'}" disabled>
                        </div>
                        <div class="form-group">
                            <label>Stock *</label>
                            <input type="number" name="stock" value="${etiqueta.stock}" min="0" step="1" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitEditEtiqueta()">
                        <i class="fas fa-save"></i> Actualizar
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

async function submitEditEtiqueta() {
    const form = document.getElementById('editEtiquetaForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        id: formData.get('id'),
        stock: parseInt(formData.get('stock'))
    };
    
    try {
        showLoading('Actualizando...');
        await API.request('updateEtiqueta', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadEtiquetas();
        showToast('Etiqueta actualizada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function deleteEtiqueta(id, estilo, formato) {
    if (!confirm(`¿Estás seguro de eliminar las etiquetas de ${formato} para "${estilo}"?`)) return;
    
    try {
        showLoading('Eliminando...');
        await API.request('deleteEtiqueta', { id });
        hideLoading();
        
        await loadEtiquetas();
        showToast('Etiqueta eliminada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

// Función helper para obtener stock de etiqueta específica
function getEtiquetaStock(estilo, formato) {
    const etiqueta = APP_STATE.data.etiquetas?.find(e => 
        e.estilo === estilo && e.formato === formato
    );
    return etiqueta ? etiqueta.stock : 0;
}

// Función helper para descontar etiquetas
async function descontarEtiquetas(estilo, formato, cantidad) {
    const etiqueta = APP_STATE.data.etiquetas?.find(e => 
        e.estilo === estilo && e.formato === formato
    );
    
    if (!etiqueta) {
        throw new Error(`No se encontraron etiquetas de ${formato} para ${estilo}`);
    }
    
    if (etiqueta.stock < cantidad) {
        throw new Error(`Stock insuficiente de etiquetas de ${formato} para ${estilo}`);
    }
    
    await API.request('updateEtiqueta', {
        id: etiqueta.id,
        stock: etiqueta.stock - cantidad
    });
}
