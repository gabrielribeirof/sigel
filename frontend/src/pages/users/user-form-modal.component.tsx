import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { ApiError } from '../../shared/api/client'
import { FieldError } from '../../shared/forms/field-error'
import type { EntityRow } from '../shared/entity-list'
import { FormModal } from '../shared/form-modal'
import { SearchableSelect } from '../shared/searchable-select'

export type UserForm = {
  email: string
  password: string
  roleId: string
  employeeId: string
  active: boolean
}

const MASTER_USER_ID = '01900000-0000-7000-8000-000000000002'

export function UserFormModal({
  editing,
  roles,
  employees,
  onClose,
  onSave,
}: {
  editing: EntityRow | null
  roles: EntityRow[]
  employees: EntityRow[]
  onClose: () => void
  onSave: (values: UserForm) => Promise<void>
}) {
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, setError, setValue, control, formState: { errors, isSubmitting } } = useForm<UserForm>({
    defaultValues: {
      email: String(editing?.email ?? ''),
      password: '',
      roleId: String(editing?.roleId ?? ''),
      employeeId: String(editing?.employeeId ?? ''),
      active: Boolean(editing?.active),
    },
  })
  const roleId = useWatch({ control, name: 'roleId' })
  const employeeId = useWatch({ control, name: 'employeeId' })

  const submit = async (values: UserForm) => {
    setServerError('')
    try {
      await onSave(values)
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message)
        Object.entries(error.fields ?? {}).forEach(([field, messages]) =>
          setError(field as keyof UserForm, { type: 'server', message: messages.join(', ') }),
        )
      } else {
        setServerError('Não foi possível salvar o usuário.')
      }
    }
  }

  return (
    <FormModal isSubmitting={isSubmitting} onClose={onClose} onSubmit={event => void handleSubmit(submit)(event)} serverError={serverError} title={`${editing ? 'Editar' : 'Novo'} usuário`}>
      <label className="block text-sm font-medium text-slate-700">
        E-mail
        <input className="input mt-2" type="email" {...register('email', { required: 'Informe o e-mail.' })} />
        <FieldError message={errors.email?.message} />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        {editing ? 'Nova senha (opcional)' : 'Senha'}
        <input className="input mt-2" type="password" {...register('password', { required: editing ? false : 'Informe a senha.' })} />
        <FieldError message={errors.password?.message} />
      </label>
      <SearchableSelect error={errors.roleId?.message} label="Perfil" onChange={value => setValue('roleId', value, { shouldValidate: true })} options={roles} value={roleId} />
      <SearchableSelect error={errors.employeeId?.message} label="Funcionário (opcional)" onChange={value => setValue('employeeId', value, { shouldValidate: true })} options={employees} value={employeeId} />
      {editing && <label className="flex items-center gap-2 text-sm"><input disabled={editing.id === MASTER_USER_ID} type="checkbox" {...register('active')} />Usuário ativo</label>}
    </FormModal>
  )
}
