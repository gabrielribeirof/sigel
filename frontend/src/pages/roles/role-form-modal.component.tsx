import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../shared/api/client'
import { FieldError } from '../../shared/forms/field-error'
import type { EntityRow } from '../shared/entity-list'
import { FormModal } from '../shared/form-modal'

export type Permission = { key: string; bit: string }
export type RoleForm = { name: string; permissions: Record<string, boolean> }

export function RoleFormModal({ editing, permissions, onClose, onSave }: { editing: EntityRow | null; permissions: Permission[]; onClose: () => void; onSave: (values: RoleForm) => Promise<void> }) {
  const [serverError, setServerError] = useState('')
  const currentMask = BigInt(String(editing?.permissionsMask ?? '0'))
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RoleForm>({
    defaultValues: {
      name: String(editing?.name ?? ''),
      permissions: Object.fromEntries(permissions.map(permission => [permission.key, (currentMask & BigInt(permission.bit)) === BigInt(permission.bit)])),
    },
  })
  const submit = async (values: RoleForm) => {
    setServerError('')
    try {
      await onSave(values)
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message)
        Object.entries(error.fields ?? {}).forEach(([field, messages]) => setError(field as keyof RoleForm, { type: 'server', message: messages.join(', ') }))
      } else setServerError('Não foi possível salvar o perfil.')
    }
  }
  return (
    <FormModal isSubmitting={isSubmitting} onClose={onClose} onSubmit={event => void handleSubmit(submit)(event)} serverError={serverError} title={`${editing ? 'Editar' : 'Novo'} perfil`}>
      <label className="block text-sm font-medium text-slate-700">Nome<input className="input mt-2" {...register('name', { required: 'Informe o nome.' })} /><FieldError message={errors.name?.message} /></label>
      <fieldset className="space-y-2"><legend className="text-sm font-medium text-slate-700">Permissões</legend>{permissions.map(permission => <label className="flex items-center gap-2 text-sm text-slate-700" key={permission.key}><input type="checkbox" {...register(`permissions.${permission.key}`)} />{permission.key}</label>)}</fieldset>
    </FormModal>
  )
}
