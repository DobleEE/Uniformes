import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, ShoppingCart, X } from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/layout/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Table } from '../../components/ui/Table'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'

const STATUS_FILTERS = [
  { value: 'cotizacion',      label: 'Cotización',     color: '#6B7280' },
  { value: 'aprobado',        label: 'Aprobado',       color: '#4F52D6' },
  { value: 'anticipo_pagado', label: 'Anticipo pagado',color: '#7C3AED' },
  { value: 'en_produccion',   label: 'En producción',  color: '#D97706' },
  { value: 'terminado',       label: 'Terminado',      color: '#059669' },
  { value: 'entregado',       label: 'Entregado',      color: '#0D9E6B' },
  { value: 'cancelado',       label: 'Pausado',        color: '#D97706' },
]

export function OrdersPage() {
  const { get, post } = useApi()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ client_id: '', delivery_date: '', notes: '' })

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ['orders', statusFilter],
    queryFn: () =>
      get(`/api/orders${statusFilter ? `?status=${statusFilter}` : ''}`),
  })

  const { data: clients = [] } = useQuery<any[]>({
    queryKey: ['clients'],
    queryFn: () => get('/api/clients'),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => post('/api/orders', data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setModalOpen(false)
      toast.success('Pedido creado correctamente')
      navigate(`/pedidos/${data.id}`)
    },
    onError: (err: any) => toast.error(err?.message || 'Error al crear el pedido'),
  })

  const filtered = orders.filter(
    (o: any) =>
      o.clients?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search)
  )

  return (
    <div>
      <PageHeader
        title="Pedidos"
        subtitle={`${orders.length} pedidos en total`}
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuevo pedido
          </Button>
        }
      />

      <Card>
        {/* Barra de búsqueda */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--color-text-muted)' }}
            />
            <input
              type="text"
              placeholder="Buscar por empresa o ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 border rounded-lg text-[14px] bg-white outline-none transition-all border-[var(--color-border-strong)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,82,214,0.12)]"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
        </div>

        {/* Pills de estado */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setStatusFilter('')}
            className="inline-flex items-center h-8 px-3 rounded-full text-[12px] font-medium transition-all duration-100"
            style={
              statusFilter === ''
                ? { background: 'var(--color-text-primary)', color: '#fff', border: '1px solid transparent' }
                : { background: 'var(--color-surface-2)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }
            }
          >
            Todos
          </button>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(statusFilter === s.value ? '' : s.value)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium transition-all duration-100"
              style={
                statusFilter === s.value
                  ? { background: s.color, color: '#fff', border: `1px solid transparent` }
                  : { background: `${s.color}14`, color: s.color, border: `1px solid ${s.color}40` }
              }
            >
              {s.label}
              {statusFilter === s.value && (
                <X className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>

        {filtered.length === 0 && !isLoading ? (
          <EmptyState
            icon={ShoppingCart}
            title="No hay pedidos"
            description={
              search || statusFilter
                ? 'Ningún pedido coincide con los filtros aplicados.'
                : 'Crea el primer pedido para empezar.'
            }
            action={
              (search || statusFilter) ? (
                <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setStatusFilter('') }}>
                  Limpiar filtros
                </Button>
              ) : (
                <Button size="sm" onClick={() => setModalOpen(true)}>
                  <Plus className="h-4 w-4" /> Nuevo pedido
                </Button>
              )
            }
          />
        ) : (
          <Table
            loading={isLoading}
            columns={[
              {
                key: 'id',
                header: 'Folio',
                render: (row: any) => (
                  <span className="text-mono text-[12px]" style={{ color: 'var(--color-text-secondary)' }}>
                    {row.id.slice(0, 8).toUpperCase()}
                  </span>
                ),
              },
              {
                key: 'client',
                header: 'Cliente',
                render: (row: any) => (
                  <span className="font-medium text-[14px]">
                    {row.clients?.company_name || '-'}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Estado',
                render: (row: any) => <StatusBadge status={row.status} />,
              },
              {
                key: 'total_price',
                header: 'Total',
                render: (row: any) => (
                  <span className="text-mono font-medium">
                    ${Number(row.total_price).toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'advance_payment',
                header: 'Anticipo',
                render: (row: any) => (
                  <span className="text-mono text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    ${Number(row.advance_payment).toLocaleString()}
                  </span>
                ),
              },
              {
                key: 'items',
                header: 'Ítems',
                render: (row: any) => (
                  <span className="text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    {row.order_items?.length || 0}
                  </span>
                ),
              },
              {
                key: 'created_at',
                header: 'Fecha',
                render: (row: any) => (
                  <span className="text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    {new Date(row.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </span>
                ),
              },
            ]}
            data={filtered}
            onRowClick={(row: any) => navigate(`/pedidos/${row.id}`)}
          />
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo pedido">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createMutation.mutate(form)
          }}
          className="space-y-4"
        >
          <Select
            label="Cliente *"
            options={clients.map((c: any) => ({
              value: c.id,
              label: c.company_name,
            }))}
            value={form.client_id}
            onChange={(e) => setForm({ ...form, client_id: e.target.value })}
            required
          />
          <Input
            label="Fecha de entrega"
            type="date"
            value={form.delivery_date}
            onChange={(e) => setForm({ ...form, delivery_date: e.target.value })}
          />
          <div>
            <label
              className="block text-[13px] font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-[14px] bg-white outline-none transition-all border-[var(--color-border-strong)] focus:border-accent focus:shadow-[0_0_0_3px_rgba(79,82,214,0.12)] resize-none"
              style={{ color: 'var(--color-text-primary)' }}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Crear pedido
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
