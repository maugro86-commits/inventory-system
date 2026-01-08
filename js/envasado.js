// ====================================
// ENVASADO MULTINIVEL
// ====================================

let currentOrigenType = 'tanque';

function initEnvasadoForm() {
    loadProductoTerminado();
    
    // Tabs de origen
    document.querySelectorAll('.envasado-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            currentOrigenType = tab.dataset.origen;
            
            document.querySelectorAll('.envasado-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            updateEnvasadoOrigenOptions();
            updateEnvasadoTipoOptions();
        });
    });
    
    // Tipo de envasado change
    document.getElementById('envasadoTipo')?.addEventListener('change', updateEnvasadoInfo);
    document.getElementById('envasadoCantidad')?.addEventListener('input', updateEnvasadoInfo);
    document.getElementById('envasadoOrigen')?.addEventListener('change', updateEnvasadoInfo);
    
    updateEnvasadoOrigenOptions();
}

function updateEnvasadoOrigenOptions() {
    const select = document.getElementById('envasadoOrigen');
    const label = document.getElementById('labelOrigen');
    
    if (!select || !label) return;
    
    let options = '';
    
    switch (currentOrigenType) {
        case 'tanque':
            label.textContent = 'Tanque Origen';
            const tanquesOcupados = APP_STATE.data.unitanques.filter(t => t.ocupado);
            options = tanquesOcupados.map(t => 
                `<option value="${t.id}">${t.nombre} - ${t.estilo} (${t.volumen}L)</option>`
            ).join('');
            break;
            
        case 'barril60':
            label.textContent = 'Estilo del Barril 60L';
            Object.entries(APP_STATE.data.productoTerminado).forEach(([estilo, prod]) => {
                if (prod.barril60 > 0) {
                    options += `<option value="${estilo}">${estilo} (${prod.barril60} barriles)</option>`;
                }
            });
            break;
            
        case 'barril20':
            label.textContent = 'Estilo del Barril 20L';
            Object.entries(APP_STATE.data.productoTerminado).forEach(([estilo, prod]) => {
                if (prod.barril20 > 0) {
                    options += `<option value="${estilo}">${estilo} (${prod.barril20} barriles)</option>`;
                }
            });
            break;
    }
    
    select.innerHTML = '<option value="">Seleccionar...</option>' + options;
}

function updateEnvasadoTipoOptions() {
    const select = document.getElementById('envasadoTipo');
    if (!select) return;
    
    let options = '';
    
    switch (currentOrigenType) {
        case 'tanque':
            options = `
                <option value="barril60">Barril 60L</option>
                <option value="barril20">Barril 20L</option>
                <option value="lata">Latas 355ml</option>
                <option value="botella">Botellas 355ml</option>
            `;
            break;
            
        case 'barril60':
            options = `
                <option value="barril20">Barril 20L</option>
                <option value="lata">Latas 355ml</option>
                <option value="botella">Botellas 355ml</option>
            `;
            break;
            
        case 'barril20':
            options = `
                <option value="lata">Latas 355ml</option>
                <option value="botella">Botellas 355ml</option>
            `;
            break;
    }
    
    select.innerHTML = '<option value="">Seleccionar...</option>' + options;
}

function updateEnvasadoInfo() {
    const origenId = document.getElementById('envasadoOrigen').value;
    const tipo = document.getElementById('envasadoTipo').value;
    const cantidad = parseInt(document.getElementById('envasadoCantidad').value) || 0;
    const infoDiv = document.getElementById('envasadoInfo');
    const labelCantidad = document.getElementById('labelCantidad');
    
    if (!infoDiv || !labelCantidad) return;
    
    // Actualizar label de cantidad
    switch (tipo) {
        case 'barril60':
            labelCantidad.textContent = 'Cantidad de Barriles 60L';
            break;
        case 'barril20':
            labelCantidad.textContent = 'Cantidad de Barriles 20L';
            break;
        case 'lata':
            labelCantidad.textContent = 'Cantidad de Latas 355ml';
            break;
        case 'botella':
            labelCantidad.textContent = 'Cantidad de Botellas 355ml';
            break;
        default:
            labelCantidad.textContent = 'Cantidad';
    }
    
    if (!origenId || !tipo || !cantidad) {
        infoDiv.innerHTML = '';
        return;
    }
    
    // Calcular volumen necesario
    let volumenNecesario = 0;
    let unidad = '';
    
    switch (tipo) {
        case 'barril60':
            volumenNecesario = cantidad * 60;
            unidad = 'L';
            break;
        case 'barril20':
            volumenNecesario = cantidad * 20;
            unidad = 'L';
            break;
        case 'lata':
            volumenNecesario = cantidad * 0.355;
            unidad = 'L';
            break;
        case 'botella':
            volumenNecesario = cantidad * 0.355;
            unidad = 'L';
            break;
    }
    
    // Verificar disponibilidad
    let disponible = 0;
    let mensaje = '';
    
    if (currentOrigenType === 'tanque') {
        const tanque = APP_STATE.data.unitanques.find(t => t.id === origenId);
        if (tanque) {
            disponible = tanque.volumen;
        }
    } else if (currentOrigenType === 'barril60') {
        disponible = 60; // Un barril
    } else if (currentOrigenType === 'barril20') {
        disponible = 20; // Un barril
    }
    
    const suficiente = volumenNecesario <= disponible;
    
    // Obtener estilo
    let estilo = '';
    if (currentOrigenType === 'tanque') {
        const tanque = APP_STATE.data.unitanques.find(t => t.id === origenId);
        if (tanque) estilo = tanque.estilo;
    } else {
        estilo = origenId; // El origenId es el nombre del estilo
    }
    
    // Verificar insumos
    const insumos = APP_STATE.data.insumos;
    let insuficienteInsumos = false;
    let mensajeInsumos = '';
    
    if (tipo === 'lata') {
        if (insumos.latasVacias < cantidad) {
            insuficienteInsumos = true;
            mensajeInsumos += `<br>❌ Latas insuficientes (necesitas ${cantidad}, hay ${insumos.latasVacias})`;
        }
        // Verificar etiquetas específicas de lata para el estilo
        const stockEtiquetas = getEtiquetaStock(estilo, 'lata');
        if (stockEtiquetas < cantidad) {
            insuficienteInsumos = true;
            mensajeInsumos += `<br>❌ Etiquetas de lata insuficientes para ${estilo} (necesitas ${cantidad}, hay ${stockEtiquetas})`;
        }
    } else if (tipo === 'botella') {
        if (insumos.botellasVacias < cantidad) {
            insuficienteInsumos = true;
            mensajeInsumos += `<br>❌ Botellas insuficientes (necesitas ${cantidad}, hay ${insumos.botellasVacias})`;
        }
        // Verificar etiquetas específicas de botella para el estilo
        const stockEtiquetas = getEtiquetaStock(estilo, 'botella');
        if (stockEtiquetas < cantidad) {
            insuficienteInsumos = true;
            mensajeInsumos += `<br>❌ Etiquetas de botella insuficientes para ${estilo} (necesitas ${cantidad}, hay ${stockEtiquetas})`;
        }
        if (insumos.corcholatas < cantidad) {
            insuficienteInsumos = true;
            mensajeInsumos += `<br>❌ Corcholatas insuficientes (necesitas ${cantidad}, hay ${insumos.corcholatas})`;
        }
    }
    
    infoDiv.style.background = (suficiente && !insuficienteInsumos) ? 'var(--success)' : 'var(--danger)';
    infoDiv.innerHTML = `
        <strong>Información de envasado:</strong><br>
        Volumen necesario: ${volumenNecesario.toFixed(2)} ${unidad}<br>
        Disponible: ${disponible} ${unidad}<br>
        ${suficiente ? '✓ Volumen suficiente' : '❌ Volumen insuficiente'}
        ${mensajeInsumos}
    `;
}

document.getElementById('envasadoForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const origenId = document.getElementById('envasadoOrigen').value;
    const tipo = document.getElementById('envasadoTipo').value;
    const cantidad = parseInt(document.getElementById('envasadoCantidad').value);
    
    if (!origenId || !tipo || !cantidad) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    if (!confirm(`¿Envasar ${cantidad} unidades?`)) return;
    
    try {
        showLoading('Envasando...');
        await API.request('envasar', {
            origen: currentOrigenType,
            origenId: origenId,
            tipo: tipo,
            cantidad: cantidad
        });
        hideLoading();
        
        // Limpiar formulario
        document.getElementById('envasadoForm').reset();
        document.getElementById('envasadoInfo').innerHTML = '';
        
        // Refrescar datos
        await loadUnitanques();
        await loadInsumos();
        await loadProductoTerminado();
        updateEnvasadoOrigenOptions();
        
        showToast('Envasado realizado correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
});

async function loadProductoTerminado() {
    const container = document.getElementById('productoTerminadoContainer');
    if (!container) return;
    
    const productos = APP_STATE.data.productoTerminado;
    
    if (Object.keys(productos).length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-500);">No hay producto terminado</p>';
        return;
    }
    
    container.innerHTML = Object.entries(productos).map(([estilo, prod]) => `
        <div class="producto-card">
            <h4>${estilo}</h4>
            <div class="producto-item">
                <span class="producto-label">Barriles 60L</span>
                <span class="producto-cantidad">${prod.barril60 || 0}</span>
            </div>
            <div class="producto-item">
                <span class="producto-label">Barriles 20L</span>
                <span class="producto-cantidad">${prod.barril20 || 0}</span>
            </div>
            <div class="producto-item">
                <span class="producto-label">Latas 355ml</span>
                <span class="producto-cantidad">${prod.latas || 0}</span>
            </div>
            <div class="producto-item">
                <span class="producto-label">Botellas 355ml</span>
                <span class="producto-cantidad">${prod.botellas || 0}</span>
            </div>
            <div class="producto-item" style="border-top: 2px solid var(--primary-color); padding-top: 10px; margin-top: 10px;">
                <span class="producto-label"><strong>Cajas de Lata</strong></span>
                <span class="producto-cantidad"><strong>${Math.floor((prod.latas || 0) / 24)}</strong></span>
            </div>
            <div class="producto-item">
                <span class="producto-label"><strong>Cajas de Botella</strong></span>
                <span class="producto-cantidad"><strong>${Math.floor((prod.botellas || 0) / 24)}</strong></span>
            </div>
        </div>
    `).join('');
}
