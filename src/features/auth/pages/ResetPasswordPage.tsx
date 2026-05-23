import { Button, TextInput } from '@rtcamp/frappe-ui-react'

export function ResetPasswordPage() {
  return (
    <form className="auth-form">
      <TextInput placeholder="Nouveau mot de passe" type="password" size="md" variant="subtle" />
      <Button label="Reinitialiser" theme="gray" variant="solid" size="md" type="button" />
    </form>
  )
}
