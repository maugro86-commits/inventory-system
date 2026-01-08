// ====================================
// REPORTES Y ESTADÍSTICAS
// ====================================

let chartLitrosEstilo = null;
let chartProduccionEnvasado = null;

function initReportes() {
    // Configurar fechas por defecto (último mes)
    const hoy = new Date();
    const haceUnMes = new Date();
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);
    
    document.getElementById('reporteFechaDesde').value = haceUnMes.toISOString().split('T')[0];
    document.getElementById('reporteFechaHasta').value = hoy.toISOString().split('T')[0];
    
    actualizarReportes();
}

function actualizarReportes() {
    const desde = new Date(document.getElementById('reporteFechaDesde').value || 0);
    const hasta = new Date(document.getElementById('reporteFechaHasta').value || Date.now());
    hasta.setHours(23, 59, 59, 999); // Incluir todo el día
    
    calcularEstadisticas(desde, hasta);
    cargarHistorialEnvasado(desde, hasta);
    cargarResumenEstilos(desde, hasta);
    renderChartLitrosEstilo(desde, hasta);
    renderChartProduccionEnvasado(desde, hasta);
}

function calcularEstadisticas(desde, hasta) {
    // Producción
    let totalProducido = 0;
    APP_STATE.data.produccion.forEach(prod => {
        const fecha = new Date(prod.fecha);
        if (fecha >= desde && fecha <= hasta) {
            totalProducido += parseFloat(prod.volumen) || 0;
        }
    });
    
    // Envasado
    let totalEnvasado = 0;
    let totalLatasEnvasadas = 0;
    let totalBotellasEnvasadas = 0;
    APP_STATE.data.envasado.forEach(env => {
        const fecha = new Date(env.fecha);
        if (fecha >= desde && fecha <= hasta) {
            totalEnvasado += parseFloat(env.litros) || 0;
            if (env.tipo === 'lata') {
                totalLatasEnvasadas += parseInt(env.cantidad) || 0;
            }
            if (env.tipo === 'botella') {
                totalBotellasEnvasadas += parseInt(env.cantidad) || 0;
            }
        }
    });
    
    // Vendido
    let totalVendido = 0;
    APP_STATE.data.ventas.forEach(venta => {
        const fecha = new Date(venta.fecha);
        if (fecha >= desde && fecha <= hasta) {
            venta.items.forEach(item => {
                let litros = 0;
                switch(item.tipo) {
                    case 'barril60':
                        litros = item.cantidad * 60;
                        break;
                    case 'barril20':
                        litros = item.cantidad * 20;
                        break;
                    case 'cajaBotella':
                        litros = item.cantidad * 24 * 0.355;
                        break;
                    case 'cajaLata':
                        litros = item.cantidad * 24 * 0.355;
                        break;
                    case 'botella':
                        litros = item.cantidad * 0.355;
                        break;
                    case 'lata':
                        litros = item.cantidad * 0.355;
                        break;
                }
                totalVendido += litros;
            });
        }
    });
    
    // Eficiencia
    const eficiencia = totalProducido > 0 ? ((totalEnvasado / totalProducido) * 100).toFixed(1) : 0;
    
    // Actualizar UI
    document.getElementById('reporteTotalProducido').textContent = totalProducido.toFixed(0) + 'L';
    document.getElementById('reporteTotalEnvasado').textContent = totalEnvasado.toFixed(0) + 'L';
    document.getElementById('reporteTotalVendido').textContent = totalVendido.toFixed(0) + 'L';
    document.getElementById('reporteEficiencia').textContent = eficiencia + '%';
    
    // Actualizar PZAS envasadas
    document.getElementById('reporteTotalLatas').textContent = totalLatasEnvasadas.toLocaleString() + ' pzas';
    document.getElementById('reporteTotalBotellas').textContent = totalBotellasEnvasadas.toLocaleString() + ' pzas';
}

function cargarHistorialEnvasado(desde, hasta) {
    const tbody = document.getElementById('historialEnvasadoBody');
    if (!tbody) return;
    
    const envasados = APP_STATE.data.envasado.filter(env => {
        const fecha = new Date(env.fecha);
        return fecha >= desde && fecha <= hasta;
    });
    
    if (envasados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Sin registros en el período seleccionado</td></tr>';
        return;
    }
    
    // Ordenar por fecha descendente
    envasados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    tbody.innerHTML = envasados.map(env => `
        <tr>
            <td>${formatDate(env.fecha)}</td>
            <td>${env.estilo}</td>
            <td>${env.origenNombre || env.origen}</td>
            <td>${getTipoEnvasadoLabel(env.tipo)}</td>
            <td>${env.cantidad}</td>
            <td><strong>${env.litros.toFixed(2)}L</strong></td>
            <td>${getPzasLabel(env.tipo, env.cantidad)}</td>
            <td>${env.usuario}</td>
        </tr>
    `).join('');
}

function getPzasLabel(tipo, cantidad) {
    if (tipo === 'lata' || tipo === 'botella') {
        return `<strong>${cantidad} pzas</strong>`;
    }
    return '-';
}

function getTipoEnvasadoLabel(tipo) {
    const labels = {
        'barril60': 'Barril 60L',
        'barril20': 'Barril 20L',
        'lata': 'Latas 355ml',
        'botella': 'Botellas 355ml'
    };
    return labels[tipo] || tipo;
}

function cargarResumenEstilos(desde, hasta) {
    const tbody = document.getElementById('resumenEstilosBody');
    if (!tbody) return;
    
    const estilos = APP_STATE.data.estilos;
    
    const resumen = estilos.map(estilo => {
        // Litros producidos
        let producido = 0;
        APP_STATE.data.produccion.forEach(prod => {
            const fecha = new Date(prod.fecha);
            if (fecha >= desde && fecha <= hasta) {
                const receta = APP_STATE.data.recetas.find(r => r.nombre === prod.receta || r.id === prod.receta);
                if (receta && receta.estilo === estilo.nombre) {
                    producido += parseFloat(prod.volumen) || 0;
                }
            }
        });
        
        // Litros envasados + PZAS
        let envasado = 0;
        let latasEnvasadas = 0;
        let botellasEnvasadas = 0;
        APP_STATE.data.envasado.forEach(env => {
            const fecha = new Date(env.fecha);
            if (fecha >= desde && fecha <= hasta && env.estilo === estilo.nombre) {
                envasado += parseFloat(env.litros) || 0;
                if (env.tipo === 'lata') {
                    latasEnvasadas += parseInt(env.cantidad) || 0;
                }
                if (env.tipo === 'botella') {
                    botellasEnvasadas += parseInt(env.cantidad) || 0;
                }
            }
        });
        
        // Litros vendidos
        let vendido = 0;
        APP_STATE.data.ventas.forEach(venta => {
            const fecha = new Date(venta.fecha);
            if (fecha >= desde && fecha <= hasta) {
                venta.items.forEach(item => {
                    if (item.estilo === estilo.nombre) {
                        let litros = 0;
                        switch(item.tipo) {
                            case 'barril60':
                                litros = item.cantidad * 60;
                                break;
                            case 'barril20':
                                litros = item.cantidad * 20;
                                break;
                            case 'cajaBotella':
                                litros = item.cantidad * 24 * 0.355;
                                break;
                            case 'cajaLata':
                                litros = item.cantidad * 24 * 0.355;
                                break;
                            case 'botella':
                                litros = item.cantidad * 0.355;
                                break;
                            case 'lata':
                                litros = item.cantidad * 0.355;
                                break;
                        }
                        vendido += litros;
                    }
                });
            }
        });
        
        // Stock actual en litros + PZAS
        const stock = APP_STATE.data.productoTerminado[estilo.nombre];
        let stockLitros = 0;
        let stockLatas = 0;
        let stockBotellas = 0;
        if (stock) {
            stockLitros += (stock.barril60 || 0) * 60;
            stockLitros += (stock.barril20 || 0) * 20;
            stockLitros += (stock.latas || 0) * 0.355;
            stockLitros += (stock.botellas || 0) * 0.355;
            stockLatas = stock.latas || 0;
            stockBotellas = stock.botellas || 0;
        }
        
        // Porcentaje envasado
        const porcentajeEnvasado = producido > 0 ? ((envasado / producido) * 100).toFixed(1) : 0;
        
        return {
            nombre: estilo.nombre,
            producido: producido,
            envasado: envasado,
            vendido: vendido,
            stock: stockLitros,
            latasEnvasadas: latasEnvasadas,
            botellasEnvasadas: botellasEnvasadas,
            stockLatas: stockLatas,
            stockBotellas: stockBotellas,
            porcentaje: porcentajeEnvasado
        };
    });
    
    tbody.innerHTML = resumen.map(res => `
        <tr>
            <td><strong>${res.nombre}</strong></td>
            <td>${res.producido.toFixed(0)}L</td>
            <td>${res.envasado.toFixed(0)}L</td>
            <td>${res.vendido.toFixed(0)}L</td>
            <td>${res.stock.toFixed(0)}L</td>
            <td>
                <div style="font-size: 0.85em;">
                    🥫 ${res.latasEnvasadas} pzas<br>
                    🍾 ${res.botellasEnvasadas} pzas
                </div>
            </td>
            <td>
                <div style="font-size: 0.85em;">
                    🥫 ${res.stockLatas} pzas<br>
                    🍾 ${res.stockBotellas} pzas
                </div>
            </td>
            <td>
                <span class="status-badge ${res.porcentaje >= 80 ? 'ok' : 'bajo'}">
                    ${res.porcentaje}%
                </span>
            </td>
        </tr>
    `).join('');
}

function renderChartLitrosEstilo(desde, hasta) {
    const ctx = document.getElementById('chartLitrosEstilo');
    if (!ctx) return;
    
    const estilos = APP_STATE.data.estilos;
    const labels = [];
    const dataEnvasado = [];
    const colores = [];
    
    estilos.forEach(estilo => {
        let total = 0;
        APP_STATE.data.envasado.forEach(env => {
            const fecha = new Date(env.fecha);
            if (fecha >= desde && fecha <= hasta && env.estilo === estilo.nombre) {
                total += parseFloat(env.litros) || 0;
            }
        });
        
        if (total > 0) {
            labels.push(estilo.nombre);
            dataEnvasado.push(total.toFixed(2));
            colores.push(estilo.color || '#d4af37');
        }
    });
    
    if (chartLitrosEstilo) {
        chartLitrosEstilo.destroy();
    }
    
    chartLitrosEstilo = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Litros Envasados',
                data: dataEnvasado,
                backgroundColor: colores,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.parsed.y + ' Litros';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + 'L';
                        }
                    }
                }
            }
        }
    });
}

function renderChartProduccionEnvasado(desde, hasta) {
    const ctx = document.getElementById('chartProduccionEnvasado');
    if (!ctx) return;
    
    const estilos = APP_STATE.data.estilos;
    const labels = [];
    const dataProducido = [];
    const dataEnvasado = [];
    
    estilos.forEach(estilo => {
        let producido = 0;
        APP_STATE.data.produccion.forEach(prod => {
            const fecha = new Date(prod.fecha);
            if (fecha >= desde && fecha <= hasta) {
                const receta = APP_STATE.data.recetas.find(r => r.nombre === prod.receta || r.id === prod.receta);
                if (receta && receta.estilo === estilo.nombre) {
                    producido += parseFloat(prod.volumen) || 0;
                }
            }
        });
        
        let envasado = 0;
        APP_STATE.data.envasado.forEach(env => {
            const fecha = new Date(env.fecha);
            if (fecha >= desde && fecha <= hasta && env.estilo === estilo.nombre) {
                envasado += parseFloat(env.litros) || 0;
            }
        });
        
        if (producido > 0 || envasado > 0) {
            labels.push(estilo.nombre);
            dataProducido.push(producido.toFixed(2));
            dataEnvasado.push(envasado.toFixed(2));
        }
    });
    
    if (chartProduccionEnvasado) {
        chartProduccionEnvasado.destroy();
    }
    
    chartProduccionEnvasado = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Producido',
                    data: dataProducido,
                    backgroundColor: '#d4af37',
                },
                {
                    label: 'Envasado',
                    data: dataEnvasado,
                    backgroundColor: '#cd853f',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.y + ' Litros';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value + 'L';
                        }
                    }
                }
            }
        }
    });
}
