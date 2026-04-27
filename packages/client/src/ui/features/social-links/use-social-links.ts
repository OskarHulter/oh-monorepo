import type { SocialLink } from '@oh/shared'
import { useEffect, useState } from 'react'

import { usePorts } from '../../../providers.tsx'

interface UseSocialLinksResult {
  links: SocialLink[]
  loading: boolean
  error: unknown
}

export function useSocialLinks(): UseSocialLinksResult {
  const { data } = usePorts()
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    data.socialLinks
      .list()
      .then((result) => {
        if (cancelled) return
        setLinks(result)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [data.socialLinks])

  return { links, loading, error }
}
