import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../shared/api/client'
import { FieldError } from '../../shared/forms/field-error'
import type { EntityRow } from '../shared/entity-list'
import { FormModal } from '../shared/form-modal'

export type EmployeeForm = {
  registration: string
  name: string
  sector: string
  admissionDate: string
  terminationDate: string
}

export function EmployeeFormModal({ editing, onClose, onSave }: { editing: EntityRow | null; onClose: () => void; onSave: (values: EmployeeForm) => Promise<void> }) {
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<EmployeeForm>({
    defaultValues: {
      registration: String(editing?.registration ?? ''),
      name: String(editing?.name ?? ''),
      sector: String(editing?.sector ?? ''),
      admissionDate: String(editing?.admissionDate ?? ''),
      terminationDate: String(editing?.terminationDate ?? ''),
    },
  })
  const submit = async (values: EmployeeForm) => {
    setServerError('')
    try {
      await onSave(values)
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message)
        Object.entries(error.fields ?? {}).forEach(([field, messages]) => setError(field as keyof EmployeeForm, { type: 'server', message: messages.join(', ') }))
      } else setServerError('Não foi possível salvar o funcionário.')
    }
  }
  return (
    <FormModal isSubmitting={isSubmitting} onClose={onClose} onSubmit={event => void handleSubmit(submit)(event)} serverError={serverError} title={`${editing ? 'Editar' : 'Novo'} funcionário`}>
      <label className="block text-sm font-medium text-slate-700">Matrícula<input className="input mt-2" {...register('registration', { required: 'Informe a matrícula.' })} /><FieldError message={errors.registration?.message} /></label>
      <label className="block text-sm font-medium text-slate-700">Nome<input className="input mt-2" {...register('name', { required: 'Informe o nome.' })} /><FieldError message={errors.name?.message} /></label>
      <label className="block text-sm font-medium text-slate-700">Setor<select className="input mt-2" {...register('sector', { required: 'Selecione o setor.' })}><option value="">Selecione...</option><option value="logistics">Logística</option><option value="assembly">Montagem</option><option value="service">Serviço</option><option value="administrative">Administrativo</option></select><FieldError message={errors.sector?.message} /></label>
      <label className="block text-sm font-medium text-slate-700">Data de admissão<input type="date" className="input mt-2" {...register('admissionDate', { required: 'Informe a data.' })} /><FieldError message={errors.admissionDate?.message} /></label>
      <label className="block text-sm font-medium text-slate-700">Data de desligamento (opcional)<input type="date" className="input mt-2" {...register('terminationDate')} /><FieldError message={errors.terminationDate?.message} /></label>
    </FormModal>
  )
}
