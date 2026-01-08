// ====================================
// AUTENTICACIÓN
// ====================================

// Manejar login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const user = await API.request('login', { username, password });
        
        APP_STATE.currentUser = user;
        saveStateToLocalStorage();
        
        // Mostrar pantalla principal
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        
        // Actualizar información del usuario
        document.getElementById('currentUser').textContent = user.name;
        document.getElementById('userRole').textContent = user.role.toUpperCase();
        
        // Cargar datos iniciales
        await loadAllData();
        
        errorDiv.classList.remove('show');
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('show');
    }
});

// Manejar logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        APP_STATE.currentUser = null;
        saveStateToLocalStorage();
        
        document.getElementById('mainScreen').classList.remove('active');
        document.getElementById('loginScreen').classList.add('active');
        
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
});

// Auto-login si hay sesión guardada
window.addEventListener('DOMContentLoaded', () => {
    loadStateFromLocalStorage();
    
    if (APP_STATE.currentUser) {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('mainScreen').classList.add('active');
        
        document.getElementById('currentUser').textContent = APP_STATE.currentUser.name;
        document.getElementById('userRole').textContent = APP_STATE.currentUser.role.toUpperCase();
        
        loadAllData();
    } else {
        // Inicializar datos de ejemplo
        initializeSampleData();
    }
});

// Cargar todos los datos
async function loadAllData() {
    try {
        if (!isApiConfigured()) {
            initializeSampleData();
        } else {
            const data = await API.request('getAllData');
            APP_STATE.data = data;
        }
        
        // Refrescar todas las vistas
        if (typeof loadMateriasPrimas === 'function') loadMateriasPrimas();
        if (typeof loadRecetas === 'function') loadRecetas();
        if (typeof loadEstilos === 'function') loadEstilos();
        if (typeof loadUnitanques === 'function') loadUnitanques();
        if (typeof loadInsumos === 'function') loadInsumos();
        if (typeof loadEtiquetas === 'function') loadEtiquetas();
        if (typeof loadProductoTerminado === 'function') loadProductoTerminado();
        if (typeof loadPedidos === 'function') loadPedidos();
        if (typeof loadVentas === 'function') loadVentas();
        if (typeof loadDegustaciones === 'function') loadDegustaciones();
        if (typeof updateDashboard === 'function') updateDashboard();
        
    } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Error cargando datos: ' + error.message);
    }
}
