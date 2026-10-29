import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../../shared/api/client'
import { EntityList, type EntityColumn, type EntityRow } from '../shared/entity-list'
import { RoleFormModal, type Permission, type RoleForm } from './role-form-modal.component'

const ADMINISTRATOR_ROLE_ID = '01900000-0000-7000-8000-000000000001'

export function RolesPage() {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<EntityRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const roles = useQuery({ queryKey: ['roles'], queryFn: () => api.get<EntityRow[]>('/roles') })
  const permissions = useQuery({ queryKey: ['permissions'], queryFn: () => api.get<Permission[]>('/permissions') })
  const save = useMutation({
    mutationFn: async ({ id, values }: { id?: string; values: RoleForm }) => {
      const permissionsMask = (permissions.data ?? []).reduce((mask, permission) => values.permissions[permission.key] ? mask | BigInt(permission.bit) : mask, 0n)
      const payload = { name: values.name, permissionsMask: permissionsMask.toString() }
      return id ? api.put<EntityRow>(`/roles/${id}`, payload) : api.post<EntityRow>('/roles', payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['roles'] })
      setModalOpen(false)
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/roles/${id}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['roles'] }),
    onError: error => setDeleteError(error instanceof ApiError ? error.message : 'Não foi possível excluir o perfil.'),
  })
  const open = (row?: EntityRow) => {
    if (row?.id === ADMINISTRATOR_ROLE_ID) return
    setEditing(row ?? null)
    setModalOpen(true)
    setDeleteError('')
  }
  const columns: EntityColumn[] = [
    {
      id: 'name',
      header: 'Nome',
      accessor: row => row.name,
      cell: row => <span className="block max-w-56 truncate" title={String(row.name)}>{String(row.name)}</span>,
    },
    {
      id: 'permissionsMask',
      header: 'Permissões',
      accessor: row => row.permissionsMask,
      cell: row => <span className="block max-w-56 truncate" title={String(row.permissionsMask)}>{String(row.permissionsMask)}</span>,
    },
  ]
  return (
    <>
      <EntityList columns={columns} createLabel="Novo perfil" deleteError={deleteError} deletingId={remove.isPending ? remove.variables : undefined} description="Defina perfis e permissões de acesso." isError={roles.isError} isLoading={roles.isLoading} isProtected={row => row.id === ADMINISTRATOR_ROLE_ID} onCreate={() => open()} onDelete={row => { if (window.confirm('Remover este perfil?')) { setDeleteError(''); void remove.mutateAsync(String(row.id)) } }} onEdit={open} protectedMessage="Perfil administrador protegido" rows={roles.data ?? []} title="Perfis" />
      {modalOpen && <RoleFormModal editing={editing} onClose={() => setModalOpen(false)} onSave={async values => { await save.mutateAsync({ id: editing?.id ? String(editing.id) : undefined, values }) }} permissions={permissions.data ?? []} />}
    </>
  )
}
