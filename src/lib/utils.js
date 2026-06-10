// Formatear cantidad en milunidades a moneda
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '$ 0'
  // Convertir de milunidades a unidades
  const value = amount / 1000
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Formatear número con separadores
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return new Intl.NumberFormat('es-CO').format(num)
}

// Limpiar formato de puntos (1.000.000 -> 1000000)
export function parseNumber(value) {
  if (!value) return 0;
  return parseFloat(value.toString().replace(/\./g, '').replace(/,/g, '')) || 0;
}

// Formatear para input mientras se escribe
export function formatInputNumber(value) {
  if (value === null || value === undefined || value === '') return '';
  const cleanValue = value.toString().replace(/\D/g, '');
  return new Intl.NumberFormat('es-CO').format(cleanValue);
}

// Formatear fecha (trata la fecha como local, no UTC)
export function formatDate(date) {
  if (!date) return '-'
  // Si es string YYYY-MM-DD, parsear manualmente para evitar problemas de timezone
  if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
  }
  const d = new Date(date)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
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
    devolucion_inversion: 'Devolución de Inversión',
    ganancia_interes: 'Ganancia de Interés'
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
