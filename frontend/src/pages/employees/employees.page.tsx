import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../shared/api/client'
import { EntityList, type EntityColumn, type EntityRow } from '../shared/entity-list'
import { EmployeeFormModal, type EmployeeForm } from './employee-form-modal.component'

export function EmployeesPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<EntityRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const employees = useQuery({ queryKey: ['employees'], queryFn: () => api.get<EntityRow[]>('/employees') })
  const save = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: EmployeeForm }) =>
      id ? api.put<EntityRow>(`/employees/${id}`, { ...values, terminationDate: values.terminationDate || null }) : api.post<EntityRow>('/employees', { ...values, terminationDate: values.terminationDate || null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] })
      setModalOpen(false)
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/employees/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['employees'] }),
    onError: error => setDeleteError(error instanceof ApiError ? error.message : 'Não foi possível excluir o funcionário.'),
  })
  const open = (row?: EntityRow) => {
    setEditing(row ?? null)
    setModalOpen(true)
    setDeleteError('')
  }
  const columns: EntityColumn[] = [
    { id: 'registration', header: 'Matrícula', accessor: row => row.registration, cell: row => String(row.registration) },
    { id: 'name', header: 'Nome', accessor: row => row.name, cell: row => String(row.name) },
    { id: 'sector', header: 'Setor', accessor: row => row.sector, cell: row => String(row.sector) },
    {
      id: 'admissionDate',
      header: 'Admissão',
      accessor: row => row.admissionDate,
      cell: row => String(row.admissionDate).split('-').reverse().join('/'),
    },
  ]
  return (
    <>
      <EntityList columns={columns} createLabel="Novo funcionário" deleteError={deleteError} deletingId={remove.isPending ? remove.variables : undefined} description="Cadastre e gerencie os funcionários." isError={employees.isError} isLoading={employees.isLoading} onCreate={() => open()} onDelete={row => { if (window.confirm('Remover este funcionário?')) { setDeleteError(''); void remove.mutateAsync(String(row.id)) } }} onEdit={open} rows={employees.data ?? []} title="Funcionários" />
      {modalOpen && <EmployeeFormModal editing={editing} onClose={() => setModalOpen(false)} onSave={async values => { await save.mutateAsync({ id: editing?.id ? String(editing.id) : undefined, values }) }} />}
    </>
  )
}
