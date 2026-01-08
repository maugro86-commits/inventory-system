// ====================================
// ESTILOS DE CERVEZA
// ====================================

async function loadEstilos() {
    const tbody = document.getElementById('estilosTableBody');
    if (!tbody) return;
    
    try {
        const estilos = APP_STATE.data.estilos;
        
        if (estilos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">No hay estilos registrados</td></tr>';
            return;
        }
        
        tbody.innerHTML = estilos.map(estilo => `
            <tr>
                <td>${estilo.nombre}</td>
                <td>
                    <span class="status-badge ${estilo.tipo === 'Línea' ? 'activo' : 'temporada'}">
                        ${estilo.tipo}
                    </span>
                </td>
                <td>${estilo.abv}%</td>
                <td>${estilo.ibu}</td>
                <td>
                    <div style="display: inline-block; width: 30px; height: 20px; background: ${estilo.color}; border: 1px solid #ccc; border-radius: 4px;"></div>
                </td>
                <td>
                    <span class="status-badge ${estilo.activo ? 'activo' : 'bajo'}">
                        ${estilo.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn-secondary" onclick="editEstilo('${estilo.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteEstilo('${estilo.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Error cargando datos</td></tr>';
        console.error('Error:', error);
    }
}

function showAddEstiloModal() {
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-plus"></i> Agregar Estilo de Cerveza</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="addEstiloForm">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" name="nombre" required placeholder="Ej: IPA Tropical">
                        </div>
                        <div class="form-group">
                            <label>Tipo *</label>
                            <select name="tipo" required>
                                <option value="Línea">Línea (permanente)</option>
                                <option value="Temporada">Temporada (edición especial)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>ABV (%) *</label>
                            <input type="number" name="abv" min="0" max="20" step="0.1" required placeholder="Ej: 6.5">
                        </div>
                        <div class="form-group">
                            <label>IBU *</label>
                            <input type="number" name="ibu" min="0" max="120" step="1" required placeholder="Ej: 65">
                        </div>
                        <div class="form-group">
                            <label>Color (Hex) *</label>
                            <input type="color" name="color" value="#d4af37" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitAddEstilo()">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

async function submitAddEstilo() {
    const form = document.getElementById('addEstiloForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        nombre: formData.get('nombre'),
        tipo: formData.get('tipo'),
        abv: parseFloat(formData.get('abv')),
        ibu: parseInt(formData.get('ibu')),
        color: formData.get('color')
    };
    
    try {
        showLoading('Guardando...');
        await API.request('addEstilo', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadEstilos();
        showToast('Estilo agregado correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function editEstilo(id) {
    const estilo = APP_STATE.data.estilos.find(e => e.id === id);
    if (!estilo) return;
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Editar Estilo de Cerveza</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="editEstiloForm">
                        <input type="hidden" name="id" value="${estilo.id}">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" name="nombre" value="${estilo.nombre}" required>
                        </div>
                        <div class="form-group">
                            <label>Tipo *</label>
                            <select name="tipo" required>
                                <option value="Línea" ${estilo.tipo === 'Línea' ? 'selected' : ''}>Línea (permanente)</option>
                                <option value="Temporada" ${estilo.tipo === 'Temporada' ? 'selected' : ''}>Temporada (edición especial)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>ABV (%) *</label>
                            <input type="number" name="abv" value="${estilo.abv}" min="0" max="20" step="0.1" required>
                        </div>
                        <div class="form-group">
                            <label>IBU *</label>
                            <input type="number" name="ibu" value="${estilo.ibu}" min="0" max="120" step="1" required>
                        </div>
                        <div class="form-group">
                            <label>Color (Hex) *</label>
                            <input type="color" name="color" value="${estilo.color}" required>
                        </div>
                        <div class="form-group">
                            <label>Estado *</label>
                            <select name="activo" required>
                                <option value="true" ${estilo.activo ? 'selected' : ''}>Activo</option>
                                <option value="false" ${!estilo.activo ? 'selected' : ''}>Inactivo</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitEditEstilo()">
                        <i class="fas fa-save"></i> Actualizar
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

async function submitEditEstilo() {
    const form = document.getElementById('editEstiloForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        id: formData.get('id'),
        nombre: formData.get('nombre'),
        tipo: formData.get('tipo'),
        abv: parseFloat(formData.get('abv')),
        ibu: parseInt(formData.get('ibu')),
        color: formData.get('color'),
        activo: formData.get('activo') === 'true'
    };
    
    try {
        showLoading('Actualizando...');
        await API.request('updateEstilo', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadEstilos();
        await loadProductoTerminado(); // Refrescar producto terminado por si cambió el nombre
        showToast('Estilo actualizado correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function deleteEstilo(id) {
    const estilo = APP_STATE.data.estilos.find(e => e.id === id);
    if (!estilo) return;
    
    // Verificar si hay stock de este estilo
    const stock = APP_STATE.data.productoTerminado[estilo.nombre];
    if (stock && (stock.barril60 > 0 || stock.barril20 > 0 || stock.latas > 0 || stock.botellas > 0)) {
        if (!confirm(`ADVERTENCIA: Hay stock de "${estilo.nombre}" en el inventario. Al eliminarlo, se perderá el registro del stock. ¿Continuar?`)) {
            return;
        }
    }
    
    if (!confirm(`¿Estás seguro de eliminar el estilo "${estilo.nombre}"?`)) return;
    
    try {
        showLoading('Eliminando...');
        await API.request('deleteEstilo', { id });
        hideLoading();
        
        await loadEstilos();
        await loadProductoTerminado();
        showToast('Estilo eliminado correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}
