import {
    LayoutDashboard,
    Router,
    Network,
    Activity,
    Settings
  } from 'lucide-react'
  
  import { NavLink } from 'react-router-dom'
  
  function Sidebar() {
    const menuItems = [
      {
        title: 'Dashboard',
        path: '/',
        icon: LayoutDashboard,
        end: true
      },
      {
        title: 'Equipamentos',
        path: '/equipamentos',
        icon: Router
      },
      {
        title: 'Conexões',
        path: '/conexoes',
        icon: Network
      },
      {
        title: 'Monitoramento',
        path: '/monitoramento',
        icon: Activity
      }
    ]
  
    const linkStyle = ({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
        isActive
          ? 'bg-blue-600/15 text-blue-400'
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`
  
    return (
      <aside className="flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-900 p-5">
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-xl bg-blue-600 p-2.5">
            <Router size={23} />
          </div>
  
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              MikroTik Manager
            </h1>
            <p className="text-xs text-slate-400">
              NETWORK ADMINISTRATION
            </p>
          </div>
        </div>
  
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Menu principal
        </p>
  
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
  
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={linkStyle}
              >
                <Icon size={19} />
                {item.title}
              </NavLink>
            )
          })}
        </nav>
  
        <div className="mt-auto">
          <NavLink
            to="/configuracoes"
            className={linkStyle}
          >
            <Settings size={19} />
            Configurações
          </NavLink>
  
          <div className="mt-5 border-t border-slate-800 pt-5">
            <p className="text-xs text-slate-500">
              MIKROTIK MANAGER
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Versão 0.1.0
            </p>
          </div>
        </div>
      </aside>
    )
  }
  
  export default Sidebar