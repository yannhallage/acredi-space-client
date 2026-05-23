import { z } from 'zod'

export const emailSchema = z.string().email('Adresse email invalide')

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caracteres'),
})
