// ====================================
// DASHBOARD
// ====================================

let chartProductos = null;
let chartTanques = null;

function updateDashboard() {
    // Actualizar estadísticas
    updateStats();
    
    // Actualizar gráficas
    updateCharts();
}

function updateStats() {
    // Contar materias primas con stock bajo
    const materiasBajas = APP_STATE.data.materiasPrimas.filter(m => m.stock <= m.minimo).length;
    document.getElementById('statMateriasPrimas').textContent = materiasBajas;
    
    // Contar tanques ocupados
    const tanquesOcupados = APP_STATE.data.unitanques.filter(t => t.ocupado).length;
    document.getElementById('statTanques').textContent = tanquesOcupados;
    
    // Contar productos listos (tipos diferentes con stock)
    let productosListos = 0;
    Object.values(APP_STATE.data.productoTerminado).forEach(prod => {
        if (prod.barril60 > 0) productosListos++;
        if (prod.barril20 > 0) productosListos++;
        if (prod.latas > 0) productosListos++;
        if (prod.botellas > 0) productosListos++;
    });
    document.getElementById('statProducto').textContent = productosListos;
    
    // Contar pedidos pendientes
    const pedidosPendientes = APP_STATE.data.pedidos.filter(p => 
        p.estado === 'pendiente' || p.estado === 'preparando'
    ).length;
    document.getElementById('statPedidos').textContent = pedidosPendientes;
}

function updateCharts() {
    updateProductosChart();
    updateTanquesChart();
}

function updateProductosChart() {
    const ctx = document.getElementById('chartProductos');
    if (!ctx) return;
    
    // Preparar datos
    const labels = [];
    const barriles60 = [];
    const barriles20 = [];
    const latas = [];
    const botellas = [];
    
    Object.entries(APP_STATE.data.productoTerminado).forEach(([estilo, prod]) => {
        labels.push(estilo);
        barriles60.push(prod.barril60 || 0);
        barriles20.push(prod.barril20 || 0);
        latas.push(Math.floor((prod.latas || 0) / 24)); // Convertir a cajas
        botellas.push(Math.floor((prod.botellas || 0) / 24)); // Convertir a cajas
    });
    
    if (chartProductos) {
        chartProductos.destroy();
    }
    
    chartProductos = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Barriles 60L',
                    data: barriles60,
                    backgroundColor: '#d4af37',
                },
                {
                    label: 'Barriles 20L',
                    data: barriles20,
                    backgroundColor: '#cd853f',
                },
                {
                    label: 'Cajas de Lata',
                    data: latas,
                    backgroundColor: '#b8860b',
                },
                {
                    label: 'Cajas de Botella',
                    data: botellas,
                    backgroundColor: '#8b7355',
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateTanquesChart() {
    const ctx = document.getElementById('chartTanques');
    if (!ctx) return;
    
    // Calcular capacidad total y ocupada
    let capacidadTotal = 0;
    let capacidadOcupada = 0;
    
    APP_STATE.data.unitanques.forEach(tanque => {
        capacidadTotal += tanque.capacidad;
        if (tanque.ocupado) {
            capacidadOcupada += tanque.volumen;
        }
    });
    
    const capacidadLibre = capacidadTotal - capacidadOcupada;
    
    if (chartTanques) {
        chartTanques.destroy();
    }
    
    chartTanques = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Ocupado', 'Libre'],
            datasets: [{
                data: [capacidadOcupada, capacidadLibre],
                backgroundColor: [
                    '#d4af37',
                    '#e9ecef'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
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
                            return context.label + ': ' + context.parsed + 'L';
                        }
                    }
                }
            }
        }
    });
}
