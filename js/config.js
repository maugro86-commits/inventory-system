1	// ====================================
     2	// CONFIGURACIÓN DE LA APLICACIÓN
     3	// ====================================
     4	
     5	// URL del Google Apps Script Web App
     6	// IMPORTANTE: Reemplazar con tu URL después de desplegar el script
     7	const CONFIG = {
     8	    // URL de tu Google Apps Script (obtener después del despliegue)
     9	    // Cambia esto a 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' para usar modo local sin API
    10	    SHEET_API_URL: 'https://script.google.com/macros/s/AKfycbyXIyq0TE9PQikSoGQuFU0i2ZGyMoMlINXXQy1FoP535H6ix_uPFSD_bJWoGxzU_nCp/exec',
    11	    
    12	    // Configuración de la aplicación
    13	    APP_NAME: 'Cervecería - Sistema de Inventarios',
    14	    VERSION: '1.3.0',
    15	    
    16	    // Usuarios por defecto (para demo)
    17	    // En producción, estos vendrán de Google Sheets
    18	    DEFAULT_USERS: [
    19	        {
    20	            username: 'admin',
    21	            password: 'admin123',
    22	            role: 'admin',
    23	            name: 'Administrador'
    24	        },
    25	        {
    26	            username: 'operador1',
    27	            password: 'oper123',
    28	            role: 'operador',
    29	            name: 'Operador 1'
    30	        },
    31	        {
    32	            username: 'operador2',
    33	            password: 'oper123',
    34	            role: 'operador',
    35	            name: 'Operador 2'
    36	        },
    37	        {
    38	            username: 'almacenista',
    39	            password: 'alma123',
    40	            role: 'almacenista',
    41	            name: 'Almacenista'
    42	        }
    43	    ],
    44	    
    45	    // Configuración de tanques
    46	    TANKS: {
    47	        unitanques1000: 5,
    48	        unitanques2000: 7,
    49	        unitanques120: 3,
    50	        briteTank2000: 1
    51	    },
    52	    
    53	    // Estilos de línea por defecto
    54	    DEFAULT_ESTILOS: [
    55	        { nombre: 'Skinny Lager', tipo: 'Línea', abv: 4.5, ibu: 18, color: '#F4E4C1' },
    56	        { nombre: 'Fat Lager', tipo: 'Línea', abv: 5.2, ibu: 22, color: '#E8D5A8' },
    57	        { nombre: 'IPA', tipo: 'Línea', abv: 6.5, ibu: 65, color: '#D4A574' },
    58	        { nombre: 'Red Ale', tipo: 'Línea', abv: 5.8, ibu: 35, color: '#B8604A' },
    59	        { nombre: 'Stout', tipo: 'Línea', abv: 6.0, ibu: 40, color: '#3D2817' }
    60	    ],
    61	    
    62	    // Materias primas por defecto
    63	    DEFAULT_MATERIAS_PRIMAS: [
    64	        { nombre: 'Lúpulo Cascade', unidad: 'kg', stock: 50, minimo: 10 },
    65	        { nombre: 'Lúpulo Centennial', unidad: 'kg', stock: 40, minimo: 10 },
    66	        { nombre: 'Malta Pale', unidad: 'kg', stock: 500, minimo: 100 },
    67	        { nombre: 'Malta Caramelo', unidad: 'kg', stock: 200, minimo: 50 },
    68	        { nombre: 'Malta Chocolate', unidad: 'kg', stock: 100, minimo: 30 },
    69	        { nombre: 'Levadura Ale', unidad: 'kg', stock: 20, minimo: 5 },
    70	        { nombre: 'Levadura Lager', unidad: 'kg', stock: 25, minimo: 5 },
    71	        { nombre: 'Biofine', unidad: 'L', stock: 15, minimo: 5 },
    72	        { nombre: 'Sales Minerales', unidad: 'kg', stock: 30, minimo: 10 }
    73	    ],
    74	    
    75	    // Insumos de envasado por defecto
    76	    DEFAULT_INSUMOS: {
    77	        botellasVacias: 10000,
    78	        latasVacias: 15000,
    79	        corcholatas: 12000,
    80	        cajasBotella: 400,
    81	        cajasLata: 600
    82	    },
    83	    
    84	    // Etiquetas por estilo (inicializadas según estilos)
    85	    DEFAULT_ETIQUETAS: {
    86	        // Se inicializan dinámicamente basadas en los estilos
    87	    }
    88	};
    89	
    90	// Estado global de la aplicación
    91	const APP_STATE = {
    92	    currentUser: null,
    93	    lastUpdate: null,
    94	    data: {
    95	        materiasPrimas: [],
    96	        recetas: [],
    97	        estilos: [],
    98	        etiquetas: [],
    99	        unitanques: [],
   100	        insumos: {},
   101	        productoTerminado: {},
   102	        produccion: [],
   103	        envasado: [],
   104	        pedidos: [],
   105	        ventas: []
   106	    }
   107	};
   108	
   109	// Función para verificar si la API está configurada
   110	function isApiConfigured() {
   111	    return CONFIG.SHEET_API_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   112	}
   113	
   114	// Función para generar ID único
   115	function generateId() {
   116	    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
   117	}
   118	
   119	// Función para formatear fecha
   120	function formatDate(date) {
   121	    if (!date) return '';
   122	    const d = new Date(date);
   123	    return d.toLocaleDateString('es-MX', { 
   124	        year: 'numeric', 
   125	        month: '2-digit', 
   126	        day: '2-digit',
   127	        hour: '2-digit',
   128	        minute: '2-digit'
   129	    });
   130	}
   131	
   132	// Función para formatear fecha corta
   133	function formatDateShort(date) {
   134	    if (!date) return '';
   135	    const d = new Date(date);
   136	    return d.toLocaleDateString('es-MX', { 
   137	        year: 'numeric', 
   138	        month: '2-digit', 
   139	        day: '2-digit'
   140	    });
   141	}
   142	
   143	// Función para actualizar timestamp
   144	function updateLastUpdateTimestamp() {
   145	    APP_STATE.lastUpdate = new Date();
   146	    const elem = document.getElementById('lastUpdate');
   147	    if (elem) {
   148	        elem.textContent = formatDate(APP_STATE.lastUpdate);
   149	    }
   150	}
   151	
   152	// Inicializar datos de ejemplo si no hay API
   153	function initializeSampleData() {
   154	    if (isApiConfigured()) return;
   155	    
   156	    // Materias Primas
   157	    APP_STATE.data.materiasPrimas = CONFIG.DEFAULT_MATERIAS_PRIMAS.map((mp, i) => ({
   158	        id: generateId(),
   159	        ...mp
   160	    }));
   161	    
   162	    // Estilos
   163	    APP_STATE.data.estilos = CONFIG.DEFAULT_ESTILOS.map((est, i) => ({
   164	        id: generateId(),
   165	        ...est,
   166	        activo: true
   167	    }));
   168	    
   169	    // Insumos
   170	    APP_STATE.data.insumos = { ...CONFIG.DEFAULT_INSUMOS };
   171	    
   172	    // Etiquetas (una para cada estilo en lata y botella)
   173	    APP_STATE.data.etiquetas = [];
   174	    APP_STATE.data.estilos.forEach(estilo => {
   175	        APP_STATE.data.etiquetas.push({
   176	            id: generateId(),
   177	            estilo: estilo.nombre,
   178	            formato: 'lata',
   179	            stock: 5000
   180	        });
   181	        APP_STATE.data.etiquetas.push({
   182	            id: generateId(),
   183	            estilo: estilo.nombre,
   184	            formato: 'botella',
   185	            stock: 5000
   186	        });
   187	    });
   188	    
   189	    // Unitanques
   190	    let tankId = 1;
   191	    APP_STATE.data.unitanques = [];
   192	    
   193	    // Unitanques 1000L
   194	    for (let i = 1; i <= CONFIG.TANKS.unitanques1000; i++) {
   195	        APP_STATE.data.unitanques.push({
   196	            id: `tank_${tankId++}`,
   197	            nombre: `Unitanque 1000L - ${i}`,
   198	            capacidad: 1000,
   199	            tipo: 'unitanque',
   200	            ocupado: false,
   201	            volumen: 0,
   202	            estilo: '',
   203	            lote: ''
   204	        });
   205	    }
   206	    
   207	    // Unitanques 2000L
   208	    for (let i = 1; i <= CONFIG.TANKS.unitanques2000; i++) {
   209	        APP_STATE.data.unitanques.push({
   210	            id: `tank_${tankId++}`,
   211	            nombre: `Unitanque 2000L - ${i}`,
   212	            capacidad: 2000,
   213	            tipo: 'unitanque',
   214	            ocupado: false,
   215	            volumen: 0,
   216	            estilo: '',
   217	            lote: ''
   218	        });
   219	    }
   220	    
   221	    // Unitanques 120L
   222	    for (let i = 1; i <= CONFIG.TANKS.unitanques120; i++) {
   223	        APP_STATE.data.unitanques.push({
   224	            id: `tank_${tankId++}`,
   225	            nombre: `Unitanque 120L - ${i}`,
   226	            capacidad: 120,
   227	            tipo: 'unitanque',
   228	            ocupado: false,
   229	            volumen: 0,
   230	            estilo: '',
   231	            lote: ''
   232	        });
   233	    }
   234	    
   235	    // Brite Tank
   236	    APP_STATE.data.unitanques.push({
   237	        id: `tank_${tankId++}`,
   238	        nombre: 'Brite Tank 2000L',
   239	        capacidad: 2000,
   240	        tipo: 'brite',
   241	        ocupado: false,
   242	        volumen: 0,
   243	        estilo: '',
   244	        lote: ''
   245	    });
   246	    
   247	    // Producto Terminado (inicializar en 0)
   248	    APP_STATE.data.productoTerminado = {};
   249	    CONFIG.DEFAULT_ESTILOS.forEach(estilo => {
   250	        APP_STATE.data.productoTerminado[estilo.nombre] = {
   251	            barril60: 0,
   252	            barril20: 0,
   253	            latas: 0,
   254	            botellas: 0
   255	        };
   256	    });
   257	    
   258	    updateLastUpdateTimestamp();
   259	}
   260	
   261	// Función para guardar estado en localStorage (backup local)
   262	function saveStateToLocalStorage() {
   263	    try {
   264	        localStorage.setItem('brewery_app_state', JSON.stringify(APP_STATE));
   265	    } catch (e) {
   266	        console.error('Error guardando en localStorage:', e);
   267	    }
   268	}
   269	
   270	// Función para cargar estado desde localStorage
   271	function loadStateFromLocalStorage() {
   272	    try {
   273	        const saved = localStorage.getItem('brewery_app_state');
   274	        if (saved) {
   275	            const parsed = JSON.parse(saved);
   276	            Object.assign(APP_STATE, parsed);
   277	            return true;
   278	        }
   279	    } catch (e) {
   280	        console.error('Error cargando desde localStorage:', e);
   281	    }
   282	    return false;
   283	}
   284	
   285	// Auto-guardar cada 30 segundos
   286	setInterval(saveStateToLocalStorage, 30000);
   287	
