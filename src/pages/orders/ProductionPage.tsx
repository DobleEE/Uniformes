import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronRight, CheckSquare, Square, ExternalLink, Wand2, Scissors } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { PasswordConfirmModal } from '../../components/ui/PasswordConfirmModal'
import { EmptyState } from '../../components/ui/EmptyState'
import { fadeInItem, fadeInList } from '../../lib/motion'

const STAGE_COLORS: Record<string, string> = {
  pendiente:   '#9CA3AF',
  por_terminar:'#F59E0B',
  corte:       '#F59E0B',
  costura:     '#6366F1',
  bordado:     '#8B5CF6',
  control_qa:  '#EF4444',
  empaque:     '#10B981',
  terminada:   '#059669',
}

export function ProductionPage() {
  const { get, post, patch } = useApi()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()

  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [selectedPieces, setSelectedPieces] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pwError, setPwError] = useState('')

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ['orders', 'en_produccion'],
    queryFn: () => get('/api/orders?status=en_produccion'),
  })

  const { data: pieces = [], isLoading: piecesLoading } = useQuery<any[]>({
    queryKey: ['pieces', expandedOrder],
    queryFn: () => get(`/api/orders/${expandedOrder}/pieces`),
    enabled: !!expandedOrder,
  })

  const generatePiecesMutation = useMutation({
    mutationFn: (orderId: string) => post(`/api/orders/${orderId}/pieces/generate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieces', expandedOrder] })
      toast.success('Piezas generadas correctamente')
    },
    onError: (err: any) => toast.error(err?.message || 'Error al generar piezas'),
  })

  const changeStatusMutation = useMutation({
    mutationFn: ({ pieceIds, password }: { pieceIds: string[]; password: string }) =>
      Promise.all(
        pieceIds.map((id) => patch(`/api/pieces/${id}/status`, { status: 'terminada', password }))
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pieces', expandedOrder] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setSelectedPieces([])
      setConfirmOpen(false)
      setPwError('')
      toast.success(`${selectedPieces.length} pieza${selectedPieces.length !== 1 ? 's' : ''} marcadas como terminadas`)
    },
    onError: (err: any) => {
      setPwError(err?.message || 'Contraseña incorrecta o sin permisos suficientes')
    },
  })

  const toggleOrder = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
      setSelectedPieces([])
    } else {
      setExpandedOrder(orderId)
      setSelectedPieces([])
    }
  }

  const togglePiece = (id: string) => {
    setSelectedPieces((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const pendingPieces = pieces.filter((p: any) => p.status === 'por_terminar')
  const allPendingSelected = pendingPieces.length > 0 && selectedPieces.length === pendingPieces.length

  const toggleAllPending = () => {
    if (allPendingSelected) {
      setSelectedPieces([])
    } else {
      setSelectedPieces(pendingPieces.map((p: any) => p.id))
    }
  }

  const donePieces = pieces.filter((p: any) => p.status === 'terminada').length
  const progress = pieces.length > 0 ? (donePieces / pieces.length) * 100 : 0

  return (
    <div>
      <PageHeader
        title="Producción"
        subtitle={`${orders.length} pedido${orders.length !== 1 ? 's' : ''} en producción`}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-[10px]" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)', borderRadius: 10 }}>
          <EmptyState
            icon={Scissors}
            title="Sin pedidos en producción"
            description="Cuando un pedido esté en producción, aparecerá aquí."
          />
        </div>
      ) : (
        <motion.div
          variants={fadeInList}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {orders.map((order: any) => {
            const isExpanded = expandedOrder === order.id
            return (
              <motion.div
                key={order.id}
                variants={fadeInItem}
                className="bg-white rounded-[10px] overflow-hidden"
                style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
              >
                {/* Order header row */}
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer transition-colors"
                  style={{ borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none' }}
                  onClick={() => toggleOrder(order.id)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="flex items-center gap-3">
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      {isExpanded
                        ? <ChevronDown className="h-4 w-4" />
                        : <ChevronRight className="h-4 w-4" />
                      }
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[15px]" style={{ color: 'var(--color-text-primary)' }}>
                          {order.clients?.company_name}
                        </span>
                        <span className="text-mono text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <p className="text-caption mt-0.5">
                        {order.order_items
                          ?.map((i: any) => `${i.quantity}× ${i.uniform_type || i.piece_type}`)
                          .join(' · ') || 'Sin ítems'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {order.delivery_date && (
                      <span className="hidden sm:block text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                        Entrega: {new Date(order.delivery_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                    <StatusBadge status={order.status} size="sm" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/pedidos/${order.id}`)
                      }}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-surface-2)'; e.currentTarget.style.color = 'var(--color-accent)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
                      title="Ver detalle del pedido"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded pieces view */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } }}
                      exit={{ height: 0, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-4">
                        {piecesLoading ? (
                          <div className="space-y-2 py-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="skeleton h-12 w-full rounded-lg" />
                            ))}
                          </div>
                        ) : pieces.length === 0 ? (
                          <div className="py-6 flex flex-col items-center gap-3" style={{ color: 'var(--color-text-muted)' }}>
                            <p className="text-[14px]">Sin piezas registradas para este pedido</p>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => generatePiecesMutation.mutate(order.id)}
                              loading={generatePiecesMutation.isPending}
                            >
                              <Wand2 className="h-4 w-4" />
                              Generar piezas
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Progress + actions bar */}
                            <div className="flex items-center justify-between gap-4 flex-wrap">
                              <div className="flex items-center gap-4 text-[13px]">
                                <span style={{ color: 'var(--color-text-secondary)' }}>
                                  <span className="font-semibold text-mono" style={{ color: '#059669' }}>{donePieces}</span>
                                  {' / '}
                                  <span className="font-medium text-mono">{pieces.length}</span>
                                  {' terminadas'}
                                </span>
                                {selectedPieces.length > 0 && (
                                  <span className="font-medium" style={{ color: 'var(--color-accent)' }}>
                                    {selectedPieces.length} seleccionada{selectedPieces.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {pendingPieces.length > 0 && (
                                  <Button size="sm" variant="ghost" onClick={toggleAllPending}>
                                    {allPendingSelected ? 'Deseleccionar todo' : 'Seleccionar pendientes'}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  disabled={selectedPieces.length === 0}
                                  onClick={() => { setPwError(''); setConfirmOpen(true) }}
                                >
                                  <CheckSquare className="h-4 w-4" />
                                  Marcar terminadas ({selectedPieces.length})
                                </Button>
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div
                              className="w-full h-2 rounded-full overflow-hidden"
                              style={{ background: 'var(--color-surface-2)' }}
                            >
                              <motion.div
                                className="h-full rounded-full"
                                style={{ background: '#059669' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                              />
                            </div>

                            {/* Pieces grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                              <AnimatePresence mode="popLayout">
                                {pieces.map((piece: any) => {
                                  const isTerminada = piece.status === 'terminada'
                                  const isSelected = selectedPieces.includes(piece.id)
                                  const stageColor = STAGE_COLORS[piece.status] || '#9CA3AF'

                                  return (
                                    <motion.div
                                      key={piece.id}
                                      layout
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1, transition: { duration: 0.15 } }}
                                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
                                      onClick={() => !isTerminada && togglePiece(piece.id)}
                                      className="flex items-center gap-2.5 p-3 rounded-lg transition-all duration-100"
                                      style={{
                                        border: isTerminada
                                          ? '1px solid #A7F3D0'
                                          : isSelected
                                          ? `1px solid ${stageColor}60`
                                          : '1px solid var(--color-border)',
                                        background: isTerminada
                                          ? '#F0FDF4'
                                          : isSelected
                                          ? `${stageColor}12`
                                          : 'var(--color-surface)',
                                        cursor: isTerminada ? 'default' : 'pointer',
                                        borderLeft: `3px solid ${stageColor}`,
                                      }}
                                    >
                                      {isTerminada ? (
                                        <CheckSquare className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                      ) : isSelected ? (
                                        <CheckSquare className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-accent)' }} />
                                      ) : (
                                        <Square className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-border-strong)' }} />
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <p className="text-[13px] font-semibold text-mono" style={{ color: 'var(--color-text-primary)' }}>
                                          #{piece.piece_number}
                                        </p>
                                        {piece.employee_name && (
                                          <p className="text-caption truncate">{piece.employee_name}</p>
                                        )}
                                        {piece.uniform_type && (
                                          <p className="text-caption truncate">{piece.uniform_type}</p>
                                        )}
                                      </div>
                                      <StatusBadge status={piece.status} size="sm" />
                                    </motion.div>
                                  )
                                })}
                              </AnimatePresence>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      <PasswordConfirmModal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPwError('') }}
        onConfirm={(password) =>
          changeStatusMutation.mutate({ pieceIds: selectedPieces, password })
        }
        title="Confirmar cambio de estado"
        description={`Se marcarán ${selectedPieces.length} pieza${selectedPieces.length !== 1 ? 's' : ''} como terminadas. Requiere autorización del administrador.`}
        confirmLabel="Confirmar terminadas"
        isPending={changeStatusMutation.isPending}
        error={pwError}
      />
    </div>
  )
}
