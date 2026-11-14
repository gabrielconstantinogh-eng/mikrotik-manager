
import { Plus, Server } from 'lucide-react'

function EquipmentSection() {
  return (
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
  )
}

export default EquipmentSection
