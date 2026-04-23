// Formatear cantidad en milunidades a moneda
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$0.00'
  // Convertir de milunidades a unidades
  const value = amount / 1000
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

// Formatear número con separadores
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('es-CO').format(num)
}

// Formatear fecha
export function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Formatear fecha y hora
export function formatDateTime(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Calcular días de mora
export function calcularDiasMora(fechaVencimiento) {
  const hoy = new Date()
  const vencimiento = new Date(fechaVencimiento)
  
  hoy.setHours(0, 0, 0, 0)
  vencimiento.setHours(0, 0, 0, 0)
  
  const diffTime = hoy.getTime() - vencimiento.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays > 0 ? diffDays : 0
}

// Formatear porcentaje
export function formatPercentage(value) {
  if (value === null || value === undefined) return '0%'
  return `${value.toFixed(2)}%`
}

// Estado de préstamo con badge
export function getEstadoBadge(estado) {
  const estados = {
    activo: { label: 'Activo', className: 'badge-success' },
    pagado: { label: 'Pagado', className: 'badge-info' },
    mora: { label: 'En Mora', className: 'badge-danger' },
    finalizada: { label: 'Finalizada', className: 'badge-default' }
  }
  
  return estados[estado] || { label: estado, className: 'badge-default' }
}

// Tipo de movimiento
export function getTipoMovimientoLabel(tipo) {
  const tipos = {
    entrega_prestamo: 'Entrega de Préstamo',
    pago_cliente: 'Pago de Cliente',
    recibo_inversion: 'Recibo de Inversión',
    devolucion_inversion: 'Devolución de Inversión'
  }
  
  return tipos[tipo] || tipo
}

// Método de pago
export function getMetodoPagoLabel(metodo) {
  if (!metodo) return '-'
  const metodos = {
    efectivo: 'Efectivo',
    transferencia: 'Transferencia',
    otro: 'Otro'
  }
  return metodos[metodo] || metodo
}
