import { type Website, websiteSchema } from '@oh/shared'
import { ENV } from 'varlock/env'

export const siteConfig: Website = websiteSchema.parse({
  name: ENV.SITE_NAME,
  url: ENV.SITE_URL,
  description: ENV.SITE_DESCRIPTION,
  locale: ENV.SITE_LOCALE,
  themeColor: ENV.SITE_THEME_COLOR,
})
