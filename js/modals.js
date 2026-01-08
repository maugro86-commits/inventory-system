// ====================================
// MODALS - Funciones auxiliares
// ====================================

// Las funciones de modales están distribuidas en cada módulo específico
// Este archivo contiene funciones auxiliares generales

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => modal.remove());
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Cerrar modal al hacer clic en el overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});
