import { MainLayout } from '../layouts/MainLayout';
import { UploadArea } from '../components/UploadArea';
import { KpiCard } from '../components/KpiCard';
import { FrequencyChart } from '../components/FrequencyChart';
import { RecentRecordsTable } from '../components/RecentRecordsTable';
import { Users, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function Dashboard() {
  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lado Esquerdo - Upload */}
        <div className="lg:col-span-5">
          <UploadArea />
        </div>
        
        {/* Lado Direito - KPIs e Gráfico */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard 
              title="Total de Colaboradores" 
              value="42" 
              icon={<Users size={20} />} 
              variant="blue" 
            />
            <KpiCard 
              title="Presentes" 
              value="38" 
              percentage="90,5%" 
              icon={<CheckCircle2 size={20} />} 
              variant="green" 
            />
            <KpiCard 
              title="Ausentes" 
              value="4" 
              percentage="9,5%" 
              icon={<XCircle size={20} />} 
              variant="red" 
            />
            <KpiCard 
              title="Atrasos" 
              value="2" 
              percentage="4,8%" 
              icon={<Clock size={20} />} 
              variant="purple" 
            />
          </div>
          
          {/* Gráfico */}
          <div className="flex-1">
            <FrequencyChart />
          </div>
        </div>
      </div>
      
      {/* Tabela de Últimos Registros */}
      <RecentRecordsTable />
    </MainLayout>
  );
}
