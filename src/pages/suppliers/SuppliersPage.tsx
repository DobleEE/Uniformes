import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, Truck, Phone, Mail, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApi } from '../../hooks/useApi'
import { useToast } from '../../contexts/ToastContext'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { fadeInItem, fadeInList } from '../../lib/motion'

type SupplierForm = { name: string; phone: string; email: string; address: string }
const emptyForm: SupplierForm = { name: '', phone: '', email: '', address: '' }

export function SuppliersPage() {
  const { get, post, put, del } = useApi()
  const queryClient = useQueryClient()
  const toast = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [form, setForm] = useState<SupplierForm>(emptyForm)

  const { data: suppliers = [], isLoading } = useQuery<any[]>({
    queryKey: ['suppliers'],
    queryFn: () => get('/api/suppliers'),
  })

  const createMutation = useMutation({
    mutationFn: (data: SupplierForm) => post('/api/suppliers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      closeModal()
      toast.success('Proveedor creado')
    },
    onError: (err: any) => toast.error(err?.message || 'Error al crear el proveedor'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: SupplierForm) => put(`/api/suppliers/${editingSupplier.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      closeModal()
      toast.success('Proveedor actualizado')
    },
    onError: (err: any) => toast.error(err?.message || 'Error al actualizar'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del(`/api/suppliers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Proveedor eliminado')
    },
    onError: (err: any) => toast.error(err?.message || 'Error al eliminar'),
  })

  function openCreate() {
    setEditingSupplier(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(supplier: any) {
    setEditingSupplier(supplier)
    setForm({
      name: supplier.name,
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
    })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditingSupplier(null)
    setForm(emptyForm)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (editingSupplier) {
      updateMutation.mutate(form)
    } else {
      createMutation.mutate(form)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <PageHeader
        title="Proveedores"
        subtitle={`${suppliers.length} proveedores registrados`}
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo proveedor
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-36 rounded-[10px]" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div
          className="rounded-[10px]"
          style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
        >
          <EmptyState
            icon={Truck}
            title="Sin proveedores registrados"
            description="Agrega el primer proveedor para gestionar órdenes de compra."
            action={
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Nuevo proveedor
              </Button>
            }
          />
        </div>
      ) : (
        <motion.div
          variants={fadeInList}
          initial="hidden"
          animate="visible"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {suppliers.map((s: any) => (
            <motion.div
              key={s.id}
              variants={fadeInItem}
              className="group bg-white rounded-[10px] p-5 transition-all duration-150 hover:-translate-y-px"
              style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--color-accent-light)' }}
                  >
                    <Truck className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {s.name}
                    </h3>
                    {s.purchase_orders_count != null && s.purchase_orders_count > 0 && (
                      <p className="text-caption">{s.purchase_orders_count} OC activas</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(s)}
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    aria-label="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`¿Eliminar a ${s.name}?`)) deleteMutation.mutate(s.id) }}
                    className="p-1.5 rounded-lg transition-colors hover:bg-red-50 hover:text-red-600"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {s.phone && (
                  <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    <Phone className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    <a href={`tel:${s.phone}`} className="hover:text-accent transition-colors truncate">{s.phone}</a>
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    <Mail className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                    <a href={`mailto:${s.email}`} className="hover:text-accent transition-colors truncate">{s.email}</a>
                  </div>
                )}
                {s.address && (
                  <div className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--color-text-secondary)' }}>
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }} />
                    <span className="leading-snug">{s.address}</span>
                  </div>
                )}
                {!s.phone && !s.email && !s.address && (
                  <p className="text-caption italic">Sin información de contacto</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <Modal open={modalOpen} onClose={closeModal} title={editingSupplier ? 'Editar proveedor' : 'Nuevo proveedor'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <Input label="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
            <Button type="submit" loading={isPending}>
              {editingSupplier ? 'Guardar cambios' : 'Crear proveedor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
