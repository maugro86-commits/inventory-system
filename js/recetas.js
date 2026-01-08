// ====================================
// RECETAS
// ====================================

async function loadRecetas() {
    const tbody = document.getElementById('recetasTableBody');
    if (!tbody) return;
    
    try {
        const recetas = APP_STATE.data.recetas;
        
        if (recetas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No hay recetas registradas</td></tr>';
            return;
        }
        
        tbody.innerHTML = recetas.map(receta => `
            <tr>
                <td>${receta.nombre}</td>
                <td>${receta.estilo}</td>
                <td>${receta.volumen}L</td>
                <td>
                    <button class="btn-secondary" onclick="showRecetaIngredientes('${receta.id}')">
                        <i class="fas fa-list"></i> Ver (${receta.ingredientes?.length || 0})
                    </button>
                </td>
                <td class="action-buttons">
                    <button class="btn-secondary" onclick="editReceta('${receta.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-danger" onclick="deleteReceta('${receta.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Error cargando datos</td></tr>';
        console.error('Error:', error);
    }
}

function showAddRecetaModal() {
    const estilos = APP_STATE.data.estilos.filter(e => e.activo);
    const materias = APP_STATE.data.materiasPrimas;
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-plus"></i> Crear Receta</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="addRecetaForm">
                        <div class="form-group">
                            <label>Nombre de la Receta *</label>
                            <input type="text" name="nombre" required placeholder="Ej: IPA Tropical Batch 1">
                        </div>
                        <div class="form-group">
                            <label>Estilo *</label>
                            <select name="estilo" required>
                                <option value="">Seleccionar estilo...</option>
                                ${estilos.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Volumen de Producción (L) *</label>
                            <input type="number" name="volumen" min="1" step="1" required placeholder="Ej: 1000">
                        </div>
                        <div class="form-group">
                            <label>Ingredientes</label>
                            <div id="ingredientesContainer">
                                ${materias.length === 0 ? '<p>No hay materias primas disponibles</p>' : ''}
                            </div>
                            <button type="button" class="btn-secondary" onclick="addIngredienteRow()">
                                <i class="fas fa-plus"></i> Agregar Ingrediente
                            </button>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitAddReceta()">
                        <i class="fas fa-save"></i> Guardar Receta
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    addIngredienteRow(); // Agregar primera fila
}

function addIngredienteRow() {
    const container = document.getElementById('ingredientesContainer');
    const materias = APP_STATE.data.materiasPrimas;
    
    const row = createElement(`
        <div class="ingrediente-row" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
            <select name="materiaId[]" required style="flex: 2;">
                <option value="">Seleccionar materia prima...</option>
                ${materias.map(m => `<option value="${m.id}">${m.nombre} (${m.unidad})</option>`).join('')}
            </select>
            <input type="number" name="cantidad[]" placeholder="Cantidad" min="0" step="0.01" required style="flex: 1;">
            <button type="button" class="btn-danger" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `);
    
    container.appendChild(row);
}

async function submitAddReceta() {
    const form = document.getElementById('addRecetaForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    
    // Procesar ingredientes
    const materiaIds = formData.getAll('materiaId[]');
    const cantidades = formData.getAll('cantidad[]');
    
    const ingredientes = [];
    for (let i = 0; i < materiaIds.length; i++) {
        if (materiaIds[i] && cantidades[i]) {
            ingredientes.push({
                materiaId: materiaIds[i],
                cantidad: parseFloat(cantidades[i])
            });
        }
    }
    
    if (ingredientes.length === 0) {
        alert('Debes agregar al menos un ingrediente');
        return;
    }
    
    const data = {
        nombre: formData.get('nombre'),
        estilo: formData.get('estilo'),
        volumen: parseFloat(formData.get('volumen')),
        ingredientes: ingredientes
    };
    
    try {
        showLoading('Guardando...');
        await API.request('addReceta', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadRecetas();
        showToast('Receta creada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

function showRecetaIngredientes(id) {
    const receta = APP_STATE.data.recetas.find(r => r.id === id);
    if (!receta) return;
    
    const ingredientesHTML = receta.ingredientes.map(ing => {
        const materia = APP_STATE.data.materiasPrimas.find(m => m.id === ing.materiaId);
        return `
            <div style="padding: 10px; background: var(--gray-100); border-radius: 6px; margin-bottom: 8px;">
                <strong>${materia?.nombre || 'Materia desconocida'}</strong>
                <span style="float: right;">${ing.cantidad} ${materia?.unidad || ''}</span>
            </div>
        `;
    }).join('');
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-list"></i> Ingredientes: ${receta.nombre}</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p><strong>Estilo:</strong> ${receta.estilo}</p>
                    <p><strong>Volumen:</strong> ${receta.volumen}L</p>
                    <hr style="margin: 20px 0;">
                    <h3>Ingredientes:</h3>
                    ${ingredientesHTML}
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.modal-overlay').remove()">Cerrar</button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

async function editReceta(id) {
    const receta = APP_STATE.data.recetas.find(r => r.id === id);
    if (!receta) return;
    
    const estilos = APP_STATE.data.estilos.filter(e => e.activo);
    const materias = APP_STATE.data.materiasPrimas;
    
    const ingredientesRows = receta.ingredientes.map(ing => {
        return `
            <div class="ingrediente-row" style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
                <select name="materiaId[]" required style="flex: 2;">
                    ${materias.map(m => `<option value="${m.id}" ${m.id === ing.materiaId ? 'selected' : ''}>${m.nombre} (${m.unidad})</option>`).join('')}
                </select>
                <input type="number" name="cantidad[]" value="${ing.cantidad}" min="0" step="0.01" required style="flex: 1;">
                <button type="button" class="btn-danger" onclick="this.parentElement.remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }).join('');
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Editar Receta</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="editRecetaForm">
                        <input type="hidden" name="id" value="${receta.id}">
                        <div class="form-group">
                            <label>Nombre de la Receta *</label>
                            <input type="text" name="nombre" value="${receta.nombre}" required>
                        </div>
                        <div class="form-group">
                            <label>Estilo *</label>
                            <select name="estilo" required>
                                ${estilos.map(e => `<option value="${e.nombre}" ${e.nombre === receta.estilo ? 'selected' : ''}>${e.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Volumen de Producción (L) *</label>
                            <input type="number" name="volumen" value="${receta.volumen}" min="1" step="1" required>
                        </div>
                        <div class="form-group">
                            <label>Ingredientes</label>
                            <div id="ingredientesContainer">
                                ${ingredientesRows}
                            </div>
                            <button type="button" class="btn-secondary" onclick="addIngredienteRow()">
                                <i class="fas fa-plus"></i> Agregar Ingrediente
                            </button>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitEditReceta()">
                        <i class="fas fa-save"></i> Actualizar
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

async function submitEditReceta() {
    const form = document.getElementById('editRecetaForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    
    // Procesar ingredientes
    const materiaIds = formData.getAll('materiaId[]');
    const cantidades = formData.getAll('cantidad[]');
    
    const ingredientes = [];
    for (let i = 0; i < materiaIds.length; i++) {
        if (materiaIds[i] && cantidades[i]) {
            ingredientes.push({
                materiaId: materiaIds[i],
                cantidad: parseFloat(cantidades[i])
            });
        }
    }
    
    if (ingredientes.length === 0) {
        alert('Debes tener al menos un ingrediente');
        return;
    }
    
    const data = {
        id: formData.get('id'),
        nombre: formData.get('nombre'),
        estilo: formData.get('estilo'),
        volumen: parseFloat(formData.get('volumen')),
        ingredientes: ingredientes
    };
    
    try {
        showLoading('Actualizando...');
        await API.request('updateReceta', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadRecetas();
        showToast('Receta actualizada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function deleteReceta(id) {
    const receta = APP_STATE.data.recetas.find(r => r.id === id);
    if (!receta) return;
    
    if (!confirm(`¿Estás seguro de eliminar la receta "${receta.nombre}"?`)) return;
    
    try {
        showLoading('Eliminando...');
        await API.request('deleteReceta', { id });
        hideLoading();
        
        await loadRecetas();
        showToast('Receta eliminada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}
