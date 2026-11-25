import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useDebouncedValue } from '../../shared/forms/use-field-errors'
import { Tooltip } from './tooltip'

const DEFAULT_NO_PERMISSION_MESSAGE = 'Você não tem permissão para esta ação.'

export type EntityRow = Record<string, string | boolean | null>
export type EntityColumn = {
  id: string
  header: string
  accessor: (row: EntityRow) => string | boolean | null
  cell: (row: EntityRow) => ReactNode
}

type EntityListProps = {
  title: string
  description: string
  createLabel: string
  columns: EntityColumn[]
  rows: EntityRow[]
  isLoading: boolean
  isError: boolean
  deletingId?: string
  deleteError?: string
  onCreate: () => void
  onEdit: (row: EntityRow) => void
  onDelete: (row: EntityRow) => void
  isProtected?: (row: EntityRow) => boolean
  protectedMessage?: string
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  noPermissionMessage?: string
}

export function EntityList({
  title,
  description,
  createLabel,
  columns,
  rows,
  isLoading,
  isError,
  deletingId,
  deleteError,
  onCreate,
  onEdit,
  onDelete,
  isProtected = () => false,
  protectedMessage,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  noPermissionMessage = DEFAULT_NO_PERMISSION_MESSAGE,
}: EntityListProps) {
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const debouncedSearch = useDebouncedValue(search)
  const filteredRows = useMemo(
    () =>
      rows.filter(
        row =>
          !debouncedSearch ||
          Object.values(row).some(value =>
            String(value ?? '').toLowerCase().includes(debouncedSearch.toLowerCase()),
          ),
      ),
    [rows, debouncedSearch],
  )
  const tableColumns = useMemo<ColumnDef<EntityRow>[]>(
    () =>
      columns.map(column => ({
        id: column.id,
        accessorFn: column.accessor,
        header: ({ column: tableColumn }) => (
          <button
            className="flex items-center gap-2 font-semibold text-slate-500 hover:text-slate-700"
            onClick={tableColumn.getToggleSortingHandler()}
            type="button"
          >
            {column.header}
            <span aria-hidden="true">
              {tableColumn.getIsSorted() === 'asc' ? '↑' : tableColumn.getIsSorted() === 'desc' ? '↓' : '↕'}
            </span>
          </button>
        ),
        cell: info => column.cell(info.row.original),
      })),
    [columns],
  )
  // TanStack Table owns this hook's function identities.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredRows,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Tooltip align="end" content={!canCreate ? noPermissionMessage : undefined}>
          <button
            className="button-primary"
            disabled={!canCreate}
            onClick={onCreate}
            type="button"
          >
            + {createLabel}
          </button>
        </Tooltip>
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 p-4">
          <label className="sr-only" htmlFor={`${title}-search`}>
            Buscar
          </label>
          <input
            className="input max-w-md"
            id={`${title}-search`}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar registros"
            value={search}
          />
        </div>
        {deleteError && <p className="border-b border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">{deleteError}</p>}
        {isLoading ? (
          <p className="p-6 text-slate-500">Carregando...</p>
        ) : isError ? (
          <p className="p-6 text-rose-600">Não foi possível carregar os registros.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th className="whitespace-nowrap px-4 py-3" key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                    <th className="px-4 py-3" />
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => {
                  const protectedRow = isProtected(row.original)
                  const id = String(row.original.id)
                  return (
                    <tr className="border-t border-slate-100" key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td className="px-4 py-3" key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Tooltip
                          align="end"
                          content={!canEdit ? noPermissionMessage : protectedRow ? protectedMessage : undefined}
                        >
                          <button
                            className="mr-3 text-violet-700 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                            disabled={protectedRow || !canEdit}
                            onClick={() => onEdit(row.original)}
                            type="button"
                          >
                            Editar
                          </button>
                        </Tooltip>
                        <Tooltip
                          align="end"
                          content={!canDelete ? noPermissionMessage : protectedRow ? protectedMessage : undefined}
                        >
                          <button
                            className="text-rose-600 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                            disabled={protectedRow || !canDelete || deletingId === id}
                            onClick={() => onDelete(row.original)}
                            type="button"
                          >
                            {deletingId === id ? 'Excluindo...' : 'Excluir'}
                          </button>
                        </Tooltip>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredRows.length === 0 && <p className="p-6 text-slate-500">Nenhum registro encontrado.</p>}
          </div>
        )}
      </div>
    </section>
  )
}
