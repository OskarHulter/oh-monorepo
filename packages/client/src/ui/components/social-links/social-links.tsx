import { useSocialLinks } from '../../features/social-links/use-social-links.ts'

export function SocialLinks() {
  const { links, loading, error } = useSocialLinks()

  if (loading) return null
  if (error) return null
  if (links.length === 0) return null

  return (
    <nav aria-label="Social links">
      <ul className="flex gap-4 justify-center text-sm">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 hover:text-neutral-50 underline-offset-2 hover:underline"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
