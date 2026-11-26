import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { api, ApiError } from '../../shared/api/client'
import { Permission, type PermissionBit } from '../../shared/auth/permissions'
import { usePermissions } from '../../shared/auth/use-permissions'
import { EntityList, type EntityColumn, type EntityRow } from '../shared/entity-list'
import { FormModal } from '../shared/form-modal'
import { FieldError } from '../../shared/forms/field-error'

type Kind = 'customers' | 'suppliers'
type PartyForm = { type: 'PF' | 'PJ'; name: string; document: string; email: string; phone: string; address: string }

const partyPermissions: Record<Kind, PermissionBit> = {
  customers: Permission.ManageCustomers,
  suppliers: Permission.ManageSuppliers,
}

function PartyModal({ kind, editing, onClose, onSave }: {
  kind: Kind; editing: EntityRow | null; onClose: () => void; onSave: (form: PartyForm) => Promise<void>
}) {
  const [serverError, setServerError] = useState('')
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<PartyForm>({
    defaultValues: {
      type: (editing?.type as 'PF' | 'PJ') ?? (kind === 'suppliers' ? 'PJ' : 'PF'),
      name: String(editing?.name ?? ''),
      document: String(editing?.document ?? ''),
      email: String(editing?.email ?? ''),
      phone: String(editing?.phone ?? ''),
      address: String(editing?.address ?? ''),
    },
  })
  const type = useWatch({ control, name: 'type' })
  const submit = async (values: PartyForm) => {
    setServerError('')
    try {
      await onSave(values)
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message)
        Object.entries(error.fields ?? {}).forEach(([field, messages]) =>
          setError(field as keyof PartyForm, { type: 'server', message: messages.join(', ') }),
        )
      } else {
        setServerError('Não foi possível salvar o cadastro.')
      }
    }
  }
  return (
    <FormModal
      isSubmitting={isSubmitting}
      onClose={onClose}
      onSubmit={event => void handleSubmit(submit)(event)}
      serverError={serverError}
      title={`${editing ? 'Editar' : 'Novo'} ${kind === 'customers' ? 'cliente' : 'fornecedor'}`}
    >
      {kind === 'customers' && (
        <label className="block text-sm font-medium text-slate-700">
          Tipo de cliente
          <select className="input mt-2" {...register('type', { required: 'Selecione o tipo.' })}>
            <option value="PF">Pessoa física</option>
            <option value="PJ">Pessoa jurídica</option>
          </select>
          <FieldError message={errors.type?.message} />
        </label>
      )}
      <label className="block text-sm font-medium text-slate-700">
        {kind === 'customers' && type === 'PF' ? 'Nome completo' : 'Razão social / Nome'}
        <input className="input mt-2" maxLength={200} {...register('name', { required: 'Informe o nome.' })} />
        <FieldError message={errors.name?.message} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        {kind === 'suppliers' || type === 'PJ' ? 'CNPJ' : 'CPF'}
        <input
          className="input mt-2"
          inputMode="numeric"
          placeholder={kind === 'suppliers' || type === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
          {...register('document', { required: 'Informe o documento.' })}
        />
        <FieldError message={errors.document?.message} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        E-mail (opcional)
        <input className="input mt-2" maxLength={255} type="email" {...register('email')} />
        <FieldError message={errors.email?.message} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Telefone (opcional)
        <input className="input mt-2" maxLength={20} type="tel" {...register('phone')} />
        <FieldError message={errors.phone?.message} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        Endereço (opcional)
        <input className="input mt-2" maxLength={400} {...register('address')} />
        <FieldError message={errors.address?.message} />
      </label>
    </FormModal>
  )
}

export function PartiesPage({ kind }: { kind: Kind }) {
  const queryClient = useQueryClient()
  const { can } = usePermissions()
  const canManage = can(partyPermissions[kind])
  const [editing, setEditing] = useState<EntityRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const label = kind === 'customers' ? 'cliente' : 'fornecedor'
  const rows = useQuery({ queryKey: [kind], queryFn: () => api.get<EntityRow[]>(`/${kind}`) })
  const save = useMutation({
    mutationFn: ({ id, values }: { id?: string; values: PartyForm }) => {
      const payload = kind === 'customers'
        ? values
        : {
            name: values.name,
            document: values.document,
            email: values.email,
            phone: values.phone,
            address: values.address,
          }
      return id ? api.put<EntityRow>(`/${kind}/${id}`, payload) : api.post<EntityRow>(`/${kind}`, payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [kind] })
      setModalOpen(false)
    },
  })
  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/${kind}/${id}`),
    onSuccess: () => {
      setDeleteError('')
      void queryClient.invalidateQueries({ queryKey: [kind] })
    },
    onError: error => setDeleteError(error instanceof ApiError ? error.message : 'Não foi possível excluir o cadastro.'),
  })
  const open = (row?: EntityRow) => {
    if (!canManage) return
    setEditing(row ?? null)
    setDeleteError('')
    setModalOpen(true)
  }
  const columns: EntityColumn[] = [
    ...(kind === 'customers'
      ? [{
          id: 'type',
          header: 'Tipo',
          accessor: (row: EntityRow) => row.type,
          cell: (row: EntityRow) => row.type === 'PF' ? 'Pessoa física' : 'Pessoa jurídica',
        }]
      : []),
    { id: 'name', header: 'Nome', accessor: row => row.name, cell: row => String(row.name) },
    { id: 'document', header: 'CPF/CNPJ', accessor: row => row.document, cell: row => String(row.document) },
    { id: 'email', header: 'E-mail', accessor: row => row.email, cell: row => String(row.email ?? '—') },
    { id: 'phone', header: 'Telefone', accessor: row => row.phone, cell: row => String(row.phone ?? '—') },
  ]
  return (
    <>
      <EntityList
        canCreate={canManage}
        canDelete={canManage}
        canEdit={canManage}
        columns={columns}
        createLabel={`Novo ${label}`}
        deleteError={deleteError}
        deletingId={remove.isPending ? remove.variables : undefined}
        description={`Consulte, cadastre e atualize os ${kind === 'customers' ? 'clientes' : 'fornecedores'} da EVENTPRO.`}
        isError={rows.isError}
        isLoading={rows.isLoading}
        onCreate={() => open()}
        onDelete={row => {
          if (canManage && window.confirm(`Excluir este ${label}?`)) {
            setDeleteError('')
            remove.mutate(String(row.id))
          }
        }}
        onEdit={open}
        rows={rows.data ?? []}
        title={kind === 'customers' ? 'Clientes' : 'Fornecedores'}
      />
      {modalOpen && (
        <PartyModal
          editing={editing}
          kind={kind}
          onClose={() => setModalOpen(false)}
          onSave={async values => {
            await save.mutateAsync({ id: editing?.id ? String(editing.id) : undefined, values })
          }}
        />
      )}
    </>
  )
}
