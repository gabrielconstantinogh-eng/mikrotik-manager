
import { Router, Wifi, Activity } from 'lucide-react'

import Header from '../components/Header'
import StatCard from '../components/StatCard'
import EquipmentSection from '../components/EquipmentSection'

function Dashboard() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Visão geral da sua infraestrutura de rede."
      />

      <section className="mb-8 grid grid-cols-3 gap-5">

        <StatCard
          title="Equipamentos cadastrados"
          value="0"
          description="Total de MikroTiks"
          icon={Router}
          iconColor="text-blue-400"
        />

        <StatCard
          title="Online"
          value="0"
          description="Equipamentos disponíveis"
          icon={Wifi}
          iconColor="text-emerald-400"
        />

        <StatCard
          title="Conexões recentes"
          value="0"
          description="Histórico de acessos"
          icon={Activity}
          iconColor="text-purple-400"
        />

      </section>

      <EquipmentSection />
    </>
  )
}

export default Dashboard
