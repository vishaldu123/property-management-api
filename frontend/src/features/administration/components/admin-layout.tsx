import React from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface AdminLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ title, description, children }) => (
  <div className="space-y-6 p-4 lg:p-6">
    <header>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-1">
        <Link to="/admin" className="hover:underline">
          Administration
        </Link>
        <span aria-hidden="true"> / </span>
        <span>{title}</span>
      </nav>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-muted-foreground mt-1">{description}</p>}
    </header>
    {children}
  </div>
)

interface AdminNavLinkProps {
  href: string
  label: string
  active?: boolean
}

export const AdminNavLink: React.FC<AdminNavLinkProps> = ({ href, label, active }) => (
  <Link
    to={href}
    className={cn(
      'block rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
    )}
    aria-current={active ? 'page' : undefined}
  >
    {label}
  </Link>
)

interface PlaceholderNoticeProps {
  title: string
  message: string
}

export const PlaceholderNotice: React.FC<PlaceholderNoticeProps> = ({ title, message }) => (
  <div
    className="rounded-lg border border-dashed border-border bg-muted/30 p-4"
    role="status"
    aria-label={title}
  >
    <p className="text-sm font-medium">{title}</p>
    <p className="text-sm text-muted-foreground mt-1">{message}</p>
  </div>
)
