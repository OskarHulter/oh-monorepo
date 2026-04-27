export interface HeroProps {
  name: string
  tagline?: string
}

export function Hero({ name, tagline }: HeroProps) {
  return (
    <header className="text-center space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
      {tagline ? <p className="text-sm text-neutral-400">{tagline}</p> : null}
    </header>
  )
}
