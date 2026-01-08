// ====================================
// INSUMOS DE ENVASADO (Sin etiquetas)
// ====================================

async function loadInsumos() {
    const insumos = APP_STATE.data.insumos;
    
    document.getElementById('stockBotellas').textContent = insumos.botellasVacias || 0;
    document.getElementById('stockLatas').textContent = insumos.latasVacias || 0;
    document.getElementById('stockCorcholatas').textContent = insumos.corcholatas || 0;
    document.getElementById('stockCajasBot').textContent = insumos.cajasBotella || 0;
    document.getElementById('stockCajasLata').textContent = insumos.cajasLata || 0;
}

function showAjustarInsumoModal() {
    const insumos = APP_STATE.data.insumos;
    
    const modal = createElement(`
        <div class="modal-overlay">
            <div class="modal">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> Ajustar Stock de Insumos</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="ajustarInsumosForm">
                        <div class="form-group">
                            <label>Botellas Vacías</label>
                            <input type="number" name="botellasVacias" value="${insumos.botellasVacias || 0}" min="0" step="1" required>
                        </div>
                        <div class="form-group">
                            <label>Latas Vacías</label>
                            <input type="number" name="latasVacias" value="${insumos.latasVacias || 0}" min="0" step="1" required>
                        </div>
                        <div class="form-group">
                            <label>Corcholatas</label>
                            <input type="number" name="corcholatas" value="${insumos.corcholatas || 0}" min="0" step="1" required>
                        </div>
                        <div class="form-group">
                            <label>Cajas de Botella</label>
                            <input type="number" name="cajasBotella" value="${insumos.cajasBotella || 0}" min="0" step="1" required>
                        </div>
                        <div class="form-group">
                            <label>Cajas de Lata</label>
                            <input type="number" name="cajasLata" value="${insumos.cajasLata || 0}" min="0" step="1" required>
                        </div>
                        <p style="color: var(--info); font-size: 14px; margin-top: 15px;">
                            <i class="fas fa-info-circle"></i> Las etiquetas se gestionan por estilo en la pestaña "Etiquetas"
                        </p>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                    <button class="btn-primary" onclick="submitAjustarInsumos()">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                </div>
            </div>
        </div>
    `);
    
    document.body.appendChild(modal);
}

async function submitAjustarInsumos() {
    const form = document.getElementById('ajustarInsumosForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        botellasVacias: parseInt(formData.get('botellasVacias')),
        latasVacias: parseInt(formData.get('latasVacias')),
        corcholatas: parseInt(formData.get('corcholatas')),
        cajasBotella: parseInt(formData.get('cajasBotella')),
        cajasLata: parseInt(formData.get('cajasLata'))
    };
    
    try {
        showLoading('Actualizando...');
        await API.request('updateInsumos', data);
        hideLoading();
        
        document.querySelector('.modal-overlay').remove();
        await loadInsumos();
        showToast('Insumos actualizados correctamente');
    } catch (error) {
        hideLoading();
        alert('Error: ' + error.message);
    }
}
