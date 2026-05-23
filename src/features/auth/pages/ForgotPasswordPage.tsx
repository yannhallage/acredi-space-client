import { Button, TextInput } from '@rtcamp/frappe-ui-react'

export function ForgotPasswordPage() {
  return (
    <form className="auth-form">
      <TextInput placeholder="Email professionnel" type="email" size="md" variant="subtle" />
      <Button label="Envoyer le lien" theme="gray" variant="solid" size="md" type="button" />
    </form>
  )
}
