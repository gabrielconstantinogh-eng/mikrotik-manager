
import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Router,
  X,
  Save,
  LoaderCircle,
  Eye,
  EyeOff
} from 'lucide-react'

import Header from '../components/Header'
import { equipmentService } from '../services/equipmentService'

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-500'

  const emptyForm = {
    name: '',
    host: '',
    port: '8291',
    username: 'admin',
    password: '',
    description: '',
    favorite: false
  }

function EquipmentModal({ equipment, onClose, onSave }) {
  const [form, setForm] = useState(
    equipment
      ? {
        name: equipment.name,
        host: equipment.host,
        port: String(equipment.port),
        username: equipment.username,
        password: '',
        description: equipment.description || '',
        favorite: Boolean(equipment.favorite)
      }
      : emptyForm
  )

  const [showPassword, setShowPassword] = useState(false)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      await onSave({
        ...form,
        port: Number(form.port)
      })
    } catch (err) {
      setError(err.message || 'Não foi possível salvar o equipamento.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {equipment ? 'Editar equipamento' : 'Novo equipamento'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Informe os dados de conexão do MikroTik.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-sm text-slate-300">
              Nome do equipamento
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex.: MikroTik Matriz"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="mb-1.5 block text-sm text-slate-300">
                Endereço IP / Host
              </label>
              <input
                name="host"
                value={form.host}
                onChange={handleChange}
                placeholder="192.168.88.1"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm text-slate-300">
                Porta
              </label>
              <input
                name="port"
                type="number"
                min="1"
                max="65535"
                value={form.port}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-slate-300">
              Usuário
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="admin"
              className={inputClass}
              required
            />
          </div>


<div>
  <label className="mb-1.5 block text-sm text-slate-300">
    Senha
  </label>

  <div className="relative">
    <input
      name="password"
      type={showPassword ? 'text' : 'password'}
      value={form.password}
      onChange={handleChange}
      placeholder={
        equipment
          ? 'Deixe vazio para manter a senha atual'
          : 'Senha do MikroTik (opcional)'
      }
      autoComplete="new-password"
      className={`${inputClass} pr-11`}
    />

    <button
      type="button"
      onClick={() => setShowPassword((current) => !current)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200"
      title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  {equipment && (
    <p className="mt-1.5 text-xs text-slate-500">
      Por segurança, a senha atual não é exibida. Informe uma nova senha
      somente se desejar substituí-la.
    </p>
  )}
</div>


          <div>
            <label className="mb-1.5 block text-sm text-slate-300">
              Descrição
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Localização ou observações sobre o equipamento"
              rows={3}
              className={inputClass}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              name="favorite"
              checked={form.favorite}
              onChange={handleChange}
              className="h-4 w-4 accent-blue-500"
            />
            Adicionar aos favoritos
          </label>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {saving ? 'Salvando...' : 'Salvar equipamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Equipamentos() {
  const [equipments, setEquipments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  async function loadEquipments() {
    setLoading(true)
    setPageError('')

    try {
      const data = await equipmentService.list()
      setEquipments(data)
    } catch (error) {
      setPageError(error.message || 'Erro ao carregar equipamentos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEquipments()
  }, [])

  const filteredEquipments = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return equipments

    return equipments.filter((equipment) =>
      [
        equipment.name,
        equipment.host,
        equipment.username,
        equipment.description
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)
    )
  }, [equipments, search])

  function openNewModal() {
    setSelectedEquipment(null)
    setModalOpen(true)
  }

  function openEditModal(equipment) {
    setSelectedEquipment(equipment)
    setModalOpen(true)
  }

  async function handleSave(data) {
    if (selectedEquipment) {
      await equipmentService.update(selectedEquipment.id, data)
    } else {
      await equipmentService.create(data)
    }

    setModalOpen(false)
    setSelectedEquipment(null)
    await loadEquipments()
  }

  async function handleDelete(equipment) {
    const confirmed = window.confirm(
      `Deseja realmente excluir "${equipment.name}"?`
    )

    if (!confirmed) return

    try {
      await equipmentService.delete(equipment.id)
      await loadEquipments()
    } catch (error) {
      setPageError(error.message || 'Não foi possível excluir o equipamento.')
    }
  }

  async function toggleFavorite(equipment) {
    try {
      await equipmentService.update(equipment.id, {
        ...equipment,
        favorite: !Boolean(equipment.favorite)
      })

      await loadEquipments()
    } catch (error) {
      setPageError(error.message || 'Não foi possível atualizar o favorito.')
    }
  }

  return (
    <>
      <Header
        title="Equipamentos"
        description="Gerencie seus roteadores MikroTik."
      />

      <section className="mt-8 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Seus equipamentos
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {equipments.length} equipamento(s) cadastrado(s)
            </p>
          </div>

          <button
            onClick={openNewModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <Plus size={18} />
            Adicionar equipamento
          </button>
        </div>

        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar por nome, IP ou descrição..."
            className={`${inputClass} pl-10`}
          />
        </div>

        {pageError && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {pageError}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-400">
              <LoaderCircle size={20} className="animate-spin" />
              Carregando equipamentos...
            </div>
          ) : filteredEquipments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Router size={36} className="mb-4 text-slate-600" />

              <h3 className="font-medium text-slate-200">
                {search
                  ? 'Nenhum equipamento encontrado'
                  : 'Nenhum equipamento cadastrado'}
              </h3>

              <p className="mt-2 max-w-sm text-sm text-slate-500">
                {search
                  ? 'Tente pesquisar utilizando outro termo.'
                  : 'Adicione seu primeiro MikroTik para começar a organizar sua infraestrutura.'}
              </p>

              {!search && (
                <button
                  onClick={openNewModal}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
                >
                  <Plus size={16} />
                  Cadastrar primeiro equipamento
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Equipamento</th>
                    <th className="px-5 py-4 font-medium">Endereço</th>
                    <th className="px-5 py-4 font-medium">Usuário</th>
                    <th className="px-5 py-4 text-right font-medium">Ações</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredEquipments.map((equipment) => (
                    <tr
                      key={equipment.id}
                      className="transition hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                            <Router size={19} />
                          </div>

                          <div>
                            <div className="font-medium text-slate-100">
                              {equipment.name}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {equipment.description || 'Sem descrição'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-slate-200">{equipment.host}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Porta {equipment.port}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {equipment.username}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => toggleFavorite(equipment)}
                            title="Alternar favorito"
                            className={`rounded-lg p-2 transition hover:bg-slate-700 ${
                              equipment.favorite
                                ? 'text-amber-400'
                                : 'text-slate-500 hover:text-amber-400'
                            }`}
                          >
                            <Star
                              size={17}
                              fill={equipment.favorite ? 'currentColor' : 'none'}
                            />
                          </button>

                          <button
                            onClick={() => openEditModal(equipment)}
                            title="Editar equipamento"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-blue-400"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            onClick={() => handleDelete(equipment)}
                            title="Excluir equipamento"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700 hover:text-red-400"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {modalOpen && (
        <EquipmentModal
          equipment={selectedEquipment}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  )
}

export default Equipamentos
