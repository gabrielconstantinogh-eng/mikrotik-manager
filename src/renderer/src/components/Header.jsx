import { Bell } from 'lucide-react'

function Header({ title, description }) {
  return (
    <header className="mb-10 flex items-center justify-between">

      <div>
        <h2 className="text-2xl font-bold">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          {description}
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
  )
}

export default Header
