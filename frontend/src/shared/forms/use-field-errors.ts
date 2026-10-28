import { useEffect, useState } from 'react'
import { useForm, type FieldValues, type UseFormSetError } from 'react-hook-form'
import { ApiError } from '../api/client'

export function useApiForm<T extends FieldValues>() {
  const form = useForm<T>()
  const applyApiError = (error: unknown, setError: UseFormSetError<T>) => {
    if (!(error instanceof ApiError)) return
    Object.entries(error.fields ?? {}).forEach(([field, messages]) => {
      setError(field as never, { type: 'server', message: messages.join(', ') })
    })
  }
  return { ...form, applyApiError }
}

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [value, delay])
  return debounced
}
