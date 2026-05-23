interface ScaffoldPanelProps {
  name: string
  description: string
}

export function ScaffoldPanel({ description, name }: ScaffoldPanelProps) {
  return (
    <section className="scaffold-panel">
      <strong>{name}</strong>
      <span>{description}</span>
    </section>
  )
}
