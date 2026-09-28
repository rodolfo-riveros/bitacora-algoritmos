import React, { useEffect, useRef } from 'react';
import { Activity, Trash2 } from 'lucide-react';
import { LogEntry } from '../types';

interface OperationLogPanelProps {
  title?: string;
  logs: LogEntry[];
  onClear?: () => void;
}

export const OperationLogPanel: React.FC<OperationLogPanelProps> = ({
  title = 'Registro de Operaciones',
  logs,
  onClear,
}) => {
  const logTerminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 shadow-md flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#4cd7f6]" />
          <span className="font-mono text-xs font-bold text-[#dfe2f1]">{title}</span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-[#958ea0] hover:text-[#dfe2f1] text-[11px] font-mono flex items-center gap-1 transition-colors"
            type="button"
          >
            <Trash2 className="w-3 h-3" /> Limpiar
          </button>
        )}
      </div>

      <div
        ref={logTerminalRef}
        className="w-full h-44 bg-[#171b26] border border-[#262a35] rounded-lg p-2.5 font-mono text-xs overflow-y-auto flex flex-col gap-1 text-[#cbc3d7] shadow-inner"
      >
        {logs.length === 0 ? (
          <span className="text-[#958ea0] text-[11px]">Sin actividad todavía.</span>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-1.5 leading-snug ${
                log.type === 'push'
                  ? 'text-[#4cd7f6]'
                  : log.type === 'pop'
                  ? 'text-[#ffb95f]'
                  : log.type === 'error'
                  ? 'text-[#ffb4ab]'
                  : log.type === 'success'
                  ? 'text-[#4cd7f6] font-bold'
                  : 'text-[#958ea0] text-[11px]'
              }`}
            >
              <span className="text-[#958ea0] text-[10px] shrink-0 select-none">[{log.time}]</span>
              <span>{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
