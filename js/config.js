// ====================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ====================================

// URL del Google Apps Script Web App
// IMPORTANTE: Reemplazar con tu URL después de desplegar el script
const CONFIG = {
    // URL de tu Google Apps Script (obtener después del despliegue)
    // Cambia esto a 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' para usar modo local sin API
    SHEET_API_URL: 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE',
    
    // Configuración de la aplicación
    APP_NAME: 'Cervecería - Sistema de Inventarios',
    VERSION: '1.3.0',
    
    // Usuarios por defecto (para demo)
    // En producción, estos vendrán de Google Sheets
    DEFAULT_USERS: [
        {
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            name: 'Administrador'
        },
        {
            username: 'operador1',
            password: 'oper123',
            role: 'operador',
            name: 'Operador 1'
        },
        {
            username: 'operador2',
            password: 'oper123',
            role: 'operador',
            name: 'Operador 2'
        },
        {
            username: 'almacenista',
            password: 'alma123',
            role: 'almacenista',
            name: 'Almacenista'
        }
    ],
    
    // Configuración de tanques
    TANKS: {
        unitanques1000: 5,
        unitanques2000: 7,
        unitanques120: 3,
        briteTank2000: 1
    },
    
    // Estilos de línea por defecto
    DEFAULT_ESTILOS: [
        { nombre: 'Skinny Lager', tipo: 'Línea', abv: 4.5, ibu: 18, color: '#F4E4C1' },
        { nombre: 'Fat Lager', tipo: 'Línea', abv: 5.2, ibu: 22, color: '#E8D5A8' },
        { nombre: 'IPA', tipo: 'Línea', abv: 6.5, ibu: 65, color: '#D4A574' },
        { nombre: 'Red Ale', tipo: 'Línea', abv: 5.8, ibu: 35, color: '#B8604A' },
        { nombre: 'Stout', tipo: 'Línea', abv: 6.0, ibu: 40, color: '#3D2817' }
    ],
    
    // Materias primas por defecto
    DEFAULT_MATERIAS_PRIMAS: [
        { nombre: 'Lúpulo Cascade', unidad: 'kg', stock: 50, minimo: 10 },
        { nombre: 'Lúpulo Centennial', unidad: 'kg', stock: 40, minimo: 10 },
        { nombre: 'Malta Pale', unidad: 'kg', stock: 500, minimo: 100 },
        { nombre: 'Malta Caramelo', unidad: 'kg', stock: 200, minimo: 50 },
        { nombre: 'Malta Chocolate', unidad: 'kg', stock: 100, minimo: 30 },
        { nombre: 'Levadura Ale', unidad: 'kg', stock: 20, minimo: 5 },
        { nombre: 'Levadura Lager', unidad: 'kg', stock: 25, minimo: 5 },
        { nombre: 'Biofine', unidad: 'L', stock: 15, minimo: 5 },
        { nombre: 'Sales Minerales', unidad: 'kg', stock: 30, minimo: 10 }
    ],
    
    // Insumos de envasado por defecto
    DEFAULT_INSUMOS: {
        botellasVacias: 10000,
        latasVacias: 15000,
        corcholatas: 12000,
        cajasBotella: 400,
        cajasLata: 600
    },
    
    // Etiquetas por estilo (inicializadas según estilos)
    DEFAULT_ETIQUETAS: {
        // Se inicializan dinámicamente basadas en los estilos
    }
};

// Estado global de la aplicación
const APP_STATE = {
    currentUser: null,
    lastUpdate: null,
    data: {
        materiasPrimas: [],
        recetas: [],
        estilos: [],
        etiquetas: [],
        unitanques: [],
        insumos: {},
        productoTerminado: {},
        produccion: [],
        envasado: [],
        pedidos: [],
        ventas: []
    }
};

// Función para verificar si la API está configurada
function isApiConfigured() {
    return CONFIG.SHEET_API_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
}

// Función para generar ID único
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Función para formatear fecha
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Función para formatear fecha corta
function formatDateShort(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
    });
}

// Función para actualizar timestamp
function updateLastUpdateTimestamp() {
    APP_STATE.lastUpdate = new Date();
    const elem = document.getElementById('lastUpdate');
    if (elem) {
        elem.textContent = formatDate(APP_STATE.lastUpdate);
    }
}

// Inicializar datos de ejemplo si no hay API
function initializeSampleData() {
    if (isApiConfigured()) return;
    
    // Materias Primas
    APP_STATE.data.materiasPrimas = CONFIG.DEFAULT_MATERIAS_PRIMAS.map((mp, i) => ({
        id: generateId(),
        ...mp
    }));
    
    // Estilos
    APP_STATE.data.estilos = CONFIG.DEFAULT_ESTILOS.map((est, i) => ({
        id: generateId(),
        ...est,
        activo: true
    }));
    
    // Insumos
    APP_STATE.data.insumos = { ...CONFIG.DEFAULT_INSUMOS };
    
    // Etiquetas (una para cada estilo en lata y botella)
    APP_STATE.data.etiquetas = [];
    APP_STATE.data.estilos.forEach(estilo => {
        APP_STATE.data.etiquetas.push({
            id: generateId(),
            estilo: estilo.nombre,
            formato: 'lata',
            stock: 5000
        });
        APP_STATE.data.etiquetas.push({
            id: generateId(),
            estilo: estilo.nombre,
            formato: 'botella',
            stock: 5000
        });
    });
    
    // Unitanques
    let tankId = 1;
    APP_STATE.data.unitanques = [];
    
    // Unitanques 1000L
    for (let i = 1; i <= CONFIG.TANKS.unitanques1000; i++) {
        APP_STATE.data.unitanques.push({
            id: `tank_${tankId++}`,
            nombre: `Unitanque 1000L - ${i}`,
            capacidad: 1000,
            tipo: 'unitanque',
            ocupado: false,
            volumen: 0,
            estilo: '',
            lote: ''
        });
    }
    
    // Unitanques 2000L
    for (let i = 1; i <= CONFIG.TANKS.unitanques2000; i++) {
        APP_STATE.data.unitanques.push({
            id: `tank_${tankId++}`,
            nombre: `Unitanque 2000L - ${i}`,
            capacidad: 2000,
            tipo: 'unitanque',
            ocupado: false,
            volumen: 0,
            estilo: '',
            lote: ''
        });
    }
    
    // Unitanques 120L
    for (let i = 1; i <= CONFIG.TANKS.unitanques120; i++) {
        APP_STATE.data.unitanques.push({
            id: `tank_${tankId++}`,
            nombre: `Unitanque 120L - ${i}`,
            capacidad: 120,
            tipo: 'unitanque',
            ocupado: false,
            volumen: 0,
            estilo: '',
            lote: ''
        });
    }
    
    // Brite Tank
    APP_STATE.data.unitanques.push({
        id: `tank_${tankId++}`,
        nombre: 'Brite Tank 2000L',
        capacidad: 2000,
        tipo: 'brite',
        ocupado: false,
        volumen: 0,
        estilo: '',
        lote: ''
    });
    
    // Producto Terminado (inicializar en 0)
    APP_STATE.data.productoTerminado = {};
    CONFIG.DEFAULT_ESTILOS.forEach(estilo => {
        APP_STATE.data.productoTerminado[estilo.nombre] = {
            barril60: 0,
            barril20: 0,
            latas: 0,
            botellas: 0
        };
    });
    
    updateLastUpdateTimestamp();
}

// Función para guardar estado en localStorage (backup local)
function saveStateToLocalStorage() {
    try {
        localStorage.setItem('brewery_app_state', JSON.stringify(APP_STATE));
    } catch (e) {
        console.error('Error guardando en localStorage:', e);
    }
}

// Función para cargar estado desde localStorage
function loadStateFromLocalStorage() {
    try {
        const saved = localStorage.getItem('brewery_app_state');
        if (saved) {
            const parsed = JSON.parse(saved);
            Object.assign(APP_STATE, parsed);
            return true;
        }
    } catch (e) {
        console.error('Error cargando desde localStorage:', e);
    }
    return false;
}

// Auto-guardar cada 30 segundos
setInterval(saveStateToLocalStorage, 30000);
