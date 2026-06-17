import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ShoppingCart,
  Package,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  RefreshCw,
} from 'lucide-react'
import { useApi } from '../../hooks/useApi'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { useCountUp } from '../../hooks/useCountUp'
import { fadeInList, fadeInItem } from '../../lib/motion'

interface DashboardData {
  orders_in_production: number
  orders_delivered_this_month: number
  orders_pending: number
  low_stock_count: number
  monthly_revenue: number
  low_stock_items: any[]
}

interface KpiCardProps {
  label: string
  value: number | string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  iconBg: string
  iconColor: string
  isAlert?: boolean
  isMoney?: boolean
}

function KpiCard({ label, value, icon: Icon, iconBg, iconColor, isAlert, isMoney }: KpiCardProps) {
  const numericValue = typeof value === 'number' ? value : 0
  const animated = useCountUp(typeof value === 'number' ? value : 0, 600)
  const display = isMoney
    ? `$${animated.toLocaleString()}`
    : typeof value === 'number'
    ? animated
    : value

  return (
    <motion.div
      variants={fadeInItem}
      style={{
        background: 'var(--color-surface)',
        border: isAlert ? '1px solid #FCA5A5' : '1px solid var(--color-border)',
        borderLeft: isAlert ? '3px solid #DC2626' : undefined,
        boxShadow: 'var(--shadow-card)',
        borderRadius: 10,
        padding: '20px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'transform 150ms, box-shadow 150ms',
        cursor: 'default',
      }}
      whileHover={{ y: -2, boxShadow: '0 4px 16px rgba(26,29,46,0.10), 0 2px 4px rgba(26,29,46,0.06)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg }}
      >
        {isAlert && numericValue > 0 ? (
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <span className="animate-ping absolute inset-0 rounded-full opacity-40" style={{ background: iconColor }} />
            <Icon className="h-6 w-6 relative" style={{ color: iconColor } as any} />
          </span>
        ) : (
          <Icon className="h-6 w-6" style={{ color: iconColor } as any} />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-label mb-1">{label}</p>
        <p
          className="text-[28px] font-bold leading-none"
          style={{ color: isAlert && numericValue > 0 ? '#DC2626' : 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}
        >
          {display}
        </p>
      </div>
    </motion.div>
  )
}

export function DashboardPage() {
  const { get } = useApi()
  const { data, isLoading, isError, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => get('/api/dashboard'),
  })

  return (
    <div>
      <PageHeader title="Panel de control" subtitle="Resumen general del sistema" />

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-[88px] rounded-[10px]"
              style={{ border: '1px solid var(--color-border)' }}
            >
              <div className="skeleton h-full w-full rounded-[10px]" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#FEF2F2' }}>
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              No se pudieron cargar los datos
            </p>
            <p className="text-caption mt-1">Verifica tu conexión o vuelve a intentarlo</p>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          <motion.div
            variants={fadeInList}
            initial="hidden"
            animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8"
          >
            <KpiCard
              label="Pedidos en producción"
              value={data?.orders_in_production ?? 0}
              icon={ShoppingCart}
              iconBg="#FEF3C7"
              iconColor="#D97706"
            />
            <KpiCard
              label="Entregados este mes"
              value={data?.orders_delivered_this_month ?? 0}
              icon={CheckCircle}
              iconBg="#ECFDF5"
              iconColor="#059669"
            />
            <KpiCard
              label="Pedidos pendientes"
              value={data?.orders_pending ?? 0}
              icon={Clock}
              iconBg={`var(--color-accent-light)`}
              iconColor="var(--color-accent)"
            />
            <KpiCard
              label="Ingresos del mes"
              value={data?.monthly_revenue ?? 0}
              icon={TrendingUp}
              iconBg="#ECFDF5"
              iconColor="#059669"
              isMoney
            />
            <KpiCard
              label="Materiales bajo stock"
              value={data?.low_stock_count ?? 0}
              icon={AlertTriangle}
              iconBg={(data?.low_stock_count ?? 0) > 0 ? '#FEF2F2' : 'var(--color-surface-2)'}
              iconColor={(data?.low_stock_count ?? 0) > 0 ? '#DC2626' : 'var(--color-text-muted)'}
              isAlert={(data?.low_stock_count ?? 0) > 0}
            />
          </motion.div>

          {(data?.low_stock_items?.length ?? 0) > 0 && (
            <div className="max-w-lg">
              <Card
                title="Alertas de stock"
                subtitle="Materiales que requieren reabastecimiento"
                action={
                  <Package className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
                }
              >
                <ul className="space-y-2.5">
                  {data!.low_stock_items.map((item: any) => (
                    <li
                      key={item.material_id}
                      className="flex items-center justify-between"
                      style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}
                    >
                      <span className="text-[14px]" style={{ color: 'var(--color-text-primary)' }}>
                        {item.materials?.name}
                      </span>
                      <span className="text-[13px] font-semibold text-red-600">
                        {item.quantity_available} disp.
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  )
}
