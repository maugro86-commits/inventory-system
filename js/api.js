// ====================================
// API Y COMUNICACIÓN CON GOOGLE SHEETS
// ====================================

const API = {
    // Método genérico para hacer peticiones
    async request(action, data = {}) {
        if (!isApiConfigured()) {
            // Modo local sin API
            return this.localRequest(action, data);
        }
        
        try {
            const response = await fetch(CONFIG.SHEET_API_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action,
                    data: data,
                    user: APP_STATE.currentUser?.username || 'system'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                updateLastUpdateTimestamp();
                return result.data;
            } else {
                throw new Error(result.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Simulación local sin conexión a Google Sheets
    localRequest(action, data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let result;
                    
                    switch (action) {
                        case 'login':
                            result = this.local_login(data);
                            break;
                        case 'getAllData':
                            result = APP_STATE.data;
                            break;
                        case 'getMateriasPrimas':
                            result = APP_STATE.data.materiasPrimas;
                            break;
                        case 'addMateriaPrima':
                            result = this.local_addMateriaPrima(data);
                            break;
                        case 'updateMateriaPrima':
                            result = this.local_updateMateriaPrima(data);
                            break;
                        case 'deleteMateriaPrima':
                            result = this.local_deleteMateriaPrima(data);
                            break;
                        case 'getRecetas':
                            result = APP_STATE.data.recetas;
                            break;
                        case 'addReceta':
                            result = this.local_addReceta(data);
                            break;
                        case 'updateReceta':
                            result = this.local_updateReceta(data);
                            break;
                        case 'deleteReceta':
                            result = this.local_deleteReceta(data);
                            break;
                        case 'getEstilos':
                            result = APP_STATE.data.estilos;
                            break;
                        case 'addEstilo':
                            result = this.local_addEstilo(data);
                            break;
                        case 'updateEstilo':
                            result = this.local_updateEstilo(data);
                            break;
                        case 'deleteEstilo':
                            result = this.local_deleteEstilo(data);
                            break;
                        case 'getEtiquetas':
                            result = APP_STATE.data.etiquetas;
                            break;
                        case 'addEtiqueta':
                            result = this.local_addEtiqueta(data);
                            break;
                        case 'updateEtiqueta':
                            result = this.local_updateEtiqueta(data);
                            break;
                        case 'deleteEtiqueta':
                            result = this.local_deleteEtiqueta(data);
                            break;
                        case 'getUnitanques':
                            result = APP_STATE.data.unitanques;
                            break;
                        case 'updateUnitanque':
                            result = this.local_updateUnitanque(data);
                            break;
                        case 'getInsumos':
                            result = APP_STATE.data.insumos;
                            break;
                        case 'updateInsumos':
                            result = this.local_updateInsumos(data);
                            break;
                        case 'getProductoTerminado':
                            result = APP_STATE.data.productoTerminado;
                            break;
                        case 'producir':
                            result = this.local_producir(data);
                            break;
                        case 'envasar':
                            result = this.local_envasar(data);
                            break;
                        case 'addPedido':
                            result = this.local_addPedido(data);
                            break;
                        case 'updatePedido':
                            result = this.local_updatePedido(data);
                            break;
                        case 'getPedidos':
                            result = APP_STATE.data.pedidos;
                            break;
                        case 'addVenta':
                            result = this.local_addVenta(data);
                            break;
                        case 'getVentas':
                            result = APP_STATE.data.ventas;
                            break;
                        default:
                            throw new Error(`Acción no implementada: ${action}`);
                    }
                    
                    updateLastUpdateTimestamp();
                    saveStateToLocalStorage();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }, 300); // Simular latencia de red
        });
    },
    
    // Implementaciones locales
    local_login(data) {
        const user = CONFIG.DEFAULT_USERS.find(u => 
            u.username === data.username && u.password === data.password
        );
        if (!user) {
            throw new Error('Usuario o contraseña incorrectos');
        }
        return { username: user.username, name: user.name, role: user.role };
    },
    
    local_addMateriaPrima(data) {
        const item = { id: generateId(), ...data };
        APP_STATE.data.materiasPrimas.push(item);
        return item;
    },
    
    local_updateMateriaPrima(data) {
        const index = APP_STATE.data.materiasPrimas.findIndex(m => m.id === data.id);
        if (index >= 0) {
            APP_STATE.data.materiasPrimas[index] = { ...APP_STATE.data.materiasPrimas[index], ...data };
            return APP_STATE.data.materiasPrimas[index];
        }
        throw new Error('Materia prima no encontrada');
    },
    
    local_deleteMateriaPrima(data) {
        APP_STATE.data.materiasPrimas = APP_STATE.data.materiasPrimas.filter(m => m.id !== data.id);
        return { success: true };
    },
    
    local_addReceta(data) {
        const item = { id: generateId(), ...data };
        APP_STATE.data.recetas.push(item);
        return item;
    },
    
    local_updateReceta(data) {
        const index = APP_STATE.data.recetas.findIndex(r => r.id === data.id);
        if (index >= 0) {
            APP_STATE.data.recetas[index] = { ...APP_STATE.data.recetas[index], ...data };
            return APP_STATE.data.recetas[index];
        }
        throw new Error('Receta no encontrada');
    },
    
    local_deleteReceta(data) {
        APP_STATE.data.recetas = APP_STATE.data.recetas.filter(r => r.id !== data.id);
        return { success: true };
    },
    
    local_addEstilo(data) {
        const item = { id: generateId(), ...data, activo: true };
        APP_STATE.data.estilos.push(item);
        // Inicializar producto terminado para este estilo
        APP_STATE.data.productoTerminado[data.nombre] = {
            barril60: 0,
            barril20: 0,
            latas: 0,
            botellas: 0
        };
        return item;
    },
    
    local_updateEstilo(data) {
        const index = APP_STATE.data.estilos.findIndex(e => e.id === data.id);
        if (index >= 0) {
            const oldNombre = APP_STATE.data.estilos[index].nombre;
            APP_STATE.data.estilos[index] = { ...APP_STATE.data.estilos[index], ...data };
            
            // Si cambió el nombre, actualizar producto terminado
            if (oldNombre !== data.nombre && APP_STATE.data.productoTerminado[oldNombre]) {
                APP_STATE.data.productoTerminado[data.nombre] = APP_STATE.data.productoTerminado[oldNombre];
                delete APP_STATE.data.productoTerminado[oldNombre];
            }
            
            return APP_STATE.data.estilos[index];
        }
        throw new Error('Estilo no encontrado');
    },
    
    local_deleteEstilo(data) {
        const estilo = APP_STATE.data.estilos.find(e => e.id === data.id);
        if (estilo) {
            // Eliminar producto terminado asociado
            delete APP_STATE.data.productoTerminado[estilo.nombre];
            // Eliminar etiquetas asociadas
            APP_STATE.data.etiquetas = APP_STATE.data.etiquetas.filter(etiq => etiq.estilo !== estilo.nombre);
        }
        APP_STATE.data.estilos = APP_STATE.data.estilos.filter(e => e.id !== data.id);
        return { success: true };
    },
    
    local_addEtiqueta(data) {
        const item = { id: generateId(), ...data };
        APP_STATE.data.etiquetas.push(item);
        return item;
    },
    
    local_updateEtiqueta(data) {
        const index = APP_STATE.data.etiquetas.findIndex(e => e.id === data.id);
        if (index >= 0) {
            APP_STATE.data.etiquetas[index] = { ...APP_STATE.data.etiquetas[index], ...data };
            return APP_STATE.data.etiquetas[index];
        }
        throw new Error('Etiqueta no encontrada');
    },
    
    local_deleteEtiqueta(data) {
        APP_STATE.data.etiquetas = APP_STATE.data.etiquetas.filter(e => e.id !== data.id);
        return { success: true };
    },
    
    local_updateUnitanque(data) {
        const index = APP_STATE.data.unitanques.findIndex(u => u.id === data.id);
        if (index >= 0) {
            APP_STATE.data.unitanques[index] = { ...APP_STATE.data.unitanques[index], ...data };
            return APP_STATE.data.unitanques[index];
        }
        throw new Error('Unitanque no encontrado');
    },
    
    local_updateInsumos(data) {
        APP_STATE.data.insumos = { ...APP_STATE.data.insumos, ...data };
        return APP_STATE.data.insumos;
    },
    
    local_producir(data) {
        const { receta, volumen, tanqueId, lote, fecha } = data;
        
        // Buscar receta
        const recetaObj = APP_STATE.data.recetas.find(r => r.id === receta);
        if (!recetaObj) throw new Error('Receta no encontrada');
        
        // Descontar materias primas
        const factor = volumen / recetaObj.volumen;
        recetaObj.ingredientes.forEach(ing => {
            const mp = APP_STATE.data.materiasPrimas.find(m => m.id === ing.materiaId);
            if (mp) {
                mp.stock -= ing.cantidad * factor;
                if (mp.stock < 0) mp.stock = 0;
            }
        });
        
        // Llenar tanque
        const tanque = APP_STATE.data.unitanques.find(t => t.id === tanqueId);
        if (tanque) {
            tanque.ocupado = true;
            tanque.volumen = volumen;
            tanque.estilo = recetaObj.estilo;
            tanque.lote = lote;
        }
        
        // Registrar producción
        const registro = {
            id: generateId(),
            fecha: fecha,
            lote: lote,
            receta: recetaObj.nombre,
            volumen: volumen,
            tanque: tanque?.nombre || '',
            usuario: APP_STATE.currentUser?.name || 'Usuario'
        };
        APP_STATE.data.produccion.push(registro);
        
        return registro;
    },
    
    local_envasar(data) {
        const { origen, origenId, tipo, cantidad } = data;
        
        // Validar y procesar según origen y tipo
        let volumenLitros = 0;
        let estilo = '';
        
        if (origen === 'tanque') {
            const tanque = APP_STATE.data.unitanques.find(t => t.id === origenId);
            if (!tanque || !tanque.ocupado) throw new Error('Tanque no válido');
            
            estilo = tanque.estilo;
            
            switch (tipo) {
                case 'barril60':
                    volumenLitros = cantidad * 60;
                    break;
                case 'barril20':
                    volumenLitros = cantidad * 20;
                    break;
                case 'lata':
                    volumenLitros = cantidad * 0.355;
                    break;
                case 'botella':
                    volumenLitros = cantidad * 0.355;
                    break;
            }
            
            if (volumenLitros > tanque.volumen) {
                throw new Error('No hay suficiente volumen en el tanque');
            }
            
            tanque.volumen -= volumenLitros;
            if (tanque.volumen <= 0) {
                tanque.volumen = 0;
                tanque.ocupado = false;
                tanque.estilo = '';
                tanque.lote = '';
            }
        } else if (origen === 'barril60') {
            // Desde barril 60L
            if (!APP_STATE.data.productoTerminado[origenId] || 
                APP_STATE.data.productoTerminado[origenId].barril60 < 1) {
                throw new Error('No hay barriles de 60L disponibles');
            }
            estilo = origenId;
            APP_STATE.data.productoTerminado[origenId].barril60 -= 1;
            volumenLitros = 60;
        } else if (origen === 'barril20') {
            // Desde barril 20L
            if (!APP_STATE.data.productoTerminado[origenId] || 
                APP_STATE.data.productoTerminado[origenId].barril20 < 1) {
                throw new Error('No hay barriles de 20L disponibles');
            }
            estilo = origenId;
            APP_STATE.data.productoTerminado[origenId].barril20 -= 1;
            volumenLitros = 20;
        }
        
        // Descontar insumos
        switch (tipo) {
            case 'barril60':
                // No descuenta insumos, es solo un contenedor
                break;
            case 'barril20':
                // No descuenta insumos
                break;
            case 'lata':
                APP_STATE.data.insumos.latasVacias -= cantidad;
                // Descontar etiquetas específicas del estilo
                const etiqLata = APP_STATE.data.etiquetas.find(e => e.estilo === estilo && e.formato === 'lata');
                if (etiqLata) {
                    etiqLata.stock -= cantidad;
                    if (etiqLata.stock < 0) etiqLata.stock = 0;
                }
                break;
            case 'botella':
                APP_STATE.data.insumos.botellasVacias -= cantidad;
                APP_STATE.data.insumos.corcholatas -= cantidad;
                // Descontar etiquetas específicas del estilo
                const etiqBot = APP_STATE.data.etiquetas.find(e => e.estilo === estilo && e.formato === 'botella');
                if (etiqBot) {
                    etiqBot.stock -= cantidad;
                    if (etiqBot.stock < 0) etiqBot.stock = 0;
                }
                break;
        }
        
        // Agregar a producto terminado
        if (!APP_STATE.data.productoTerminado[estilo]) {
            APP_STATE.data.productoTerminado[estilo] = {
                barril60: 0,
                barril20: 0,
                latas: 0,
                botellas: 0
            };
        }
        
        switch (tipo) {
            case 'barril60':
                APP_STATE.data.productoTerminado[estilo].barril60 += cantidad;
                break;
            case 'barril20':
                APP_STATE.data.productoTerminado[estilo].barril20 += cantidad;
                break;
            case 'lata':
                APP_STATE.data.productoTerminado[estilo].latas += cantidad;
                break;
            case 'botella':
                APP_STATE.data.productoTerminado[estilo].botellas += cantidad;
                break;
        }
        
        // Registrar en historial de envasado
        const registro = {
            id: generateId(),
            fecha: new Date().toISOString(),
            estilo: estilo,
            origen: origen,
            origenNombre: origen === 'tanque' ? 
                APP_STATE.data.unitanques.find(t => t.id === origenId)?.nombre : 
                `${origenId} (${origen === 'barril60' ? 'Barril 60L' : 'Barril 20L'})`,
            tipo: tipo,
            cantidad: cantidad,
            litros: volumenLitros,
            usuario: APP_STATE.currentUser?.name || 'Usuario'
        };
        APP_STATE.data.envasado.push(registro);
        
        return { success: true, estilo, tipo, cantidad, registro };
    },
    
    local_addPedido(data) {
        const pedido = {
            id: generateId(),
            ...data,
            fecha: new Date().toISOString(),
            estado: 'pendiente'
        };
        APP_STATE.data.pedidos.push(pedido);
        return pedido;
    },
    
    local_updatePedido(data) {
        const index = APP_STATE.data.pedidos.findIndex(p => p.id === data.id);
        if (index >= 0) {
            APP_STATE.data.pedidos[index] = { ...APP_STATE.data.pedidos[index], ...data };
            return APP_STATE.data.pedidos[index];
        }
        throw new Error('Pedido no encontrado');
    },
    
    local_addVenta(data) {
        const venta = {
            id: generateId(),
            ...data,
            fecha: new Date().toISOString(),
            usuario: APP_STATE.currentUser?.name || 'Usuario'
        };
        
        // Descontar del stock
        data.items.forEach(item => {
            if (APP_STATE.data.productoTerminado[item.estilo]) {
                switch (item.tipo) {
                    case 'barril60':
                        APP_STATE.data.productoTerminado[item.estilo].barril60 -= item.cantidad;
                        break;
                    case 'barril20':
                        APP_STATE.data.productoTerminado[item.estilo].barril20 -= item.cantidad;
                        break;
                    case 'cajaBotella':
                        APP_STATE.data.productoTerminado[item.estilo].botellas -= (item.cantidad * 24);
                        break;
                    case 'cajaLata':
                        APP_STATE.data.productoTerminado[item.estilo].latas -= (item.cantidad * 24);
                        break;
                    case 'botella':
                        APP_STATE.data.productoTerminado[item.estilo].botellas -= item.cantidad;
                        break;
                    case 'lata':
                        APP_STATE.data.productoTerminado[item.estilo].latas -= item.cantidad;
                        break;
                }
            }
        });
        
        APP_STATE.data.ventas.push(venta);
        return venta;
    }
};
