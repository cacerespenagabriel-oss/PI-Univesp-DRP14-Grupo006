import { ListTodo, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

const records = [
  { id: 1, date: '07/08/2025', name: 'Ana Souza', status: 'Presente', time: '08:02' },
  { id: 2, date: '07/08/2025', name: 'Carlos Lima', status: 'Presente', time: '08:15' },
  { id: 3, date: '07/08/2025', name: 'Juliana Costa', status: 'Ausente', time: '-' },
  { id: 4, date: '07/08/2025', name: 'Rafael Oliveira', status: 'Presente', time: '07:58' },
  { id: 5, date: '07/08/2025', name: 'Mariana Alves', status: 'Ausente', time: '-' },
];

export function RecentRecordsTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 mt-6 flex flex-col">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2 text-slate-800">
        <ListTodo size={20} />
        <h2 className="text-lg font-semibold">Últimos Registros</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
              <th className="py-3 px-6 font-medium">Data</th>
              <th className="py-3 px-6 font-medium">Colaborador</th>
              <th className="py-3 px-6 font-medium">Status</th>
              <th className="py-3 px-6 font-medium">Horário</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {records.map((record) => (
              <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-6 text-slate-600">{record.date}</td>
                <td className="py-4 px-6 text-slate-800 font-medium">{record.name}</td>
                <td className="py-4 px-6">
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-xs font-medium border",
                    record.status === 'Presente' 
                      ? "bg-green-50 text-green-600 border-green-200" 
                      : "bg-red-50 text-red-600 border-red-200"
                  )}>
                    {record.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-600">{record.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Paginação */}
      <div className="p-4 flex items-center justify-end gap-2 border-t border-slate-100">
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium text-sm">
          1
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 font-medium text-sm transition-colors">
          2
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
