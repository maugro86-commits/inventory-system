// ====================================
// PRODUCCIÓN
// ====================================

function initProduccionForm() {
    loadProduccionRecetas();
    loadProduccionTanques();
    loadProduccionHistory();
    
    // Fecha actual por defecto
    document.getElementById('produccionFecha').value = new Date().toISOString().split('T')[0];
}

function loadProduccionRecetas() {
    const select = document.getElementById('produccionReceta');
    if (!select) return;
    
    const recetas = APP_STATE.data.recetas;
    
    select.innerHTML = '<option value="">Seleccionar receta...</option>' + 
        recetas.map(r => `<option value="${r.id}">${r.nombre} (${r.estilo} - ${r.volumen}L)</option>`).join('');
    
    select.addEventListener('change', (e) => {
        const recetaId = e.target.value;
        if (recetaId) {
            showRecetaDetailsInProduction(recetaId);
        } else {
            document.getElementById('recetaDetails').innerHTML = '';
        }
    });
}

function loadProduccionTanques() {
    const select = document.getElementById('produccionTanque');
    if (!select) return;
    
    const tanquesDisponibles = APP_STATE.data.unitanques.filter(t => !t.ocupado);
    
    select.innerHTML = '<option value="">Seleccionar tanque...</option>' + 
        tanquesDisponibles.map(t => `<option value="${t.id}">${t.nombre} (${t.capacidad}L)</option>`).join('');
}

function showRecetaDetailsInProduction(recetaId) {
    const receta = APP_STATE.data.recetas.find(r => r.id === recetaId);
    if (!receta) return;
    
    const ingredientesHTML = receta.ingredientes.map(ing => {
        const materia = APP_STATE.data.materiasPrimas.find(m => m.id === ing.materiaId);
        const stockDisponible = materia ? materia.stock : 0;
        const suficiente = stockDisponible >= ing.cantidad;
        
        return `
            <div style="padding: 8px; background: ${suficiente ? '#d4edda' : '#f8d7da'}; border-radius: 4px; margin-bottom: 5px; display: flex; justify-content: space-between;">
                <span>${materia?.nombre || 'Desconocido'}</span>
                <span><strong>${ing.cantidad} ${materia?.unidad || ''}</strong> (Disponible: ${stockDisponible})</span>
            </div>
        `;
    }).join('');
    
    document.getElementById('recetaDetails').innerHTML = `
        <h4 style="color: var(--dark-color); margin-bottom: 10px;">Ingredientes requeridos:</h4>
        ${ingredientesHTML}
        <p style="margin-top: 15px; font-size: 14px; color: var(--gray-600);">
            <i class="fas fa-info-circle"></i> Los ingredientes se descontarán automáticamente del inventario
        </p>
    `;
}

document.getElementById('produccionForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const recetaId = document.getElementById('produccionReceta').value;
    const volumen = parseFloat(document.getElementById('produccionVolumen').value);
    const tanqueId = document.getElementById('produccionTanque').value;
    const lote = document.getElementById('produccionLote').value;
    const fecha = document.getElementById('produccionFecha').value;
    
    if (!recetaId || !volumen || !tanqueId || !lote || !fecha) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    // Validar capacidad del tanque
    const tanque = APP_STATE.data.unitanques.find(t => t.id === tanqueId);
    if (tanque && volumen > tanque.capacidad) {
        alert(`El volumen (${volumen}L) excede la capacidad del tanque (${tanque.capacidad}L)`);
        return;
    }
    
    // Validar disponibilidad de materias primas
    const receta = APP_STATE.data.recetas.find(r => r.id === recetaId);
    if (receta) {
        const factor = volumen / receta.volumen;
        let faltante = false;
        
        for (const ing of receta.ingredientes) {
            const materia = APP_STATE.data.materiasPrimas.find(m => m.id === ing.materiaId);
            const cantidadNecesaria = ing.cantidad * factor;
            
            if (!materia || materia.stock < cantidadNecesaria) {
                alert(`Stock insuficiente de ${materia?.nombre || 'materia desconocida'}. Necesitas ${cantidadNecesaria} ${materia?.unidad || ''} pero solo hay ${materia?.stock || 0}`);
                faltante = true;
                break;
            }
        }
        
        if (faltante) return;
    }
    
    if (!confirm(`¿Iniciar producción de ${volumen}L de ${receta?.estilo}?`)) return;
    
    try {
        showLoading('Iniciando producción...');
        await API.request('producir', {
            receta: recetaId,
            volumen: volumen,
            tanqueId: tanqueId,
            lote: lote,
            fecha: fecha
        });
        hideLoading();
        
        // Limpiar formulario
        document.getElementById('produccionForm').reset();
        document.getElementById('recetaDetails').innerHTML = '';
        document.getElementById('produccionFecha').value = new Date().toISOString().split('T')[0];
        
        // Refrescar datos
        await loadMateriasPrimas();
        await loadUnitanques();
        loadProduccionTanques();
        loadProduccionHistory();
        
        showToast('Producción iniciada correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
});

function loadProduccionHistory() {
    const tbody = document.getElementById('produccionHistoryBody');
    if (!tbody) return;
    
    const history = APP_STATE.data.produccion || [];
    
    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">Sin registros</td></tr>';
        return;
    }
    
    // Mostrar los últimos 10
    const recent = history.slice(-10).reverse();
    
    tbody.innerHTML = recent.map(prod => `
        <tr>
            <td>${formatDateShort(prod.fecha)}</td>
            <td>${prod.lote}</td>
            <td>${prod.receta}</td>
            <td>${prod.volumen}L</td>
            <td>${prod.tanque}</td>
            <td>${prod.usuario}</td>
        </tr>
    `).join('');
}
