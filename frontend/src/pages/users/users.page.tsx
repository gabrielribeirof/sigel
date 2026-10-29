import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../shared/api/client'
import { EntityList, type EntityColumn, type EntityRow } from '../shared/entity-list'
import { UserFormModal, type UserForm } from './user-form-modal.component'

const MASTER_USER_ID = '01900000-0000-7000-8000-000000000002'

export function UsersPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<EntityRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const users = useQuery({ queryKey: ['users'], queryFn: () => api.get<EntityRow[]>('/users') })
  const roles = useQuery({ queryKey: ['roles'], queryFn: () => api.get<EntityRow[]>('/roles') })
  const employees = useQuery({ queryKey: ['employees'], queryFn: () => api.get<EntityRow[]>('/employees') })
  const save = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: UserForm }) =>
      id ? api.put<EntityRow>(`/users/${id}`, { ...values, employeeId: values.employeeId || null }) : api.post<EntityRow>('/users', { ...values, employeeId: values.employeeId || null }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      setModalOpen(false)
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: error => setDeleteError(error instanceof ApiError ? error.message : 'Não foi possível excluir o usuário.'),
  })
  const open = (row?: EntityRow) => {
    setEditing(row ?? null)
    setModalOpen(true)
    setDeleteError('')
  }
  const columns: EntityColumn[] = [
    { id: 'email', header: 'E-mail', accessor: row => row.email, cell: row => String(row.email) },
    { id: 'roleId', header: 'Perfil', accessor: row => row.roleId, cell: row => String(row.roleId) },
    { id: 'active', header: 'Ativo', accessor: row => row.active, cell: row => row.active ? 'Sim' : 'Não' },
  ]
  return (
    <>
      <EntityList columns={columns} createLabel="Novo usuário" deleteError={deleteError} deletingId={remove.isPending ? remove.variables : undefined} description="Cadastre e gerencie os usuários do sistema." isError={users.isError} isLoading={users.isLoading} isProtected={row => row.id === MASTER_USER_ID} onCreate={() => open()} onDelete={row => { if (window.confirm('Remover este usuário?')) { setDeleteError(''); void remove.mutateAsync(String(row.id)) } }} onEdit={open} protectedMessage="Usuário protegido" rows={users.data ?? []} title="Usuários" />
      {modalOpen && <UserFormModal editing={editing} employees={employees.data ?? []} onClose={() => setModalOpen(false)} onSave={async values => { await save.mutateAsync({ id: editing?.id ? String(editing.id) : undefined, values }) }} roles={roles.data ?? []} />}
    </>
  )
}
