// ====================================
// APLICACIÓN PRINCIPAL
// ====================================

// Navegación entre secciones
document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const section = tab.dataset.section;
        
        // Actualizar tabs
        document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Actualizar secciones
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(section + 'Section')?.classList.add('active');
        
        // Cargar datos específicos de la sección si es necesario
        switch(section) {
            case 'dashboard':
                if (typeof updateDashboard === 'function') updateDashboard();
                break;
            case 'materiasPrimas':
                if (typeof loadMateriasPrimas === 'function') loadMateriasPrimas();
                break;
            case 'recetas':
                if (typeof loadRecetas === 'function') loadRecetas();
                break;
            case 'estilos':
                if (typeof loadEstilos === 'function') loadEstilos();
                break;
            case 'unitanques':
                if (typeof loadUnitanques === 'function') loadUnitanques();
                break;
            case 'produccion':
                if (typeof initProduccionForm === 'function') initProduccionForm();
                break;
            case 'insumos':
                if (typeof loadInsumos === 'function') loadInsumos();
                break;
            case 'etiquetas':
                if (typeof loadEtiquetas === 'function') loadEtiquetas();
                break;
            case 'envasado':
                if (typeof initEnvasadoForm === 'function') initEnvasadoForm();
                break;
            case 'pedidos':
                if (typeof loadPedidos === 'function') loadPedidos();
                break;
            case 'ventas':
                if (typeof loadVentas === 'function') loadVentas();
                if (typeof loadDegustaciones === 'function') loadDegustaciones();
                break;
            case 'reportes':
                if (typeof initReportes === 'function') initReportes();
                break;
        }
    });
});

// Cerrar modal al hacer clic fuera
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.remove();
    }
});

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.querySelector('.modal-overlay');
        if (modal) modal.remove();
    }
});

// Función helper para crear elementos
function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

// Función para mostrar notificación toast
function showToast(message, type = 'success') {
    const toast = createElement(`
        <div class="toast toast-${type}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        </div>
    `);
    
    document.body.appendChild(toast);
    
    // Agregar estilos si no existen
    if (!document.getElementById('toast-styles')) {
        const styles = createElement(`
            <style id="toast-styles">
                .toast {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: white;
                    padding: 16px 24px;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 600;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                }
                
                .toast-success {
                    border-left: 4px solid var(--success);
                    color: var(--success);
                }
                
                .toast-error {
                    border-left: 4px solid var(--danger);
                    color: var(--danger);
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            </style>
        `);
        document.head.appendChild(styles);
    }
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Función para mostrar loading
function showLoading(message = 'Cargando...') {
    const loading = createElement(`
        <div class="modal-overlay" id="loadingModal">
            <div style="text-align: center; color: white;">
                <div class="loading-spinner" style="border-color: rgba(255,255,255,0.3); border-top-color: white;"></div>
                <p style="margin-top: 20px; font-size: 18px;">${message}</p>
            </div>
        </div>
    `);
    document.body.appendChild(loading);
}

function hideLoading() {
    document.getElementById('loadingModal')?.remove();
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    console.log('🍺 Sistema de Inventarios - Cervecería v' + CONFIG.VERSION);
    console.log('API Configurada:', isApiConfigured());
    
    if (!isApiConfigured()) {
        console.warn('⚠️ Trabajando en modo LOCAL. Configura CONFIG.SHEET_API_URL para conectar con Google Sheets');
    }
});
