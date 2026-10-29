import { useState } from 'react'
import { FieldError } from '../../shared/forms/field-error'
import { useDebouncedValue } from '../../shared/forms/use-field-errors'
import type { EntityRow } from './entity-list'

type SearchableSelectProps = {
  label: string
  value: string
  options: EntityRow[]
  onChange: (value: string) => void
  error?: string
}

export function SearchableSelect({ label, value, options, onChange, error }: SearchableSelectProps) {
  const [term, setTerm] = useState('')
  const debouncedTerm = useDebouncedValue(term)
  const filteredOptions =
    debouncedTerm.length < 3
      ? options.slice(0, 8)
      : options.filter(option =>
          String(option.name ?? option.email)
            .toLowerCase()
            .includes(debouncedTerm.toLowerCase()),
        )

  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        className="input mt-2"
        onChange={event => setTerm(event.target.value)}
        placeholder="Digite ao menos 3 letras para buscar"
        value={term}
      />
      <select className="input mt-2" onChange={event => onChange(event.target.value)} value={value}>
        <option value="">Selecione...</option>
        {filteredOptions.map(option => (
          <option key={String(option.id)} value={String(option.id)}>
            {String(option.name ?? option.email)}
          </option>
        ))}
      </select>
      <FieldError message={error} />
    </label>
  )
}
