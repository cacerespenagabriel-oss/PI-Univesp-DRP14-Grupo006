import { CloudUpload } from 'lucide-react';

export function UploadArea() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 text-blue-600">
        <CloudUpload size={24} />
        <h2 className="text-lg font-semibold text-slate-800">Upload de Planilha</h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">Envie um arquivo .xlsx ou .csv com os dados de frequência.</p>
      
      <div className="flex-1 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
        <CloudUpload size={48} className="text-slate-400 mb-4" />
        <p className="text-slate-600 font-medium mb-2">Arraste e solte seu arquivo aqui</p>
        <p className="text-slate-400 text-sm mb-4">ou</p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Selecionar Arquivo
        </button>
        <p className="text-xs text-slate-400 mt-6">Formatos aceitos: .xlsx, .csv (máx. 10MB)</p>
      </div>
    </div>
  );
}
