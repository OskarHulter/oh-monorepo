import type { RouterPort } from '@oh/client'

export const router: RouterPort = {
  push(to) {
    window.location.assign(to)
  },
  useParams<T extends Record<string, string | undefined>>(): T {
    return {} as T
  },
  Link({ to, children, className, 'aria-label': ariaLabel }) {
    return (
      <a href={to} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    )
  },
}
