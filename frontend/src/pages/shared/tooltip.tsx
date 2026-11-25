import type { ReactNode } from 'react'

type TooltipProps = {
  content?: string
  align?: 'center' | 'end'
  children: ReactNode
}

export function Tooltip({ content, align = 'center', children }: TooltipProps) {
  if (!content) return <>{children}</>

  const alignClass = align === 'end' ? 'right-0' : 'left-1/2 -translate-x-1/2'

  return (
    <span className="group relative inline-flex">
      {children}
      <span
        className={`pointer-events-none absolute bottom-full z-20 mb-2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 ${alignClass}`}
        role="tooltip"
      >
        {content}
      </span>
    </span>
  )
}
