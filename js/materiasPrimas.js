// ====================================
// MATERIAS PRIMAS
// ====================================

async function loadMateriasPrimas() {
    const tbody = document.getElementById('materiasPrimasTableBody');
    if (!tbody) return;
    
    try {
        const materias = APP_STATE.data.materiasPrimas;
        
        if (materias.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="loading">No hay materias primas registradas</td></tr>';
            return;
        }
        
        tbody.innerHTML = materias.map(mp => `
            <tr>
                <td>${mp.nombre}</td>
                <td>${mp.unidad}</td>
                <td>${mp.stock}</td>
                <td>${mp.minimo}</td>
                <td>
                    <span class="status-badge ${mp.stock <= mp.minimo ? 'bajo' : 'ok'}">
                        ${mp.stock <= mp.minimo ? 'BAJO' : 'OK'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn-secondary" onclick="editMateriaPrima('${mp.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteMateriaPrima('${mp.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Error cargando datos</td></tr>';
        console.error('Error:', error);
    }
}

function showAddMateriaPrimaModal() {
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-plus"></i> Agregar Materia Prima</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="addMateriaPrimaForm">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" name="nombre" required>
                        </div>
                        <div class="form-group">
                            <label>Unidad *</label>
                            <select name="unidad" required>
                                <option value="kg">Kilogramos (kg)</option>
                                <option value="L">Litros (L)</option>
                                <option value="g">Gramos (g)</option>
                                <option value="ml">Mililitros (ml)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Stock Actual *</label>
                            <input type="number" name="stock" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Stock Mínimo *</label>
                            <input type="number" name="minimo" min="0" step="0.01" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitAddMateriaPrima()">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

async function submitAddMateriaPrima() {
    const form = document.getElementById('addMateriaPrimaForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        nombre: formData.get('nombre'),
        unidad: formData.get('unidad'),
        stock: parseFloat(formData.get('stock')),
        minimo: parseFloat(formData.get('minimo'))
    };
    
    try {
        showLoading('Guardando...');
        await API.request('addMateriaPrima', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadMateriasPrimas();
        showToast('Materia prima agregada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function editMateriaPrima(id) {
    const mp = APP_STATE.data.materiasPrimas.find(m => m.id === id);
    if (!mp) return;
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Editar Materia Prima</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="editMateriaPrimaForm">
                        <input type="hidden" name="id" value="${mp.id}">
                        <div class="form-group">
                            <label>Nombre *</label>
                            <input type="text" name="nombre" value="${mp.nombre}" required>
                        </div>
                        <div class="form-group">
                            <label>Unidad *</label>
                            <select name="unidad" required>
                                <option value="kg" ${mp.unidad === 'kg' ? 'selected' : ''}>Kilogramos (kg)</option>
                                <option value="L" ${mp.unidad === 'L' ? 'selected' : ''}>Litros (L)</option>
                                <option value="g" ${mp.unidad === 'g' ? 'selected' : ''}>Gramos (g)</option>
                                <option value="ml" ${mp.unidad === 'ml' ? 'selected' : ''}>Mililitros (ml)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Stock Actual *</label>
                            <input type="number" name="stock" value="${mp.stock}" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>Stock Mínimo *</label>
                            <input type="number" name="minimo" value="${mp.minimo}" min="0" step="0.01" required>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitEditMateriaPrima()">
                        <i class="fas fa-save"></i> Actualizar
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

async function submitEditMateriaPrima() {
    const form = document.getElementById('editMateriaPrimaForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        id: formData.get('id'),
        nombre: formData.get('nombre'),
        unidad: formData.get('unidad'),
        stock: parseFloat(formData.get('stock')),
        minimo: parseFloat(formData.get('minimo'))
    };
    
    try {
        showLoading('Actualizando...');
        await API.request('updateMateriaPrima', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadMateriasPrimas();
        showToast('Materia prima actualizada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function deleteMateriaPrima(id) {
    const mp = APP_STATE.data.materiasPrimas.find(m => m.id === id);
    if (!mp) return;
    
    if (!confirm(`¿Estás seguro de eliminar "${mp.nombre}"?`)) return;
    
    try {
        showLoading('Eliminando...');
        await API.request('deleteMateriaPrima', { id });
        hideLoading();
        
        await loadMateriasPrimas();
        showToast('Materia prima eliminada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}
