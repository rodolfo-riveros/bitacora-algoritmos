import React from 'react';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-[#262a35] py-4 px-4 lg:px-6 text-[#6b6678] text-xs">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <span>
          <strong className="text-[#958ea0]">Bitácora de Algoritmos</strong> — aprende estructuras de datos
          simulando cada paso.
        </span>
        <span>© {year}</span>
      </div>
    </footer>
  );
};
