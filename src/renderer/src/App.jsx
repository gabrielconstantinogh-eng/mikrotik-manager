
import { HashRouter, Routes, Route } from 'react-router-dom'

import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Equipamentos from './pages/Equipamentos'
import PlaceholderPage from './pages/PlaceholderPage'
import Conexoes from './pages/Conexoes'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />

          <Route
            path="equipamentos"
            element={<Equipamentos />}
          />

          <Route
            path="conexoes"
            element={<Conexoes />}
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
