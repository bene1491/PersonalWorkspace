import type { ReactNode } from 'react'
import { Check, CircleAlert, LockKeyhole, Sparkles } from 'lucide-react'

type Tone = 'neutral' | 'positive' | 'warning' | 'accent'

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  return <span className={`pill pill-${tone}`}>{children}</span>
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="section-description">{description}</p>}
      </div>
      {action && <div className="section-action">{action}</div>}
    </div>
  )
}

export function InfoCard({
  title,
  children,
  className = '',
}: {
  title?: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`surface-card ${className}`}>
      {title && <h2 className="card-title">{title}</h2>}
      {children}
    </section>
  )
}

export function Notice({
  title,
  children,
  variant = 'info',
}: {
  title: string
  children: ReactNode
  variant?: 'info' | 'secure' | 'warning'
}) {
  const Icon = variant === 'secure' ? LockKeyhole : variant === 'warning' ? CircleAlert : Sparkles
  return (
    <div className={`notice notice-${variant}`}>
      <Icon size={18} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  )
}

export function EmptyState({
  title,
  children,
  icon,
}: {
  title: string
  children: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon ?? <Check size={22} />}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  )
}
