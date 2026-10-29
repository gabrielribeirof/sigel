import type { FormEvent, ReactNode } from 'react'

type FormModalProps = {
  title: string
  serverError: string
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}

export function FormModal({ title, serverError, isSubmitting, onClose, onSubmit, children }: FormModalProps) {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/50 p-4">
      <form
        className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-auto rounded-2xl bg-white p-6 shadow-2xl"
        noValidate
        onSubmit={onSubmit}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{title}</h2>
          <button aria-label="Fechar" className="text-2xl text-slate-400" onClick={onClose} type="button">
            ×
          </button>
        </div>
        {serverError && <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{serverError}</div>}
        {children}
        <div className="flex justify-end gap-3 pt-2">
          <button className="button-secondary" onClick={onClose} type="button">
            Cancelar
          </button>
          <button className="button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
