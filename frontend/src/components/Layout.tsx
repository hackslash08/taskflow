import { NavLink, Outlet } from 'react-router-dom';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-brand-600 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`;

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col bg-slate-900 text-white">
        <div className="border-b border-slate-800 px-6 py-5">
          <h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
          <p className="mt-1 text-xs text-slate-400">Project management</p>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
