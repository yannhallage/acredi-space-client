interface ModulePlaceholderProps {
  title: string
  description: string
}

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <section className="page-surface">
      <div className="empty-state">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  )
}
