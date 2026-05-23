import { Button, TextInput } from '@rtcamp/frappe-ui-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../app/providers/AuthProvider'
import { useLoginForm, validateLoginForm } from '../hooks/useLoginForm'

export function LoginPage() {
  const { login, status } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const form = useLoginForm()
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/app/files'

  if (status === 'authenticated') {
    return <Navigate to={from} replace />
  }

  return (
    <form
      className="auth-form"
      onSubmit={form.handleSubmit(async (values) => {
        const result = validateLoginForm(values)
        if (!result.success) return

        await login(result.data)
        navigate(from, { replace: true })
      })}
    >
      <TextInput placeholder="Email" type="email" size="md" variant="subtle" {...form.register('email')} />
      <TextInput placeholder="Mot de passe" type="password" size="md" variant="subtle" {...form.register('password')} />
      <Button label="Se connecter" theme="gray" variant="solid" size="md" type="submit" />
    </form>
  )
}
