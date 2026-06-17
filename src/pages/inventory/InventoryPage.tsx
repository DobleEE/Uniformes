import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Plus, PackagePlus, TrendingDown, TrendingUp, RefreshCw, Search, Package } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
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

export function InventoryPage() {
  const { get, post } = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [entryModal, setEntryModal] = useState(false)
  const [form, setForm] = useState<EntryForm>({
    material_id: '',
    quantity: '',
    type: 'entrada',
    order_id: '',
    notes: '',
  })
  const [stockSearch, setStockSearch] = useState('')
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
    queryFn: () => get('/api/inventory/entries?limit=100'),
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

  const openEntry = (materialId?: string) => {
    setForm({ material_id: materialId || '', quantity: '', type: 'entrada', order_id: '', notes: '' })
    setEntryModal(true)
  }

  const filteredInventory = stockSearch.trim()
    ? inventory.filter((row: any) =>
        row.materials?.name?.toLowerCase().includes(stockSearch.toLowerCase()) ||
        row.materials?.category?.toLowerCase().includes(stockSearch.toLowerCase())
      )
    : inventory

  const filteredEntries = entryTypeFilter === 'all'
    ? entries
    : entries.filter((e: any) => e.type === entryTypeFilter)

  const typeFilterOptions: { key: EntryTypeFilter; label: string }[] = [
    { key: 'all',     label: 'Todos' },
    { key: 'entrada', label: 'Entradas' },
    { key: 'salida',  label: 'Salidas' },
    { key: 'ajuste',  label: 'Ajustes' },
  ]

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
        subtitle={`${inventory.length} telas en stock`}
        action={
          <Button onClick={() => openEntry()}>
            <PackagePlus className="h-4 w-4" />
            Registrar movimiento
          </Button>
        }
      />

      {/* Stock levels */}
      <Card title="Stock de telas">
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          <input
            type="text"
            value={stockSearch}
            onChange={(e) => setStockSearch(e.target.value)}
            placeholder="Buscar por nombre o categoría..."
            className="w-full h-10 pl-9 pr-3 border rounded-lg text-[14px] bg-white outline-none transition-all border-[var(--color-border-strong)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,82,214,0.12)]"
            style={{ color: 'var(--color-text-primary)' }}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded" />
            ))}
          </div>
        ) : filteredInventory.length === 0 ? (
          <EmptyState
            icon={Package}
            title={stockSearch ? 'Sin resultados' : 'Sin telas registradas'}
            description={stockSearch ? 'Ninguna tela coincide con la búsqueda.' : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Material', 'Categoría', 'Disponible', 'Stock mín.', 'Nivel', 'Estado', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-label">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((row: any, idx: number) => {
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
                          {isLow && <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                            {row.materials?.name}
                          </span>
                          {row.materials?.color && (
                            <span className="text-caption">· {row.materials.color}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-caption">{row.materials?.category || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="text-mono font-semibold" style={{ color: isLow ? '#DC2626' : 'var(--color-text-primary)' }}>
                          {row.quantity_available} {row.materials?.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-caption">
                        {row.materials?.min_stock != null ? `${row.materials.min_stock} ${row.materials?.unit}` : '-'}
                      </td>
                      <td className="py-3 px-4 w-24">
                        <StockBar available={row.quantity_available} minStock={row.materials?.min_stock} />
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                            <AlertTriangle className="h-3 w-3" /> Stock bajo
                          </span>
                        ) : (
                          <span className="inline-flex text-[11px] font-semibold px-2 py-1 rounded-full" style={{ background: '#ECFDF5', color: '#059669' }}>
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
        )}
      </Card>

      {/* Movement history */}
      <Card title="Historial de movimientos">
        <div className="flex gap-2 mb-5 flex-wrap">
          {typeFilterOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setEntryTypeFilter(key)}
              className="h-8 px-3 rounded-full text-[12px] font-medium transition-colors"
              style={
                entryTypeFilter === key
                  ? { background: 'var(--color-accent)', color: '#fff' }
                  : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)' }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {entriesLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-10 w-full rounded" />
            ))}
          </div>
        ) : filteredEntries.length === 0 ? (
          <EmptyState
            icon={RefreshCw}
            title="Sin movimientos"
            description={entryTypeFilter !== 'all' ? `No hay movimientos de tipo "${entryTypeFilter}".` : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  {['Fecha', 'Material', 'Cantidad', 'Tipo', 'Para pedido', 'Notas'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-label">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((r: any, idx: number) => {
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
                      <td className="py-3 px-4 text-caption">
                        {new Date(r.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4 font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {r.material_name || r.materials?.name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-1 font-semibold text-mono"
                          style={{ color: isSalida ? '#DC2626' : isAjuste ? '#D97706' : '#059669' }}
                        >
                          {isSalida ? <TrendingDown className="h-3.5 w-3.5" /> : isAjuste ? <RefreshCw className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                          {isSalida ? '-' : '+'}{Math.abs(r.quantity)} {r.unit || r.materials?.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.type || 'entrada'} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-caption">
                        {r.order_client || r.orders?.clients?.company_name || '—'}
                      </td>
                      <td className="py-3 px-4 text-caption">{r.notes || '—'}</td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Register movement modal */}
      <Modal open={entryModal} onClose={() => setEntryModal(false)} title="Registrar movimiento de inventario">
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
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
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
              {inventory.map((item: any) => (
                <option key={item.material_id} value={item.material_id}>
                  {item.materials?.name}
                  {item.materials?.fabric_type === 'temporada'
                    ? ` · ${item.materials.season}${item.materials.season_year}`
                    : item.materials?.fabric_type === 'linea' ? ' · Línea' : ''}
                  {' '}({item.quantity_available} {item.materials?.unit} disponibles)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
              {form.type === 'salida' ? 'Cantidad a retirar *' : form.type === 'ajuste' ? 'Cantidad * (positivo suma, negativo resta)' : 'Cantidad a ingresar *'}
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
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
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
