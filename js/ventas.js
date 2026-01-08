// ====================================
// VENTAS Y DEGUSTACIONES
// ====================================

// Tabs para alternar entre ventas y degustaciones
document.querySelectorAll('[data-ventas-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabType = tab.dataset.ventasTab;
        
        document.querySelectorAll('[data-ventas-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        if (tabType === 'ventas') {
            document.getElementById('ventasTableContainer').style.display = 'block';
            document.getElementById('degustacionesTableContainer').style.display = 'none';
        } else {
            document.getElementById('ventasTableContainer').style.display = 'none';
            document.getElementById('degustacionesTableContainer').style.display = 'block';
        }
    });
});

async function loadVentas() {
    const tbody = document.getElementById('ventasTableBody');
    if (!tbody) return;
    
    const ventas = APP_STATE.data.ventas || [];
    const ventasRegulares = ventas.filter(v => v.tipo !== 'degustacion');
    
    if (ventasRegulares.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Sin registros</td></tr>';
        return;
    }
    
    // Mostrar los últimos 20
    const recent = ventasRegulares.slice(-20).reverse();
    
    tbody.innerHTML = recent.map(venta => `
        <tr>
            <td>${formatDate(venta.fecha)}</td>
            <td>${venta.cliente}</td>
            <td>${getVentaDetalle(venta)}</td>
            <td>$${venta.total || 0}</td>
            <td>${venta.usuario}</td>
        </tr>
    `).join('');
}

async function loadDegustaciones() {
    const tbody = document.getElementById('degustacionesTableBody');
    if (!tbody) return;
    
    const ventas = APP_STATE.data.ventas || [];
    const degustaciones = ventas.filter(v => v.tipo === 'degustacion');
    
    if (degustaciones.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Sin registros</td></tr>';
        return;
    }
    
    // Mostrar los últimos 20
    const recent = degustaciones.slice(-20).reverse();
    
    tbody.innerHTML = recent.map(deg => `
        <tr>
            <td>${formatDate(deg.fecha)}</td>
            <td>${deg.cliente}</td>
            <td>${getVentaDetalle(deg)}</td>
            <td>${deg.usuario}</td>
        </tr>
    `).join('');
}

function getVentaDetalle(venta) {
    return venta.items.map(item => 
        `${item.estilo} - ${getTipoLabel(item.tipo)} x ${item.cantidad}`
    ).join('<br>');
}

function showRegistrarVentaModal() {
    const estilos = APP_STATE.data.estilos;
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-cash-register"></i> Registrar Venta</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="registrarVentaForm">
                        <div class="form-group">
                            <label>Cliente *</label>
                            <input type="text" name="cliente" required placeholder="Nombre del cliente">
                        </div>
                        <div class="form-group">
                            <label>Tipo de Venta *</label>
                            <select name="tipoVenta" required>
                                <option value="barril">Barriles</option>
                                <option value="caja">Cajas completas</option>
                                <option value="piezas">Piezas sueltas</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Items de la Venta</label>
                            <div id="ventaItemsContainer"></div>
                            <button type="button" class="btn-secondary" onclick="addVentaItemRow()">
                                <i class="fas fa-plus"></i> Agregar Item
                            </button>
                        </div>
                        <div class="form-group">
                            <label>Total (opcional)</label>
                            <input type="number" name="total" min="0" step="0.01" placeholder="0.00">
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea name="notas" rows="2" placeholder="Notas adicionales..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitRegistrarVenta()">
                        <i class="fas fa-save"></i> Registrar Venta
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    addVentaItemRow(); // Primera fila
}

function showRegistrarDegustacionModal() {
    const estilos = APP_STATE.data.estilos;
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-wine-glass"></i> Registrar Degustación</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="registrarDegustacionForm">
                        <div class="form-group">
                            <label>Evento / Persona *</label>
                            <input type="text" name="cliente" required placeholder="Ej: Vendedora María - Evento XYZ">
                        </div>
                        <div class="form-group">
                            <label>Items para Degustación</label>
                            <div id="degustacionItemsContainer"></div>
                            <button type="button" class="btn-secondary" onclick="addDegustacionItemRow()">
                                <i class="fas fa-plus"></i> Agregar Item
                            </button>
                        </div>
                        <div class="form-group">
                            <label>Notas</label>
                            <textarea name="notas" rows="2" placeholder="Propósito de la degustación, feedback, etc..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitRegistrarDegustacion()">
                        <i class="fas fa-save"></i> Registrar Degustación
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
    addDegustacionItemRow(); // Primera fila
}

function addVentaItemRow() {
    const container = document.getElementById('ventaItemsContainer');
    const estilos = APP_STATE.data.estilos;
    
    const row = createElement(`
        <div class="venta-item-row" style="display: grid; grid-template-columns: 2fr 2fr 1fr auto; gap: 10px; margin-bottom: 10px; align-items: center;">
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

function addDegustacionItemRow() {
    const container = document.getElementById('degustacionItemsContainer');
    const estilos = APP_STATE.data.estilos;
    
    const row = createElement(`
        <div class="deg-item-row" style="display: grid; grid-template-columns: 2fr 2fr 1fr auto; gap: 10px; margin-bottom: 10px; align-items: center;">
            <select name="estilo[]" required>
                <option value="">Estilo...</option>
                ${estilos.map(e => `<option value="${e.nombre}">${e.nombre}</option>`).join('')}
            </select>
            <select name="tipo[]" required>
                <option value="">Tipo...</option>
                <option value="botella">Botellas</option>
                <option value="lata">Latas</option>
            </select>
            <input type="number" name="cantidad[]" placeholder="Cant." min="1" required>
            <button type="button" class="btn-danger" onclick="this.parentElement.remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `);
    
    container.appendChild(row);
}

async function submitRegistrarVenta() {
    const form = document.getElementById('registrarVentaForm');
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
    
    // Validar disponibilidad de stock
    for (const item of items) {
        const stock = APP_STATE.data.productoTerminado[item.estilo];
        if (!stock) {
            alert(`No hay stock disponible de ${item.estilo}`);
            return;
        }
        
        let disponible = 0;
        switch (item.tipo) {
            case 'barril60':
                disponible = stock.barril60;
                break;
            case 'barril20':
                disponible = stock.barril20;
                break;
            case 'cajaBotella':
                disponible = Math.floor(stock.botellas / 24);
                break;
            case 'cajaLata':
                disponible = Math.floor(stock.latas / 24);
                break;
            case 'botella':
                disponible = stock.botellas;
                break;
            case 'lata':
                disponible = stock.latas;
                break;
        }
        
        if (disponible < item.cantidad) {
            alert(`Stock insuficiente de ${item.estilo} - ${getTipoLabel(item.tipo)}. Disponible: ${disponible}, Solicitado: ${item.cantidad}`);
            return;
        }
    }
    
    const data = {
        cliente: formData.get('cliente'),
        tipoVenta: formData.get('tipoVenta'),
        items: items,
        total: parseFloat(formData.get('total')) || 0,
        notas: formData.get('notas') || '',
        tipo: 'venta'
    };
    
    if (!confirm('¿Confirmar registro de venta? Se descontará del inventario.')) return;
    
    try {
        showLoading('Registrando venta...');
        await API.request('addVenta', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadVentas();
        await loadProductoTerminado();
        await updateDashboard();
        showToast('Venta registrada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}

async function submitRegistrarDegustacion() {
    const form = document.getElementById('registrarDegustacionForm');
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
    
    // Validar disponibilidad de stock
    for (const item of items) {
        const stock = APP_STATE.data.productoTerminado[item.estilo];
        if (!stock) {
            alert(`No hay stock disponible de ${item.estilo}`);
            return;
        }
        
        let disponible = 0;
        if (item.tipo === 'botella') {
            disponible = stock.botellas;
        } else if (item.tipo === 'lata') {
            disponible = stock.latas;
        }
        
        if (disponible < item.cantidad) {
            alert(`Stock insuficiente de ${item.estilo} - ${getTipoLabel(item.tipo)}. Disponible: ${disponible}, Solicitado: ${item.cantidad}`);
            return;
        }
    }
    
    const data = {
        cliente: formData.get('cliente'),
        items: items,
        notas: formData.get('notas') || '',
        tipo: 'degustacion',
        total: 0
    };
    
    if (!confirm('¿Confirmar registro de degustación? Se descontará del inventario.')) return;
    
    try {
        showLoading('Registrando degustación...');
        await API.request('addVenta', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadDegustaciones();
        await loadProductoTerminado();
        await updateDashboard();
        showToast('Degustación registrada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}
