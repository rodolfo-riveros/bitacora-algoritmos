import React from 'react';
import { ModuleId } from '../types';
import { RotateCcw, Home, Terminal } from 'lucide-react';

interface HeaderProps {
  activeModule: ModuleId;
  moduleTitle: string;
  onGoHome: () => void;
  onResetAll: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeModule, moduleTitle, onGoHome, onResetAll }) => {
  const isHome = activeModule === 'inicio';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f131d]/90 backdrop-blur-md border-b border-[#262a35]">
      <div className="h-14 w-full px-4 lg:px-6 flex items-center justify-between gap-4">
        <button type="button" onClick={onGoHome} className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#a078ff] to-[#4cd7f6] flex items-center justify-center shadow-[0_0_12px_rgba(160,120,255,0.3)]">
            <Terminal className="w-4 h-4 text-[#0f131d]" />
          </div>
          <span className="text-[13px] font-bold text-[#dfe2f1] whitespace-nowrap">
            <span className="sm:hidden">Bitácora</span>
            <span className="hidden sm:inline">Bitácora de Algoritmos</span>
          </span>
        </button>

        {!isHome && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#6b6678]">
            <span>Inicio</span>
            <span>/</span>
            <span className="text-[#4cd7f6] font-medium">{moduleTitle}</span>
          </div>
        )}

        {!isHome && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#958ea0] hover:text-[#dfe2f1] hover:bg-[#171b26] transition-colors text-xs font-medium"
              title="Volver al inicio"
              type="button"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </button>
            <button
              onClick={onResetAll}
              className="w-8 h-8 rounded-lg text-[#958ea0] hover:text-[#dfe2f1] hover:bg-[#171b26] flex items-center justify-center transition-colors"
              title="Reiniciar Simulación"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
