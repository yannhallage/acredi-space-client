import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, action, children, className = '' }: CardProps) {
  return (
    <section className={`card ${className}`}>
      {title || action ? (
        <header className="card-header">
          {title ? <h3>{title}</h3> : <span />}
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}
