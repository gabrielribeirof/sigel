import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ApiError } from '../../shared/api/client'
import { useAuth } from '../../shared/auth/use-auth'
import { FieldError } from '../../shared/forms/field-error'
import { LoginLayout } from './login.layout'

type LoginValues = { email: string; password: string }

export function LoginPage() {
  const { login } = useAuth()
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>()

  const onSubmit = async (values: LoginValues) => {
    setServerError('')
    try {
      await login(values.email, values.password)
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : 'Não foi possível entrar.')
    }
  }

  return (
    <LoginLayout>
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{serverError}</div>}
        <label className="block text-sm font-medium text-slate-700">
          E-mail
          <input
            type="email"
            autoComplete="email"
            className="input mt-2"
            placeholder="voce@empresa.com"
            {...register('email', { required: 'Informe seu e-mail.', pattern: { value: /^\S+@\S+$/i, message: 'Informe um e-mail válido.' } })}
          />
          <FieldError message={errors.email?.message} />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Senha
          <input
            type="password"
            autoComplete="current-password"
            className="input mt-2"
            {...register('password', { required: 'Informe sua senha.' })}
          />
          <FieldError message={errors.password?.message} />
        </label>
        <button className="button-primary w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </LoginLayout>
  )
}
