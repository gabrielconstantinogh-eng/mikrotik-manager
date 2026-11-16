import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
  } from 'react'

import {
  Router,
  Wifi,
  WifiOff,
  Activity,
  RefreshCw,
  Clock3,
  CircleCheck,
  CircleX,
  PlugZap,
  Search
} from 'lucide-react'

import Header from '../components/Header'
import StatCard from '../components/StatCard'

const REFRESH_INTERVAL = 30000

function formatTime(date) {
  if (!date) return 'Aguardando verificação'

  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function EquipmentCard({ equipment }) {
  const online = equipment.ping?.online || equipment.winbox?.open

  const statusColor = online
    ? 'text-emerald-400'
    : 'text-red-400'

  const statusBackground = online
    ? 'bg-emerald-500/10 border-emerald-500/20'
    : 'bg-red-500/10 border-red-500/20'

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700">

      <div className="flex items-start justify-between gap-3">

        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-blue-600/10 p-3 text-blue-400">
            <Router size={22} />
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-semibold text-slate-100">
              {equipment.name}
            </h3>

            <p className="mt-1 truncate text-xs text-slate-400">
              {equipment.host}
            </p>
          </div>
        </div>

        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusBackground} ${statusColor}`}>
          {online ? 'ONLINE' : 'OFFLINE'}
        </span>

      </div>

      <div className="my-5 grid grid-cols-2 gap-3">

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Activity size={15} />
            Ping
          </div>

          <p className={`mt-2 text-sm font-semibold ${equipment.ping?.online ? 'text-emerald-400' : 'text-slate-500'}`}>
            {equipment.ping?.online
              ? `${equipment.ping.latencyMs ?? '—'} ms`
              : 'Sem resposta'}
          </p>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <PlugZap size={15} />
            WinBox TCP
          </div>

          <p className={`mt-2 text-sm font-semibold ${equipment.winbox?.open ? 'text-emerald-400' : 'text-red-400'}`}>
            {equipment.winbox?.open
              ? `Porta ${equipment.winbox.port} aberta`
              : `Porta ${equipment.winbox?.port ?? 8291} fechada`}
          </p>
        </div>

      </div>

      {!equipment.ping?.online && equipment.winbox?.open && (
        <p className="mb-4 text-xs text-amber-400">
          ICMP sem resposta, mas o WinBox está acessível.
        </p>
      )}

      {equipment.ping?.online && !equipment.winbox?.open && (
        <p className="mb-4 text-xs text-amber-400">
          Equipamento responde ao ping, mas o WinBox está indisponível.
        </p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-4">

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock3 size={14} />
          {formatTime(equipment.checkedAt)}
        </div>

        <button
          type="button"
          disabled={!equipment.winbox?.open}
          title={
            equipment.winbox?.open
              ? 'Integração com WinBox será implementada em breve'
              : 'WinBox indisponível'
          }
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        >
          <PlugZap size={15} />
          Conectar
        </button>

      </div>

    </article>
  )
}

function Conexoes() {
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(null)
  const [search, setSearch] = useState('')

  const runningRef = useRef(false)

  const refresh = useCallback(async () => {
    if (runningRef.current) return

    runningRef.current = true
    setRefreshing(true)

    try {
      const results = await window.api.connectivity.checkAll()

      setEquipments(results)
      setLastUpdate(new Date())
      setError('')
    } catch (err) {
      console.error('Erro ao verificar equipamentos:', err)
      setError(err.message || 'Não foi possível verificar os equipamentos.')
    } finally {
      runningRef.current = false
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    refresh()

    const interval = setInterval(refresh, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [refresh])

  const onlineCount = equipments.filter(
    (equipment) => equipment.ping?.online || equipment.winbox?.open
  ).length

  const offlineCount = equipments.length - onlineCount

  const filteredEquipments = useMemo(() => {
    const term = search.trim().toLowerCase()
  
    if (!term) return equipments
  
    return equipments.filter((equipment) =>
      [equipment.name, equipment.host]
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [equipments, search])

  return (
    <>
      <Header
        title="Conexões"
        description="Acompanhe a disponibilidade dos seus equipamentos em tempo real."
      />

      <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">

        <StatCard
          title="Total de equipamentos"
          value={equipments.length}
          description="Equipamentos cadastrados"
          icon={Router}
          iconColor="text-blue-400"
        />

        <StatCard
          title="Online"
          value={onlineCount}
          description="Ping ou WinBox acessível"
          icon={Wifi}
          iconColor="text-emerald-400"
        />

        <StatCard
          title="Offline"
          value={offlineCount}
          description="Sem resposta nos dois testes"
          icon={WifiOff}
          iconColor="text-red-400"
        />

      </section>

      <section>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

          <div>
            <h3 className="text-lg font-semibold">
              Equipamentos monitorados
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Atualização automática a cada 30 segundos
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            Atualizar agora
          </button>

        </div>

        <div className="relative mb-5 max-w-md">
  <Search
    size={18}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
  />

  <input
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    placeholder="Pesquisar por nome ou IP..."
    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 pl-10 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500"
  />
</div>

        {lastUpdate && (
          <p className="mb-4 text-xs text-slate-500">
            Última atualização: {formatTime(lastUpdate)}
          </p>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <CircleX size={18} />
            {error}
          </div>
        )}

{loading ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center">
            <RefreshCw size={25} className="mx-auto animate-spin text-blue-400" />
            <p className="mt-4 text-sm text-slate-400">
              Verificando equipamentos...
            </p>
          </div>
        ) : equipments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
            <Router size={32} className="mx-auto text-slate-500" />

            <h3 className="mt-4 font-semibold text-slate-300">
              Nenhum equipamento cadastrado
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Cadastre seus MikroTiks na página Equipamentos para começar.
            </p>
          </div>
        ) : filteredEquipments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-10 text-center">
            <Router size={32} className="mx-auto text-slate-500" />

            <h3 className="mt-4 font-semibold text-slate-300">
              Nenhum equipamento encontrado
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Tente pesquisar utilizando outro nome ou endereço IP.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredEquipments.map((equipment) => (
              <EquipmentCard
                key={equipment.id}
                equipment={equipment}
              />
            ))}
          </div>
        )}

        <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
          {refreshing ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Verificando conectividade...
            </>
          ) : (
            <>
              <CircleCheck size={14} className="text-emerald-500" />
              Monitoramento ativo enquanto esta página estiver aberta.
            </>
          )}
        </div>

        

      </section>
    </>
  )
}

export default Conexoes
