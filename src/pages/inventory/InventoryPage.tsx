import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Plus, TrendingDown, TrendingUp, RefreshCw, Search, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Modal } from '../../components/ui/Modal'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { EmptyState } from '../../components/ui/EmptyState'
import { fadeInItem } from '../../lib/motion'

interface EntryForm {
  material_id: string
  quantity: string
  type: 'entrada' | 'salida' | 'ajuste'
  order_id: string
  notes: string
}

type EntryTypeFilter = 'all' | 'entrada' | 'salida' | 'ajuste'

function StockBar({ available, minStock }: { available: number; minStock: number | null }) {
  if (!minStock || minStock === 0) return null
  const ratio = available / minStock
  const pct = Math.min(ratio * 50, 100)
  const color = ratio < 1 ? '#DC2626' : ratio < 2 ? '#D97706' : '#059669'
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

const typeFilterOptions: { key: EntryTypeFilter; label: string }[] = [
  { key: 'all',     label: 'Todos' },
  { key: 'entrada', label: 'Entradas' },
  { key: 'salida',  label: 'Salidas' },
  { key: 'ajuste',  label: 'Ajustes' },
]

export function InventoryPage() {
  const { get, post } = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [selectedFabric, setSelectedFabric] = useState<string | null>(null)
  const [entryModal, setEntryModal] = useState(false)
  const [form, setForm] = useState<EntryForm>({
    material_id: '',
    quantity: '',
    type: 'entrada',
    order_id: '',
    notes: '',
  })
  const [fabricSearch, setFabricSearch] = useState('')
  const [entryTypeFilter, setEntryTypeFilter] = useState<EntryTypeFilter>('all')

  const { data: inventory = [], isLoading } = useQuery<any[]>({
    queryKey: ['inventory'],
    queryFn: () => get('/api/inventory'),
  })

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ['orders', 'activos'],
    queryFn: () => get('/api/orders?exclude_status=cancelado,entregado'),
  })

  const { data: entries = [], isLoading: entriesLoading } = useQuery<any[]>({
    queryKey: ['inventory-entries'],
    queryFn: () => get('/api/inventory/entries?limit=200'),
  })

  const createEntry = useMutation({
    mutationFn: (data: any) =>
      post('/api/inventory/entries', {
        material_id: data.material_id,
        quantity: Number(data.quantity),
        order_id: data.order_id || null,
        notes: data.notes || null,
        type: data.type || 'entrada',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory-entries'] })
      setEntryModal(false)
      setForm({ material_id: '', quantity: '', type: 'entrada', order_id: '', notes: '' })
      toast.success('Movimiento registrado')
    },
    onError: (err: any) => toast.error(err?.message || 'Error al registrar el movimiento'),
  })

  // Agrupar inventario por nombre de tela
  const fabricGroups = useMemo(() => {
    const groups: Record<string, any[]> = {}
    for (const row of inventory) {
      const name = row.materials?.name || 'Sin nombre'
      if (!groups[name]) groups[name] = []
      groups[name].push(row)
    }
    return groups
  }, [inventory])

  const fabricNames = useMemo(() => Object.keys(fabricGroups).sort(), [fabricGroups])

  // Auto-seleccionar primera tela al cargar
  useEffect(() => {
    if (fabricNames.length > 0 && !selectedFabric) {
      setSelectedFabric(fabricNames[0])
    }
  }, [fabricNames, selectedFabric])

  const filteredFabricNames = fabricSearch.trim()
    ? fabricNames.filter((name) => name.toLowerCase().includes(fabricSearch.toLowerCase()))
    : fabricNames

  const selectedVariants = selectedFabric ? (fabricGroups[selectedFabric] || []) : []

  const selectedMaterialIds = useMemo(
    () => new Set(selectedVariants.map((v: any) => v.material_id)),
    [selectedVariants]
  )

  const fabricEntries = useMemo(() => {
    const byType = entryTypeFilter === 'all'
      ? entries
      : entries.filter((e: any) => e.type === entryTypeFilter)
    return byType.filter((e: any) =>
      selectedMaterialIds.has(e.material_id) ||
      e.materials?.name === selectedFabric ||
      (e.material_name && selectedFabric && e.material_name.startsWith(selectedFabric))
    )
  }, [entries, entryTypeFilter, selectedMaterialIds, selectedFabric])

  const openEntry = (materialId?: string) => {
    setForm({ material_id: materialId || '', quantity: '', type: 'entrada', order_id: '', notes: '' })
    setEntryModal(true)
  }

  const qtyBg =
    form.type === 'salida'
      ? 'rgba(220,38,38,0.06)'
      : form.type === 'entrada'
      ? 'rgba(5,150,105,0.06)'
      : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario de telas"
        subtitle={`${fabricNames.length} tipos de tela · ${inventory.length} variantes`}
      />

      {/* Panel de dos columnas */}
      <div
        className="bg-white rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <div className="grid lg:grid-cols-[280px_1fr]">

          {/* Columna izquierda — lista de telas */}
          <div
            className="lg:border-r"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div className="p-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
                  style={{ color: 'var(--color-text-muted)' }}
                />
                <input
                  type="text"
                  value={fabricSearch}
                  onChange={(e) => setFabricSearch(e.target.value)}
                  placeholder="Buscar tela..."
                  className="w-full h-9 pl-9 pr-3 rounded-lg text-[13px] border outline-none transition-all"
                  style={{
                    borderColor: 'var(--color-border-strong)',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="p-3 space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton h-11 rounded" />
                ))}
              </div>
            ) : filteredFabricNames.length === 0 ? (
              <div className="p-6 text-center text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                Sin resultados
              </div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: 560 }}>
                {filteredFabricNames.map((name) => {
                  const variants = fabricGroups[name] || []
                  const hasLow = variants.some((v: any) => v.low_stock)
                  const isSelected = selectedFabric === name
                  return (
                    <button
                      key={name}
                      onClick={() => setSelectedFabric(name)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                      style={{
                        background: isSelected ? 'rgba(79,82,214,0.07)' : undefined,
                        borderBottom: '1px solid var(--color-border)',
                        borderLeft: isSelected
                          ? '3px solid var(--color-accent)'
                          : '3px solid transparent',
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {hasLow && (
                          <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                        )}
                        <span
                          className="text-[14px] font-medium truncate"
                          style={{
                            color: isSelected
                              ? 'var(--color-accent)'
                              : 'var(--color-text-primary)',
                          }}
                        >
                          {name}
                        </span>
                      </div>
                      <span
                        className="text-[12px] flex-shrink-0 ml-2"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {variants.length} {variants.length === 1 ? 'color' : 'colores'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Columna derecha — variantes + historial */}
          <div>
            {!selectedFabric ? (
              <div className="p-12">
                <EmptyState
                  icon={Package}
                  title="Selecciona una tela"
                  description="Elige un tipo de tela de la lista para ver sus variantes y movimientos."
                />
              </div>
            ) : (
              <>
                {/* Cabecera */}
                <div
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <div>
                    <span
                      className="text-[15px] font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {selectedFabric}
                    </span>
                    <span
                      className="text-[13px] font-normal ml-2"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {selectedVariants.length}{' '}
                      {selectedVariants.length === 1 ? 'variante' : 'variantes'}
                    </span>
                  </div>
                  <Button size="sm" onClick={() => openEntry(selectedVariants[0]?.material_id)}>
                    <Plus className="h-3.5 w-3.5" /> Movimiento
                  </Button>
                </div>

                {/* Tabla de variantes */}
                <div className="overflow-x-auto">
                  <table className="w-full text-[14px]">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                        {['Color / variante', 'Disponible', 'Stock mín.', 'Nivel', 'Estado', ''].map((h) => (
                          <th key={h} className="text-left py-3 px-4 text-label">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedVariants.map((row: any, idx: number) => {
                        const isLow = row.low_stock
                        return (
                          <motion.tr
                            key={row.material_id ?? idx}
                            variants={fadeInItem}
                            initial="hidden"
                            animate="visible"
                            style={{
                              borderBottom: '1px solid var(--color-border)',
                              background: isLow ? 'rgba(220,38,38,0.03)' : undefined,
                            }}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {isLow && (
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />
                                )}
                                <span
                                  className="font-medium"
                                  style={{ color: 'var(--color-text-primary)' }}
                                >
                                  {row.materials?.color || '—'}
                                </span>
                                {row.materials?.fabric_type && (
                                  <span className="text-caption">
                                    {row.materials.fabric_type === 'temporada'
                                      ? `· ${row.materials.season ?? ''}${row.materials.season_year ?? ''}`
                                      : '· Línea'}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className="text-mono font-semibold"
                                style={{ color: isLow ? '#DC2626' : 'var(--color-text-primary)' }}
                              >
                                {row.quantity_available} {row.materials?.unit}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-caption">
                              {row.materials?.min_stock != null
                                ? `${row.materials.min_stock} ${row.materials?.unit}`
                                : '—'}
                            </td>
                            <td className="py-3 px-4 w-24">
                              <StockBar
                                available={row.quantity_available}
                                minStock={row.materials?.min_stock}
                              />
                            </td>
                            <td className="py-3 px-4">
                              {isLow ? (
                                <span
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full"
                                  style={{ background: '#FEF2F2', color: '#DC2626' }}
                                >
                                  <AlertTriangle className="h-3 w-3" /> Stock bajo
                                </span>
                              ) : (
                                <span
                                  className="inline-flex text-[11px] font-semibold px-2 py-1 rounded-full"
                                  style={{ background: '#ECFDF5', color: '#059669' }}
                                >
                                  OK
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <button
                                onClick={() => openEntry(row.material_id)}
                                className="inline-flex items-center gap-1 text-[12px] font-medium transition-colors"
                                style={{ color: 'var(--color-accent)' }}
                              >
                                <Plus className="h-3.5 w-3.5" /> Entrada
                              </button>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Historial de movimientos de esta tela */}
                <div style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2">
                    <h4
                      className="text-[13px] font-semibold"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      Historial de movimientos
                    </h4>
                    <div className="flex gap-1.5">
                      {typeFilterOptions.map(({ key, label }) => (
                        <button
                          key={key}
                          onClick={() => setEntryTypeFilter(key)}
                          className="h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors"
                          style={
                            entryTypeFilter === key
                              ? { background: 'var(--color-accent)', color: '#fff' }
                              : {
                                  background: 'var(--color-surface-2)',
                                  color: 'var(--color-text-secondary)',
                                }
                          }
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {entriesLoading ? (
                    <div className="p-4 space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-9 rounded" />
                      ))}
                    </div>
                  ) : fabricEntries.length === 0 ? (
                    <div className="px-5 pb-5">
                      <EmptyState
                        icon={RefreshCw}
                        title="Sin movimientos"
                        description={
                          entryTypeFilter !== 'all'
                            ? `No hay movimientos de tipo "${entryTypeFilter}" para esta tela.`
                            : 'Aún no se han registrado movimientos para esta tela.'
                        }
                      />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[14px]">
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                            {['Fecha', 'Color / variante', 'Cantidad', 'Tipo', 'Para pedido', 'Notas'].map(
                              (h) => (
                                <th key={h} className="text-left py-2.5 px-4 text-label">
                                  {h}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {fabricEntries.map((r: any, idx: number) => {
                            const isSalida = r.type === 'salida'
                            const isAjuste = r.type === 'ajuste'
                            return (
                              <motion.tr
                                key={r.id ?? idx}
                                variants={fadeInItem}
                                initial="hidden"
                                animate="visible"
                                style={{ borderBottom: '1px solid var(--color-border)' }}
                              >
                                <td className="py-2.5 px-4 text-caption">
                                  {new Date(r.created_at).toLocaleDateString('es-MX', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </td>
                                <td className="py-2.5 px-4 text-caption">
                                  {r.materials?.color || r.material_name || '—'}
                                </td>
                                <td className="py-2.5 px-4">
                                  <span
                                    className="inline-flex items-center gap-1 font-semibold text-mono"
                                    style={{
                                      color: isSalida ? '#DC2626' : isAjuste ? '#D97706' : '#059669',
                                    }}
                                  >
                                    {isSalida ? (
                                      <TrendingDown className="h-3.5 w-3.5" />
                                    ) : isAjuste ? (
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    ) : (
                                      <TrendingUp className="h-3.5 w-3.5" />
                                    )}
                                    {isSalida ? '-' : '+'}
                                    {Math.abs(r.quantity)} {r.unit || r.materials?.unit}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4">
                                  <StatusBadge status={r.type || 'entrada'} size="sm" />
                                </td>
                                <td className="py-2.5 px-4 text-caption">
                                  {r.order_client || r.orders?.clients?.company_name || '—'}
                                </td>
                                <td className="py-2.5 px-4 text-caption">{r.notes || '—'}</td>
                              </motion.tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal: registrar movimiento */}
      <Modal
        open={entryModal}
        onClose={() => setEntryModal(false)}
        title="Registrar movimiento de inventario"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createEntry.mutate(form)
          }}
          className="space-y-4"
        >
          <Select
            label="Tipo de movimiento *"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as EntryForm['type'] })}
            options={[
              { value: 'entrada', label: 'Entrada — ingreso de tela al almacén' },
              { value: 'salida',  label: 'Salida — uso o baja de tela' },
              { value: 'ajuste',  label: 'Ajuste — corrección de stock' },
            ]}
          />

          <div>
            <label
              className="block text-[13px] font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Tela *
            </label>
            <select
              required
              value={form.material_id}
              onChange={(e) => setForm({ ...form, material_id: e.target.value })}
              className="w-full h-10 px-3 border rounded-lg text-[14px] bg-white outline-none transition-all border-[var(--color-border-strong)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,82,214,0.12)]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <option value="">Seleccionar tela...</option>
              {fabricNames.map((name) =>
                (fabricGroups[name] || []).map((item: any) => (
                  <option key={item.material_id} value={item.material_id}>
                    {item.materials?.name}
                    {item.materials?.color ? ` · ${item.materials.color}` : ''}
                    {item.materials?.fabric_type === 'temporada'
                      ? ` · ${item.materials.season ?? ''}${item.materials.season_year ?? ''}`
                      : item.materials?.fabric_type === 'linea'
                      ? ' · Línea'
                      : ''}
                    {' '}({item.quantity_available} {item.materials?.unit} disponibles)
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              className="block text-[13px] font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {form.type === 'salida'
                ? 'Cantidad a retirar *'
                : form.type === 'ajuste'
                ? 'Cantidad * (positivo suma, negativo resta)'
                : 'Cantidad a ingresar *'}
            </label>
            <input
              type="number"
              min={form.type === 'ajuste' ? undefined : '0.01'}
              step="any"
              required
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              placeholder="Ej: 50"
              className="w-full h-10 px-3 border rounded-lg text-[14px] text-mono outline-none transition-all border-[var(--color-border-strong)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,82,214,0.12)]"
              style={{ background: qtyBg ?? 'white', color: 'var(--color-text-primary)' }}
            />
          </div>

          <div>
            <label
              className="block text-[13px] font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Pedido relacionado (opcional)
            </label>
            <select
              value={form.order_id}
              onChange={(e) => setForm({ ...form, order_id: e.target.value })}
              className="w-full h-10 px-3 border rounded-lg text-[14px] bg-white outline-none transition-all border-[var(--color-border-strong)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,82,214,0.12)]"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <option value="">Sin pedido específico</option>
              {orders.map((order: any) => (
                <option key={order.id} value={order.id}>
                  {order.clients?.company_name} — #{order.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Ej: Factura #123, proveedor Textiles SA"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEntryModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={createEntry.isPending}>
              Registrar movimiento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
