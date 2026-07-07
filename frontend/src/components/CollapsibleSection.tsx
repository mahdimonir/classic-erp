import React, { useState } from "react"
import { ChevronDown } from "lucide-react"

interface CollapsibleSectionProps {
  title: React.ReactNode
  defaultOpen?: boolean
  badge?: React.ReactNode
  className?: string
  headerClassName?: string
  children: React.ReactNode
}


const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  defaultOpen = true,
  badge,
  className = "",
  headerClassName = "",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden ${className}`}>
      {}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between p-4 sm:p-5 bg-slate-50/60 border-b border-slate-200 hover:bg-slate-100/60 transition-colors text-left cursor-pointer ${headerClassName}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-semibold text-slate-800 truncate">{title}</span>
          {badge && <span className="shrink-0">{badge}</span>}
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ml-3 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {}
      {isOpen && <div>{children}</div>}
    </div>
  )
}

export default CollapsibleSection
