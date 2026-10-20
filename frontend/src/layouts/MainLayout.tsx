import { type ReactNode } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <div className="px-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
          <Header />
          <main className="flex-1 pb-8">
            {children}
          </main>
          
          <footer className="py-6 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
            <p>Desenvolvido com React | HTML5 | CSS3 | JavaScript</p>
            <div className="flex items-center gap-2">
              <span className="text-xl">♿</span>
              <span>Acessível | WCAG 2.1</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
