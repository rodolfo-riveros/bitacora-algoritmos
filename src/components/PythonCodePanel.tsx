import React, { useEffect, useRef } from 'react';
import { Play, AlertTriangle } from 'lucide-react';
import { CodeLine } from '../types';

interface PythonCodePanelProps {
  filename: string;
  lines: CodeLine[];
  activeLine: number | null;
  /** Plain-language description of what the active line is doing right now — the "focus" element. */
  caption?: string | null;
  /** 'error' tints the caption and the active line red — use for guard/underflow branches (empty pila/cola, etc). */
  tone?: 'default' | 'error';
}

export const PythonCodePanel: React.FC<PythonCodePanelProps> = ({
  filename,
  lines,
  activeLine,
  caption,
  tone = 'default',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const isError = tone === 'error' && !!caption;

  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeLine]);

  return (
    <div className="bg-[#0a0e18] border border-[#262a35] rounded-xl overflow-hidden flex flex-col h-full">
      {/* Titlebar */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-[#262a35] shrink-0">
        <span className="font-mono text-[11px] text-[#958ea0]">{filename}</span>
        <span className={`font-mono text-[11px] ${isError ? 'text-[#ffb4ab]' : 'text-[#4cd7f6]'}`}>
          {activeLine !== null ? `L.${activeLine}` : '—'}
        </span>
      </div>

      {/* Focus caption — what's happening right now, in plain language */}
      <div
        className={`px-4 py-2.5 flex items-start gap-2 border-b border-[#262a35] shrink-0 transition-colors ${
          isError ? 'bg-[#93000a]/20' : caption ? 'bg-[#4cd7f6]/10' : 'bg-transparent'
        }`}
      >
        {isError ? (
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#ffb4ab]" />
        ) : (
          <Play className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${caption ? 'text-[#4cd7f6]' : 'text-[#494454]'}`} />
        )}
        <p className={`text-xs leading-snug ${isError ? 'text-[#ffb4ab]' : caption ? 'text-[#dfe2f1]' : 'text-[#6b6678]'}`}>
          {caption ?? 'Elige una operación para ver el código en acción.'}
        </p>
      </div>

      {/* Code lines */}
      <div ref={containerRef} className="p-3 font-mono text-[13px] overflow-auto select-none flex-1">
        {lines.map((line) => {
          const isCurrent = line.num === activeLine;

          return (
            <div
              key={line.num}
              ref={isCurrent ? activeLineRef : undefined}
              className={`flex items-start rounded px-1.5 -mx-1.5 transition-colors ${
                isCurrent
                  ? isError
                    ? 'bg-[#ffb4ab]/15 shadow-[inset_3px_0_0_0_#ffb4ab]'
                    : 'bg-[#4cd7f6]/15 shadow-[inset_3px_0_0_0_#4cd7f6]'
                  : ''
              }`}
            >
              <span
                className={`w-6 shrink-0 text-right pr-3 text-[11px] ${
                  isCurrent ? (isError ? 'text-[#ffb4ab] font-bold' : 'text-[#4cd7f6] font-bold') : 'text-[#494454]'
                }`}
              >
                {line.num}
              </span>
              <span
                className={`py-0.5 flex-1 whitespace-pre-wrap break-words ${
                  line.isComment ? 'text-[#6b6678] italic' : isCurrent ? 'text-[#dfe2f1] font-semibold' : 'text-[#a8a3b5]'
                }`}
              >
                {line.code}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
