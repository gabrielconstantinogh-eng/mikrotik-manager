import { HashRouter, Routes, Route } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import PlaceholderPage from './pages/PlaceholderPage'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          <Route
            path="equipamentos"
            element={
              <PlaceholderPage
                title="Equipamentos"
                description="Gerencie seus roteadores MikroTik."
              />
            }
          />

          <Route
            path="conexoes"
            element={
              <PlaceholderPage
                title="Conexões"
                description="Gerencie suas conexões com os equipamentos."
              />
            }
          />

          <Route
            path="monitoramento"
            element={
              <PlaceholderPage
                title="Monitoramento"
                description="Acompanhe a disponibilidade da sua infraestrutura."
              />
            }
          />

          <Route
            path="configuracoes"
            element={
              <PlaceholderPage
                title="Configurações"
                description="Personalize o MikroTik Manager."
              />
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
