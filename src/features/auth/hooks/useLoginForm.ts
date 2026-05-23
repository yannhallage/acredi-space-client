import { useForm } from 'react-hook-form'
import { loginSchema } from '../../../shared/lib/validators'

export interface LoginFormValues {
  email: string
  password: string
}

export function useLoginForm() {
  return useForm<LoginFormValues>({
    defaultValues: {
      email: 'admin@acredi.local',
      password: 'password',
    },
    mode: 'onSubmit',
  })
}

export function validateLoginForm(values: LoginFormValues) {
  return loginSchema.safeParse(values)
}
