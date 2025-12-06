import { z } from 'zod'

export const magicLinkSchema = z.object({
  email: z.email('Adresse email invalide'),
})

export type MagicLinkInput = z.infer<typeof magicLinkSchema>
