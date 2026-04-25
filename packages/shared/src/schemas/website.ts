import { z } from 'zod'

export const websiteSchema = z.object({
  name: z.string().min(1),
  url: z.url(),
  description: z.string().max(280).optional(),
  locale: z.string().default('en-US'),
  themeColor: z
    .string()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
    .optional(),
})

export type Website = z.infer<typeof websiteSchema>
