import { NavLink, Outlet } from 'react-router-dom'
import { NAV_ITEMS } from '../../app/routes'
import { useAuth } from '../../shared/auth/use-auth'

export function DashboardLayout() {
  const { user, logout } = useAuth()
  if (!user) return null
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="flex items-center justify-between bg-slate-950 px-6 py-4 text-white">
        <div><span className="font-bold tracking-[0.25em] text-violet-300">SIGEL</span><span className="ml-3 text-sm text-slate-400">Gestão de identidade</span></div>
        <div className="flex items-center gap-4 text-sm"><span className="hidden text-slate-300 sm:inline">{user.email}</span><button className="rounded-lg border border-slate-700 px-3 py-2 hover:bg-slate-800" onClick={logout}>Sair</button></div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        <nav className="flex gap-2 overflow-auto lg:w-56 lg:flex-col">
          {NAV_ITEMS.map(item => (
            <NavLink
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              end={item.end}
              key={item.path}
              to={item.path}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <main className="min-w-0 flex-1"><Outlet /></main>
      </div>
    </div>
  )
}
