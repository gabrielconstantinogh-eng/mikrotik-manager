
import {
  LayoutDashboard,
  Router,
  Network,
  Activity,
  Settings,
  Plus,
  Search,
  Bell,
  ChevronRight,
  Wifi,
  Server,
  Clock,
  ArrowUpRight
} from 'lucide-react'

function App() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">

      {/* MENU LATERAL */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900 p-5">

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
          <a className="flex items-center gap-3 rounded-lg bg-blue-600/15 px-3 py-3 text-sm font-medium text-blue-400">
            <LayoutDashboard size={19} />
            Dashboard
          </a>

          <a className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
            <Router size={19} />
            Equipamentos
          </a>

          <a className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
            <Network size={19} />
            Conexões
          </a>

          <a className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
            <Activity size={19} />
            Monitoramento
          </a>
        </nav>

        <div className="mt-auto">
          <a className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white">
            <Settings size={19} />
            Configurações
          </a>

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

      {/* CONTEÚDO PRINCIPAL */}
      <main className="min-w-0 flex-1 p-8">

        {/* CABEÇALHO */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Visão geral da sua infraestrutura de rede.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-slate-800 p-2.5 text-slate-400 hover:bg-slate-800">
              <Bell size={19} />
            </button>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
              G
            </div>
          </div>
        </header>

        {/* INDICADORES */}
        <section className="mb-8 grid grid-cols-3 gap-5">

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Equipamentos cadastrados
              </span>
              <Router className="text-blue-400" size={21} />
            </div>

            <h3 className="mt-5 text-3xl font-bold">0</h3>

            <p className="mt-2 text-xs text-slate-500">
              Total de MikroTiks
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Online
              </span>
              <Wifi className="text-emerald-400" size={21} />
            </div>

            <h3 className="mt-5 text-3xl font-bold">0</h3>

            <p className="mt-2 text-xs text-slate-500">
              Equipamentos disponíveis
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">
                Conexões recentes
              </span>
              <Activity className="text-purple-400" size={21} />
            </div>

            <h3 className="mt-5 text-3xl font-bold">0</h3>

            <p className="mt-2 text-xs text-slate-500">
              Histórico de acessos
            </p>
          </div>

        </section>

        {/* EQUIPAMENTOS */}
        <section className="rounded-xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 p-5">
            <div>
              <h3 className="font-semibold">
                Meus equipamentos
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Gerencie seus roteadores MikroTik.
              </p>
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium transition hover:bg-blue-500">
              <Plus size={17} />
              Adicionar MikroTik
            </button>
          </div>

          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
              <Server size={30} className="text-slate-500" />
            </div>

            <h4 className="font-medium">
              Nenhum equipamento cadastrado
            </h4>

            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Comece adicionando seu primeiro MikroTik para organizar suas conexões.
            </p>

            <button className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800">
              <Plus size={16} />
              Cadastrar primeiro equipamento
            </button>
          </div>

        </section>

        {/* RODAPÉ */}
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

export default App
