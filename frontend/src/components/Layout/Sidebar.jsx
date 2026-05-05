import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, FileText, BarChart2, ShieldAlert,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',  label: 'Overview',   Icon: LayoutDashboard },
  { to: '/partners',   label: 'Partners',   Icon: Users },
  { to: '/contracts',  label: 'Contracts',  Icon: FileText },
  { to: '/analytics',  label: 'Analytics',  Icon: BarChart2 },
  { to: '/risk',       label: 'Risk',       Icon: ShieldAlert },
]

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 flex flex-col bg-neutral-950 border-r border-neutral-800/80 h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-neutral-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">AG</span>
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-white">
              Anti<span className="text-indigo-400">gravity</span>
            </span>
            <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest leading-none mt-0.5">
              Partner CRM
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all
               ${isActive
                 ? 'bg-indigo-600/20 text-white font-medium shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]'
                 : 'text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-200'
               }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-indigo-400' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-neutral-800/80 space-y-2">
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-6 h-6 bg-neutral-700 rounded-full flex items-center justify-center">
            <span className="text-[9px] text-white font-bold">YH</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-neutral-300 leading-tight truncate">younghwanyun1</p>
            <p className="text-[9px] text-neutral-600 leading-tight">Admin</p>
          </div>
        </div>
        <p className="text-[9px] text-neutral-700 font-mono px-1">v1.0.0 · 2026.05</p>
      </div>
    </aside>
  )
}
