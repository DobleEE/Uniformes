import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeInItem, fadeInList } from '../../lib/motion'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  emptyMessage?: string
  loading?: boolean
  skeletonRows?: number
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <div className="skeleton h-4 rounded" style={{ width: i === 0 ? '60%' : '80%' }} />
        </td>
      ))}
    </tr>
  )
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No hay datos',
  loading,
  skeletonRows = 5,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[14px]">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left py-3 px-4 text-label"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <SkeletonRow key={i} cols={columns.length} />
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-14 text-center text-caption"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <motion.tr
                key={row.id ?? idx}
                variants={fadeInItem}
                initial="hidden"
                animate="visible"
                onClick={() => onRowClick?.(row)}
                style={{ borderBottom: '1px solid var(--color-border)' }}
                className={`transition-colors ${
                  onRowClick
                    ? 'cursor-pointer hover:bg-[var(--color-surface-2)]'
                    : ''
                }`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4" style={{ color: 'var(--color-text-primary)' }}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
