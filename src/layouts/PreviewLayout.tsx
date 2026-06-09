import type { ReactNode } from 'react';

export function DesignCanvas({ children }: { children: ReactNode }) {
  return <main className="design-canvas">{children}</main>;
}

export function DCSection({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="dc-section">
      <header>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      <div className="dc-artboards">{children}</div>
    </section>
  );
}

export function DCArtboard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <article className="dc-artboard">
      <span>{label}</span>
      <div>{children}</div>
    </article>
  );
}
