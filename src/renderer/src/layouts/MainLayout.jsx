import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

function MainLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />

      <main className="min-w-0 flex-1 p-8">
        <Outlet />

        <footer className="mt-8 flex items-center justify-between text-xs text-slate-600">
          <span>MikroTik Manager © 2026</span>

          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Aplicação em execução
          </span>
        </footer>
      </main>
    </div>
  )
}

export default MainLayout
