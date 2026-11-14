
function StatCard({ title, value, description, icon: Icon, iconColor }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {title}
        </span>

        <Icon size={21} className={iconColor} />
      </div>

      <h3 className="mt-5 text-3xl font-bold">
        {value}
      </h3>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

    </div>
  )
}

export default StatCard
