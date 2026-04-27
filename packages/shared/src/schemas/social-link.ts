import { z } from 'zod'

export const socialLinkSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
  icon: z.string().min(1).optional(),
})

export type SocialLink = z.infer<typeof socialLinkSchema>
