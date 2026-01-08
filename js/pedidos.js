// ====================================
// PEDIDOS PARA ALMACENISTA
// ====================================

async function loadPedidos() {
    const container = document.getElementById('pedidosContainer');
    if (!container) return;
    
    let pedidos = APP_STATE.data.pedidos || [];
    
    // Filtrar según botón activo
    const activeFilter = document.querySelector('.filter-btn.active');
    const filter = activeFilter ? activeFilter.dataset.filter : 'todos';
    
    if (filter !== 'todos') {
        pedidos = pedidos.filter(p => p.estado === filter);
    }
    
    if (pedidos.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-500); padding: 40px;">No hay pedidos</p>';
        return;
    }
    
    container.innerHTML = pedidos.map(pedido => `
        <div class="pedido-card ${pedido.estado}">
            <div class="pedido-header">
                <div class="pedido-info">
                    <h3>Pedido #${pedido.numero || pedido.id.substr(-8)}</h3>
                    <p><i class="fas fa-calendar"></i> ${formatDate(pedido.fecha)}</p>
                    <p><i class="fas fa-user"></i> Cliente: ${pedido.cliente}</p>
                    ${pedido.almacenista ? `<p><i class="fas fa-user-tie"></i> Almacenista: ${pedido.almacenista}</p>` : ''}
                </div>
                <span class="pedido-status status-badge ${pedido.estado}">
                    ${pedido.estado.toUpperCase()}
                </span>
            </div>
            
            <div class="pedido-items">
                <h4>Items del pedido:</h4>
                ${pedido.items.map(item => `
                    <div class="pedido-item">
                        <span>${item.estilo} - ${getTipoLabel(item.tipo)} x ${item.cantidad}</span>
                    </div>
                `).join('')}
            </div>
            
            ${pedido.notas ? `<p style="margin-top: 10px;"><strong>Notas:</strong> ${pedido.notas}</p>` : ''}
            
            <div class="pedido-actions">
                ${pedido.estado === 'pendiente' ? `
                    <button class="btn-primary" onclick="cambiarEstadoPedido('${pedido.id}', 'preparando')">
                        <i class="fas fa-play"></i> Empezar a Preparar
                    </button>
                ` : ''}
                
                ${pedido.estado === 'preparando' ? `
                    <button class="btn-success" onclick="cambiarEstadoPedido('${pedido.id}', 'preparado')">
                        <i class="fas fa-check"></i> Marcar como Preparado
                    </button>
                ` : ''}
                
                ${pedido.estado === 'preparado' ? `
                    <button class="btn-success" onclick="cambiarEstadoPedido('${pedido.id}', 'entregado')">
                        <i class="fas fa-truck"></i> Marcar como Entregado
                    </button>
                ` : ''}
                
                ${pedido.estado !== 'entregado' ? `
                    <button class="btn-secondary" onclick="editPedido('${pedido.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-danger" onclick="deletePedido('${pedido.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getTipoLabel(tipo) {
    const labels = {
        'barril60': 'Barril 60L',
        'barril20': 'Barril 20L',
        'cajaBotella': 'Caja de Botella (24 pzas)',
        'cajaLata': 'Caja de Lata (24 pzas)',
        'botella': 'Botella suelta',
        'lata': 'Lata suelta'
    };
    return labels[tipo] || tipo;
}

// Filtros
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        loadPedidos();
    });
});

function showAddPedidoModal() {
    const estilos = APP_STATE.data.estilos;
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-plus"></i> Nuevo Pedido</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="addPedidoForm">
                        <div class="form-group">
                            <label>Número de Pedido</label>
                            <input type="text" name="numero" placeholder="Ej: PED-001" required>
                        </div>
                        <div class="form-group">
                            <label>Cliente *</label>
                            <input type="text" name="cliente" required placeholder="Nombre del cliente">
                        </div>
                        <div class="form-group">
                            <label>Almacenista Asignado</label>
                            <input type="text" name="almacenista" placeholder="Nombre del almacenista">
                        </div>
                        <div class="form-group">
                            <label>Items del Pedido</label>
                            <div id="pedidoItemsContainer"></div>
                            <button type="button" class="btn-secondary" onclick="addPedidoItemRow()">
                                <i class="fas fa-plus"></i> Agregar Item
                            </button>
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea name="notas" rows="3" placeholder="Notas adicionales..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitAddPedido()">
                        <i class="fas fa-save"></i> Crear Pedido
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    addPedidoItemRow(); // Primera fila
}

function addPedidoItemRow() {
    const container = document.getElementById('pedidoItemsContainer');
    const estilos = APP_STATE.data.estilos;
    
    const row = createElement(`
        <div class="pedido-item-row" style="display: grid; grid-template-columns: 2fr 2fr 1fr auto; gap: 10px; margin-bottom: 10px; align-items: center;">
            <select name="estilo[]" required>
                <option value="">Estilo...</option>
                ${estilos.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('')}
            </select>
            <select name="tipo[]" required>
                <option value="">Tipo...</option>
                <option value="barril60">Barril 60L</option>
                <option value="barril20">Barril 20L</option>
                <option value="cajaBotella">Caja de Botella</option>
                <option value="cajaLata">Caja de Lata</option>
                <option value="botella">Botella suelta</option>
                <option value="lata">Lata suelta</option>
            </select>
            <input type="number" name="cantidad[]" placeholder="Cant." min="1" required>
            <button type="button" class="btn-danger" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `);
    
    container.appendChild(row);
}

async function submitAddPedido() {
    const form = document.getElementById('addPedidoForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    
    // Procesar items
    const estilos = formData.getAll('estilo[]');
    const tipos = formData.getAll('tipo[]');
    const cantidades = formData.getAll('cantidad[]');
    
    const items = [];
    for (let i = 0; i < estilos.length; i++) {
        if (estilos[i] && tipos[i] && cantidades[i]) {
            items.push({
                estilo: estilos[i],
                tipo: tipos[i],
                cantidad: parseInt(cantidades[i])
            });
        }
    }
    
    if (items.length === 0) {
        alert('Debes agregar al menos un item');
        return;
    }
    
    const data = {
        numero: formData.get('numero'),
        cliente: formData.get('cliente'),
        almacenista: formData.get('almacenista') || '',
        items: items,
        notas: formData.get('notas') || ''
    };
    
    try {
        showLoading('Creando pedido...');
        await API.request('addPedido', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadPedidos();
        showToast('Pedido creado correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function cambiarEstadoPedido(id, nuevoEstado) {
    try {
        showLoading('Actualizando...');
        await API.request('updatePedido', { id, estado: nuevoEstado });
        hideLoading();
        
        await loadPedidos();
        showToast('Estado actualizado correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function deletePedido(id) {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
    
    try {
        showLoading('Eliminando...');
        // Eliminar del array
        APP_STATE.data.pedidos = APP_STATE.data.pedidos.filter(p => p.id !== id);
        saveStateToLocalStorage();
        hideLoading();
        
        await loadPedidos();
        showToast('Pedido eliminado correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function editPedido(id) {
    // Similar a showAddPedidoModal pero prellenando datos
    alert('Función de edición en desarrollo. Por ahora, elimina y crea uno nuevo.');
}
