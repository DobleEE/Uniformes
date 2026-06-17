const ORDER_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  cotizacion:      { color: '#6B7280', label: 'Cotización' },
  aprobado:        { color: '#4F52D6', label: 'Aprobado' },
  anticipo_pagado: { color: '#7C3AED', label: 'Anticipo pagado' },
  en_produccion:   { color: '#D97706', label: 'En producción' },
  terminado:       { color: '#059669', label: 'Terminado' },
  entregado:       { color: '#0D9E6B', label: 'Entregado' },
  cancelado:       { color: '#DC2626', label: 'Cancelado' },
  cancelada:       { color: '#DC2626', label: 'Cancelada' },
}

const PIECE_STAGE_CONFIG: Record<string, { color: string; label: string }> = {
  pendiente:   { color: '#9CA3AF', label: 'Pendiente' },
  por_terminar:{ color: '#F59E0B', label: 'Por terminar' },
  corte:       { color: '#F59E0B', label: 'Corte' },
  costura:     { color: '#6366F1', label: 'Costura' },
  bordado:     { color: '#8B5CF6', label: 'Bordado' },
  control_qa:  { color: '#EF4444', label: 'Control QA' },
  empaque:     { color: '#10B981', label: 'Empaque' },
  terminada:   { color: '#059669', label: 'Terminada' },
  // inventory / OC states
  enviada:     { color: '#4F52D6', label: 'Enviada' },
  recibida:    { color: '#059669', label: 'Recibida' },
  entrada:     { color: '#059669', label: 'Entrada' },
  ajuste:      { color: '#6B7280', label: 'Ajuste' },
  nueva:       { color: '#D97706', label: 'Nueva' },
}

const ALL_CONFIG = { ...ORDER_STATUS_CONFIG, ...PIECE_STAGE_CONFIG }

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = ALL_CONFIG[status] || { color: '#6B7280', label: status }
  const isPulsing = status === 'en_produccion'

  const dotSize = size === 'sm' ? 6 : 7
  const padding = size === 'sm' ? '2px 8px' : '3px 10px'
  const fontSize = size === 'sm' ? 11 : 12

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding,
        borderRadius: 9999,
        background: `${config.color}18`,
        border: `1px solid ${config.color}40`,
        fontSize,
        fontWeight: 500,
        color: config.color,
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex', width: dotSize, height: dotSize }}>
        {isPulsing && (
          <span
            className="animate-ping"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: config.color,
              opacity: 0.4,
            }}
          />
        )}
        <span
          style={{
            position: 'relative',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: config.color,
            flexShrink: 0,
          }}
        />
      </span>
      {config.label}
    </span>
  )
}

/* Backward-compat alias so existing Badge imports keep working */
export function Badge({ status }: { status: string }) {
  return <StatusBadge status={status} />
}
