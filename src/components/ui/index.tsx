import { Loader2 } from 'lucide-react'

// ─── BADGE ────────────────────────────────────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'blue'

const badgeClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-700',
  blue: 'bg-blue-600 text-white',
}

export function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeClasses[variant]}`}>
      {children}
    </span>
  )
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// ─── METRIC CARD ──────────────────────────────────────────────────────────────
export function MetricCard({
  label, value, sub, variant = 'default', icon: Icon,
}: {
  label: string
  value: string | number
  sub?: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
  icon?: React.ElementType
}) {
  const variants = {
    default: 'bg-white border-gray-200',
    danger: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    success: 'bg-green-50 border-green-200',
  }
  const textVariants = {
    default: 'text-gray-900',
    danger: 'text-red-700',
    warning: 'text-yellow-700',
    success: 'text-green-700',
  }
  return (
    <div className={`rounded-xl border p-4 ${variants[variant]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</span>
        {Icon && <Icon size={16} className="text-gray-400" />}
      </div>
      <div className={`text-2xl font-bold ${textVariants[variant]}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

// ─── LOADING ──────────────────────────────────────────────────────────────────
export function Loading({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
      <Loader2 size={20} className="animate-spin" />
      <span className="text-sm">{text}</span>
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function Empty({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      <Icon size={40} className="mb-3 opacity-30" />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  )
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export function SectionHeader({
  title, action,
}: {
  title: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      {action}
    </div>
  )
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
const btnClasses: Record<BtnVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-gray-600 hover:bg-gray-100',
}

export function Button({
  children, variant = 'secondary', onClick, disabled, className = '', size = 'md', type = 'button',
}: {
  children: React.ReactNode
  variant?: BtnVariant
  onClick?: () => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
}) {
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${btnClasses[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ─── TONER BAR ────────────────────────────────────────────────────────────────
const TONER_COLORS: Record<string, string> = {
  K: '#1a1a1a', C: '#0ea5e9', M: '#ec4899', Y: '#eab308',
}

export function TonerBar({ canal, canal_display, porcentaje_restante, nivel }: {
  canal: string
  canal_display: string
  porcentaje_restante: number
  nivel: string
}) {
  const color = nivel === 'CRITICO' ? '#ef4444' : nivel === 'BAJO' ? '#f59e0b' : TONER_COLORS[canal] || '#6b7280'
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: TONER_COLORS[canal] || '#6b7280' }} />
      <span className="w-14 text-gray-500">{canal_display}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${porcentaje_restante}%`, background: color }} />
      </div>
      <span className="w-8 text-right text-gray-500">{porcentaje_restante}%</span>
    </div>
  )
}

// ─── INPUT / SELECT ───────────────────────────────────────────────────────────
export function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <input
        {...props}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      />
    </div>
  )
}

export function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <select
        {...props}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {children}
      </select>
    </div>
  )
}

export function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <textarea
        {...props}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white"
      />
    </div>
  )
}
