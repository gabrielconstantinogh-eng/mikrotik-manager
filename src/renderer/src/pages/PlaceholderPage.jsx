import Header from '../components/Header'

function PlaceholderPage({ title, description }) {
  return (
    <>
      <Header title={title} description={description} />

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-12 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>

        <p className="mt-2 text-sm text-slate-400">
          Esta seção está sendo preparada.
        </p>
      </section>
    </>
  )
}

export default PlaceholderPage
