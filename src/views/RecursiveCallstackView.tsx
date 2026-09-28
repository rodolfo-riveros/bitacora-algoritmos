import React, { useState, useEffect } from 'react';
import { CodeLanguage } from '../types';
import {
  ArrowDown,
  Play,
  RotateCcw,
  Redo,
  CornerDownRight,
  AlertTriangle,
  Bug,
  Cpu,
  Layers,
  Terminal,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface CodeTemplate {
  filename: string;
  lines: { num: number; code: string; isComment?: boolean }[];
}

const CODE_TEMPLATES: Record<CodeLanguage, CodeTemplate> = {
  python: {
    filename: 'hanoi_recursive.py',
    lines: [
      { num: 1, code: 'def hanoi(n, origen, destino, auxiliar):' },
      { num: 2, code: '    # Caso Base: n == 1 movimiento directo', isComment: true },
      { num: 3, code: '    if n == 1:' },
      { num: 4, code: '        disco = origen.pop()' },
      { num: 5, code: '        destino.push(disco)' },
      { num: 6, code: '        registrar_movimiento(disco, origen, destino)' },
      { num: 7, code: '        return' },
      { num: 8, code: '    ' },
      { num: 9, code: '    # Paso 1: Mover n-1 discos a la torre auxiliar', isComment: true },
      { num: 10, code: '    hanoi(n - 1, origen, auxiliar, destino)' },
      { num: 11, code: '    disco = origen.pop()' },
      { num: 12, code: '    destino.push(disco)' },
      { num: 13, code: '    # Paso 3: Mover los n-1 discos desde auxiliar a destino', isComment: true },
      { num: 14, code: '    hanoi(n - 1, auxiliar, destino, origen)' },
    ],
  },
  javascript: {
    filename: 'hanoi_recursive.js',
    lines: [
      { num: 1, code: 'function hanoi(n, origen, destino, auxiliar) {' },
      { num: 2, code: '  // Caso Base: n == 1 movimiento directo', isComment: true },
      { num: 3, code: '  if (n === 1) {' },
      { num: 4, code: '    const disco = origen.pop();' },
      { num: 5, code: '    destino.push(disco);' },
      { num: 6, code: '    registrarMovimiento(disco, origen, destino);' },
      { num: 7, code: '    return;' },
      { num: 8, code: '  }' },
      { num: 9, code: '  // Paso 1: Mover n-1 a auxiliar', isComment: true },
      { num: 10, code: '  hanoi(n - 1, origen, auxiliar, destino);' },
      { num: 11, code: '  const disco = origen.pop();' },
      { num: 12, code: '  destino.push(disco);' },
      { num: 13, code: '  // Paso 3: Mover n-1 a destino', isComment: true },
      { num: 14, code: '  hanoi(n - 1, auxiliar, destino, origen);' },
    ],
  },
  cpp: {
    filename: 'hanoi_recursive.cpp',
    lines: [
      { num: 1, code: 'void hanoi(int n, Stack& origen, Stack& destino, Stack& auxiliar) {' },
      { num: 2, code: '    // Caso Base: n == 1 movimiento directo', isComment: true },
      { num: 3, code: '    if (n == 1) {' },
      { num: 4, code: '        int disco = origen.pop();' },
      { num: 5, code: '        destino.push(disco);' },
      { num: 6, code: '        registrar_movimiento(disco, origen, destino);' },
      { num: 7, code: '        return;' },
      { num: 8, code: '    }' },
      { num: 9, code: '    // Paso 1: Subproblema 1', isComment: true },
      { num: 10, code: '    hanoi(n - 1, origen, auxiliar, destino);' },
      { num: 11, code: '    int disco = origen.pop();' },
      { num: 12, code: '    destino.push(disco);' },
      { num: 13, code: '    // Paso 3: Subproblema 2', isComment: true },
      { num: 14, code: '    hanoi(n - 1, auxiliar, destino, origen);' },
    ],
  },
  java: {
    filename: 'HanoiRecursive.java',
    lines: [
      { num: 1, code: 'public static void hanoi(int n, Stack<Integer> orig, Stack<Integer> dest, Stack<Integer> aux) {' },
      { num: 2, code: '    // Caso Base: n == 1 movimiento directo', isComment: true },
      { num: 3, code: '    if (n == 1) {' },
      { num: 4, code: '        int disco = orig.pop();' },
      { num: 5, code: '        dest.push(disco);' },
      { num: 6, code: '        registrarMovimiento(disco, orig, dest);' },
      { num: 7, code: '        return;' },
      { num: 8, code: '    }' },
      { num: 9, code: '    // Paso 1: Mover n-1 a auxiliar', isComment: true },
      { num: 10, code: '    hanoi(n - 1, orig, aux, dest);' },
      { num: 11, code: '    int disco = orig.pop();' },
      { num: 12, code: '    dest.push(disco);' },
      { num: 13, code: '    // Paso 3: Mover n-1 a destino', isComment: true },
      { num: 14, code: '    hanoi(n - 1, aux, dest, orig);' },
    ],
  },
};

export const RecursiveCallstackView: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<CodeLanguage>('python');
  const [activeLine, setActiveLine] = useState(11);
  const [selectedFrameIndex, setSelectedFrameIndex] = useState(0);
  const [breakpoints, setBreakpoints] = useState<number[]>([1, 3, 11]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSimulatingOverflow, setIsSimulatingOverflow] = useState(false);
  const [overflowDepth, setOverflowDepth] = useState(0);
  const [activeTreeNode, setActiveTreeNode] = useState('leaf-1');

  // Step frames
  const frames = [
    {
      id: 'frame-4',
      name: "Frame #4 • hanoi(1, 'A', 'B', 'C')",
      status: 'ACTIVO',
      args: "Args: n=1, from=A, to=B",
      ret: "Retorno: Line 7 (Base Hit)",
      offset: "+64 Bytes",
      stateDesc: "Estado: Pop inmediato",
      isTop: true,
      color: 'border-[#4cd7f6] bg-[#313540]',
      dotColor: 'bg-[#4cd7f6]',
      line: 3,
    },
    {
      id: 'frame-3',
      name: "Frame #3 • hanoi(2, 'A', 'C', 'B')",
      status: 'Suspendido: L11',
      args: "Args: n=2, from=A, to=C",
      ret: "PC Resumen: Line 11 (pop/push)",
      offset: "+64 Bytes",
      stateDesc: "Espera Frame 4",
      isTop: false,
      color: 'border-[#262a35] bg-[#262a35]/90',
      dotColor: 'bg-[#d0bcff]',
      line: 11,
    },
    {
      id: 'frame-2',
      name: "Frame #2 • hanoi(3, 'A', 'B', 'C')",
      status: 'Suspendido: L10',
      args: "Args: n=3, from=A, to=B",
      ret: "PC Resumen: Line 10 (Paso 1)",
      offset: "+64 Bytes",
      stateDesc: "Espera Frame 3",
      isTop: false,
      color: 'border-[#262a35] bg-[#1c1f2a]/80',
      dotColor: 'bg-[#958ea0]',
      line: 10,
    },
    {
      id: 'frame-1',
      name: "Frame #1 • __main__()",
      status: 'Base de Pila',
      args: "Invocación inicial: n=3",
      ret: "Base Pointer: 0x00010",
      offset: "+128 Bytes",
      stateDesc: "Punto de Entrada",
      isTop: false,
      color: 'border-[#262a35] bg-[#171b26]/60',
      dotColor: 'bg-[#494454]',
      line: 1,
    },
  ];

  // Scope Registers corresponding to the selected frame
  const scopeData = [
    { sym: 'n', type: 'int', val: selectedFrameIndex === 0 ? '1' : selectedFrameIndex === 1 ? '2' : '3', mem: '● Evaluando subproblema', hex: '0x7FFEE382A' },
    { sym: 'origen', type: 'LIFO Stack Ref', val: "'Stack_A' [Top: Disco #2]", mem: 'Referencia viva', hex: '0x7FFEE382A' },
    { sym: 'destino', type: 'LIFO Stack Ref', val: "'Stack_B' [Empty]", mem: 'Referencia viva', hex: '0x7FFEE383C' },
    { sym: 'auxiliar', type: 'LIFO Stack Ref', val: "'Stack_C' [Top: Disco #1]", mem: 'Referencia viva', hex: '0x7FFEE384E' },
    { sym: 'disco (retorno)', type: 'DiskNode', val: 'origen.pop() ➔ Disco #2', mem: 'Listo para PUSH en Destino', hex: '0x7FFEE3860' },
  ];

  // Toggle breakpoint
  const toggleBreakpoint = (lineNum: number) => {
    setBreakpoints((prev) =>
      prev.includes(lineNum) ? prev.filter((l) => l !== lineNum) : [...prev, lineNum]
    );
  };

  // Stepping forward
  const handleStepInto = () => {
    const sequence = [1, 3, 4, 5, 6, 7, 10, 11, 12, 14];
    const currentIndex = sequence.indexOf(activeLine);
    const nextLine = sequence[(currentIndex + 1) % sequence.length];
    setActiveLine(nextLine);
  };

  const handleStepOver = () => {
    setActiveLine((prev) => (prev === 11 ? 12 : prev === 12 ? 14 : 11));
  };

  // Stack Overflow simulation
  const handleSimulateOverflow = () => {
    if (isSimulatingOverflow) return;
    setIsSimulatingOverflow(true);
    setOverflowDepth(4);

    let depth = 4;
    const interval = setInterval(() => {
      depth += Math.floor(Math.random() * 80) + 70;
      setOverflowDepth(depth);
      if (depth >= 1024) {
        clearInterval(interval);
      }
    }, 100);
  };

  const currentTemplate = CODE_TEMPLATES[selectedLang];

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Header */}
      <div className="w-full px-4 lg:px-6 pt-6 pb-3.5">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">Recursión & Call Stack</h1>
            <p className="text-xs text-[#958ea0] mt-0.5">
              Cada llamada recursiva es un nuevo marco en la pila del sistema — profundidad actual:{' '}
              <strong className="text-[#dfe2f1]">{isSimulatingOverflow ? overflowDepth : 4}</strong> / 1024
            </p>
          </div>

          {/* Debugger & Language Operational Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto">
            {/* Language Selector */}
            <div className="flex items-center bg-[#0a0e18] p-1 rounded-lg border border-[#262a35] shadow-inner">
              {(['python', 'javascript', 'cpp', 'java'] as CodeLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLang(lang)}
                  type="button"
                  className={`px-3 py-1 rounded font-mono text-xs transition-all ${
                    selectedLang === lang
                      ? 'bg-[#d0bcff] text-[#3c0091] font-bold shadow-sm'
                      : 'text-[#cbc3d7] hover:text-[#dfe2f1]'
                  }`}
                >
                  {lang === 'python' ? 'Python' : lang === 'javascript' ? 'JavaScript' : lang === 'cpp' ? 'C++' : 'Java'}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-[#262a35] hidden sm:block"></div>

            {/* Stepper Controls */}
            <div className="flex items-center gap-1 bg-[#0a0e18] p-1 rounded-lg border border-[#262a35]">
              <button
                onClick={handleStepInto}
                className="flex items-center gap-1 px-3 py-1 rounded bg-[#262a35] hover:bg-[#313540] text-[#4cd7f6] font-mono text-xs transition-all"
                title="Entrar a función (Step Into)"
                type="button"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Step Into</span>
              </button>

              <button
                onClick={handleStepOver}
                className="flex items-center gap-1 px-3 py-1 rounded bg-[#262a35] hover:bg-[#313540] text-[#d0bcff] font-mono text-xs transition-all"
                title="Siguiente línea (Step Over)"
                type="button"
              >
                <Redo className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Step Over</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  if (!isPlaying) {
                    const timer = setInterval(handleStepInto, 600);
                    setTimeout(() => clearInterval(timer), 3600);
                  }
                }}
                className="flex items-center gap-1 px-3 py-1 rounded bg-[#03b5d3] hover:bg-[#4cd7f6] text-[#001f26] font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(76,215,246,0.3)]"
                title="Continuar (Run)"
                type="button"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
              </button>

              <button
                onClick={() => {
                  setActiveLine(11);
                  setIsSimulatingOverflow(false);
                  setOverflowDepth(4);
                }}
                className="w-7 h-7 flex items-center justify-center rounded bg-[#262a35] text-[#cbc3d7] hover:text-[#ffb4ab] transition-all"
                title="Reiniciar Depuración"
                type="button"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Grid */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Source Trace, Breakpoints & Scope Context (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Code Debugger Window */}
          <div className="bg-[#0a0e18] border border-[#262a35] rounded-xl overflow-hidden shadow-xl flex flex-col">
            {/* Window Titlebar */}
            <div className="bg-[#262a35] px-4 py-2 flex items-center justify-between border-b border-[#313540]">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ffb4ab]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#ffb95f]"></span>
                  <span className="w-3 h-3 rounded-full bg-[#4cd7f6]"></span>
                </div>
                <span className="font-mono text-xs text-[#cbc3d7] flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#d0bcff]" />
                  {currentTemplate.filename}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#0a0e18] text-[#4cd7f6] font-mono text-[11px] border border-[#313540]">
                  Puntero: Línea {activeLine}
                </span>
                <span className="font-mono text-[11px] text-[#958ea0]">UTF-8</span>
              </div>
            </div>

            {/* Code lines */}
            <div className="p-3 font-mono text-xs overflow-x-auto select-none bg-[#0a0e18]">
              {currentTemplate.lines.map((line) => {
                const isCurrent = line.num === activeLine;
                const hasBreakpoint = breakpoints.includes(line.num);

                return (
                  <div
                    key={line.num}
                    className={`flex items-center rounded px-1 transition-colors ${
                      isCurrent
                        ? 'bg-[#4cd7f6]/15 shadow-[inset_3px_0_0_0_#4cd7f6]'
                        : 'hover:bg-[#171b26]/60'
                    }`}
                  >
                    {/* Breakpoint indicator */}
                    <span
                      onClick={() => toggleBreakpoint(line.num)}
                      className={`w-6 text-center cursor-pointer transition-colors ${
                        hasBreakpoint
                          ? 'text-[#ffb4ab] animate-pulse'
                          : 'text-[#958ea0]/20 hover:text-[#d0bcff]'
                      }`}
                      title={hasBreakpoint ? 'Quitar Breakpoint' : 'Agregar Breakpoint'}
                    >
                      ●
                    </span>

                    {/* Line number */}
                    <span
                      className={`w-6 text-right pr-3 font-mono text-[11px] ${
                        isCurrent ? 'text-[#4cd7f6] font-bold' : 'text-[#958ea0]/50'
                      }`}
                    >
                      {line.num}
                    </span>

                    {/* Line Code */}
                    <span
                      className={`py-0.5 flex-1 ${
                        line.isComment
                          ? 'text-[#958ea0] italic'
                          : isCurrent
                          ? 'text-[#dfe2f1] font-semibold flex items-center gap-2'
                          : 'text-[#cbc3d7]'
                      }`}
                    >
                      <span>{line.code}</span>
                      {isCurrent && (
                        <span className="text-[#4cd7f6] font-mono text-[10px] uppercase bg-[#0a0e18] px-1.5 py-0.5 rounded border border-[#4cd7f6]/40 shadow-sm shrink-0">
                          ◄ Stack Pointer (SP)
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scope Registers & Variable Inspector */}
          <div className="bg-[#171b26] border border-[#262a35] rounded-xl p-4 shadow-md flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#dfe2f1] font-mono text-xs font-semibold">
                <Activity className="w-4 h-4 text-[#4cd7f6]" />
                <span>Inspección de Alcance (Scope Registers: Frame #{4 - selectedFrameIndex})</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#262a35] text-[#ffb95f] border border-[#ffb95f]/30">
                Activo: Contexto Local
              </span>
            </div>

            {/* Scope Table */}
            <div className="overflow-x-auto rounded-lg bg-[#0a0e18] border border-[#262a35]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#262a35] text-[#958ea0] text-[10px] uppercase border-b border-[#313540]">
                  <tr>
                    <th className="py-2 px-3">Símbolo (Identificador)</th>
                    <th className="py-2 px-3">Tipo</th>
                    <th className="py-2 px-3">Valor / Referencia LIFO</th>
                    <th className="py-2 px-3">Estado de Memoria</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#262a35] text-[#dfe2f1]">
                  {scopeData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#171b26]/50">
                      <td className="py-2 px-3 font-bold text-[#4cd7f6]">{row.sym}</td>
                      <td className="py-2 px-3 text-[#958ea0]">{row.type}</td>
                      <td className="py-2 px-3">
                        <span className="px-1.5 py-0.5 rounded bg-[#1c1f2a] font-bold text-[#d0bcff]">
                          {row.val}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#4cd7f6] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4cd7f6]"></span>
                        <span>{row.mem}</span>
                        <span className="text-[10px] text-[#958ea0] ml-1">({row.hex})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Call Stack (LIFO in Memory) (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#171b26] border border-[#262a35] rounded-xl p-4 shadow-xl flex flex-col flex-1">
            <div className="flex items-center justify-between pb-2 border-b border-[#262a35]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#d0bcff]" />
                <h2 className="text-base font-bold text-[#dfe2f1]">Pila de Ejecución (Call Stack)</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#a078ff] text-[#340080] font-mono text-[10px] font-bold uppercase tracking-wider">
                LIFO ACTIVE
              </span>
            </div>

            <p className="text-xs text-[#cbc3d7] py-2">
              Estructura de datos en memoria física: el último marco apilado (Push) es el primero en desapilarse (Pop) al alcanzar <code className="text-[#ffb95f] font-mono">return</code>.
            </p>

            {/* Vertical Stack Representation */}
            <div className="flex-1 flex flex-col justify-end bg-[#0a0e18] border border-[#262a35] rounded-xl p-3 relative min-h-[380px] shadow-inner">
              {/* Stack Top Pointer Annotation */}
              <div className="flex items-center justify-between py-1 mb-2 px-3 bg-[#4cd7f6]/10 rounded border-l-2 border-[#4cd7f6] animate-pulse">
                <span className="font-mono text-xs text-[#4cd7f6] font-bold flex items-center gap-1">
                  <ArrowDown className="w-3.5 h-3.5" /> TOP OF STACK (SP)
                </span>
                <span className="font-mono text-[10px] text-[#cbc3d7]">Dirección: 0x00A4F</span>
              </div>

              {/* Stack Frames List */}
              <div className="flex flex-col gap-2 w-full">
                {frames.map((frame, index) => {
                  const isSelected = selectedFrameIndex === index;

                  return (
                    <div
                      key={frame.id}
                      onClick={() => {
                        setSelectedFrameIndex(index);
                        setActiveLine(frame.line);
                      }}
                      className={`relative rounded-lg p-2.5 transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-[#4cd7f6] ring-1 ring-[#4cd7f6] bg-[#313540] shadow-[0_0_14px_rgba(76,215,246,0.25)]'
                          : `${frame.color} hover:border-[#4cd7f6]/40`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${frame.dotColor} ${frame.isTop ? 'animate-ping' : ''}`}></span>
                          <span className="font-mono text-xs font-bold text-[#dfe2f1]">{frame.name}</span>
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[9px] uppercase font-bold tracking-wider ${
                            frame.isTop
                              ? 'bg-[#4cd7f6] text-[#003640]'
                              : 'bg-[#0a0e18] text-[#958ea0] border border-[#262a35]'
                          }`}
                        >
                          {frame.status}
                        </span>
                      </div>

                      <div className="mt-2 text-[#cbc3d7] font-mono text-[11px] grid grid-cols-2 gap-1 bg-[#0a0e18]/80 p-2 rounded border border-[#262a35]/60">
                        <div><span className="text-[#958ea0]">{frame.args}</span></div>
                        <div><span className="text-[#958ea0]">{frame.ret}</span></div>
                        <div><span className="text-[#958ea0]">Offset Mem:</span> {frame.offset}</div>
                        <div className="text-[#ffb95f] font-semibold">{frame.stateDesc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Stack Floor Indicator */}
              <div className="w-full mt-3 pt-2 text-center text-[#958ea0]/70 font-mono text-[10px] uppercase tracking-widest bg-[#262a35]/40 rounded border border-[#313540]">
                — Límite de Memoria Base (Stack Segment Base) —
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Section: Recursion Tree Visualizer */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-6 pb-4">
        <div className="bg-[#171b26] border border-[#262a35] rounded-xl p-4 lg:p-6 shadow-lg flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-[#dfe2f1] flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#d0bcff]" />
                Árbol de Recursión Binaria (Invocation Dependency Graph)
              </h3>
              <p className="text-xs text-[#cbc3d7]">
                Representación de las 2ⁿ - 1 llamadas requeridas para n=3 (7 invocaciones totales en orden DFS).
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono bg-[#0a0e18] px-3 py-1.5 rounded-lg border border-[#262a35]">
              <span className="flex items-center gap-1 text-[#4cd7f6]">
                <span className="w-2 h-2 rounded-full bg-[#4cd7f6]"></span> Activo
              </span>
              <span className="flex items-center gap-1 text-[#d0bcff]">
                <span className="w-2 h-2 rounded-full bg-[#d0bcff]"></span> Finalizado
              </span>
              <span className="flex items-center gap-1 text-[#958ea0]">
                <span className="w-2 h-2 rounded-full bg-[#313540]"></span> Pendiente
              </span>
            </div>
          </div>

          {/* Interactive SVG Tree */}
          <div className="w-full bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 overflow-x-auto relative flex flex-col items-center">
            {/* SVG Connecting Paths */}
            <svg className="w-[720px] h-[180px] absolute inset-0 pointer-events-none mx-auto left-0 right-0" viewBox="0 0 720 180">
              {/* Root to Level 1 Left */}
              <path d="M 360 36 L 190 85" stroke="#a078ff" strokeWidth="2" strokeDasharray="4 2" />
              {/* Root to Level 1 Right */}
              <path d="M 360 36 L 530 85" stroke="#494454" strokeWidth="2" />
              {/* L1 Left to L2 Left */}
              <path d="M 190 95 L 100 145" stroke="#4cd7f6" strokeWidth="2.5" />
              {/* L1 Left to L2 Right */}
              <path d="M 190 95 L 280 145" stroke="#494454" strokeWidth="2" />
              {/* L1 Right to L2 Left */}
              <path d="M 530 95 L 440 145" stroke="#313540" strokeWidth="2" />
              {/* L1 Right to L2 Right */}
              <path d="M 530 95 L 620 145" stroke="#313540" strokeWidth="2" />
            </svg>

            <div className="w-[720px] flex flex-col items-center gap-6 relative z-10 py-1">
              {/* Level 0 (Root) */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setActiveTreeNode('root')}
                  className={`px-4 py-1.5 rounded-lg border font-mono text-xs shadow-md flex items-center gap-2 transition-all ${
                    activeTreeNode === 'root'
                      ? 'bg-[#d0bcff] text-[#3c0091] border-[#d0bcff] font-bold shadow-[0_0_12px_rgba(208,188,255,0.4)]'
                      : 'bg-[#262a35] text-[#dfe2f1] border-[#313540]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#d0bcff]"></span>
                  <span>h(3, A, C, B)</span>
                  <span className="text-[10px] font-bold text-[#ffb95f]">[1ᵃ Llamada]</span>
                </button>
              </div>

              {/* Level 1 */}
              <div className="w-full flex justify-around px-8">
                <button
                  type="button"
                  onClick={() => setActiveTreeNode('sub-1')}
                  className={`px-4 py-1.5 rounded-lg border font-mono text-xs shadow-md flex items-center gap-2 transition-all ${
                    activeTreeNode === 'sub-1'
                      ? 'bg-[#d0bcff] text-[#3c0091] border-[#d0bcff] font-bold shadow-[0_0_12px_rgba(208,188,255,0.4)]'
                      : 'bg-[#262a35] text-[#dfe2f1] border-[#313540]'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#d0bcff]"></span>
                  <span>h(2, A, B, C)</span>
                  <span className="text-[10px] font-bold text-[#4cd7f6]">[Paso 1]</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTreeNode('sub-2')}
                  className="px-4 py-1.5 rounded-lg bg-[#1c1f2a] text-[#958ea0] border border-[#262a35] font-mono text-xs shadow-md flex items-center gap-2 opacity-70 hover:opacity-100"
                >
                  <span className="w-2 h-2 rounded-full bg-[#313540]"></span>
                  <span>h(2, B, C, A)</span>
                  <span className="text-[10px] text-[#958ea0]">[Paso 3]</span>
                </button>
              </div>

              {/* Level 2 (Leaves) */}
              <div className="w-full flex justify-between px-2">
                {/* Active Leaf */}
                <button
                  type="button"
                  onClick={() => setActiveTreeNode('leaf-1')}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs flex items-center gap-1.5 font-bold transition-all shadow-md ${
                    activeTreeNode === 'leaf-1'
                      ? 'bg-[#4cd7f6] text-[#003640] border border-[#acedff] shadow-[0_0_14px_rgba(76,215,246,0.5)] animate-pulse'
                      : 'bg-[#262a35] text-[#4cd7f6] border-[#4cd7f6]/40'
                  }`}
                >
                  <span>➔ h(1, A, C, B)</span>
                  <span className="text-[10px] bg-[#0a0e18] text-[#4cd7f6] px-1 py-0.5 rounded">
                    [Llamada #3]
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTreeNode('leaf-2')}
                  className="px-3 py-1.5 rounded-lg bg-[#1c1f2a] text-[#958ea0] border border-[#262a35] font-mono text-xs opacity-60 hover:opacity-90"
                >
                  <span>h(1, B, C, A)</span>
                  <span className="text-[10px] text-[#958ea0] ml-1">[Pendiente]</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTreeNode('leaf-3')}
                  className="px-3 py-1.5 rounded-lg bg-[#1c1f2a] text-[#958ea0] border border-[#262a35] font-mono text-xs opacity-50 hover:opacity-80"
                >
                  <span>h(1, B, A, C)</span>
                  <span className="text-[10px] text-[#958ea0] ml-1">[Pendiente]</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTreeNode('leaf-4')}
                  className="px-3 py-1.5 rounded-lg bg-[#1c1f2a] text-[#958ea0] border border-[#262a35] font-mono text-xs opacity-50 hover:opacity-80"
                >
                  <span>h(1, A, C, B)</span>
                  <span className="text-[10px] text-[#958ea0] ml-1">[Pendiente]</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Didactic Deep-Dive & Stack Overflow Prevention Note */}
      <div className="max-w-7xl mx-auto w-full px-4 lg:px-6 pb-6">
        <div className="rounded-xl p-4 lg:p-6 bg-gradient-to-r from-[#171b26] via-[#1c1f2a] to-[#171b26] border border-[#262a35] shadow-lg flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#93000a]/40 border border-[#ffb4ab]/30 text-[#ffb4ab] flex items-center justify-center shrink-0 shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <h4 className="text-base font-bold text-[#dfe2f1] flex items-center gap-2">
              <span>¿Cómo ocurre un desbordamiento de pila (Stack Overflow)?</span>
              <span className="px-2 py-0.5 rounded bg-[#93000a]/60 text-[#ffb4ab] font-mono text-xs font-bold border border-[#ffb4ab]/20">
                RecursionError
              </span>
            </h4>
            <p className="text-xs text-[#cbc3d7] leading-relaxed">
              Cada llamada recursiva asigna un nuevo <strong className="text-[#d0bcff]">Stack Frame</strong> en la memoria del hilo (consumiendo parámetros, variables locales y dirección de retorno). Si el <strong className="text-[#ffb95f]">Caso Base (n == 1)</strong> no se define o la condición de parada falla, la función se invocará infinitamente hacia valores negativos (<code className="font-mono text-[#4cd7f6]">n = -1, -2, -3...</code>) hasta agotar el límite de memoria asignado al proceso (por defecto 1000 llamadas en Python), provocando un colapso irrecuperable por sobrecupo en el stack.
            </p>
            {isSimulatingOverflow && (
              <div className="mt-2 p-2 bg-[#0a0e18] border border-[#ffb4ab]/40 rounded text-xs font-mono text-[#ffb4ab] flex items-center justify-between">
                <span>Depth: {overflowDepth} frames apilados</span>
                {overflowDepth >= 1024 ? (
                  <span className="font-bold text-[#ffb4ab] animate-pulse">
                    FATAL: RecursionError: maximum recursion depth exceeded!
                  </span>
                ) : (
                  <span className="text-[#ffb95f] animate-pulse">Apilando marcos infinitamente...</span>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 flex md:flex-col gap-2 w-full md:w-auto">
            <button
              onClick={handleSimulateOverflow}
              disabled={isSimulatingOverflow}
              className="w-full px-4 py-2 rounded-lg bg-[#262a35] hover:bg-[#313540] border border-[#262a35] hover:border-[#ffb4ab]/40 text-[#dfe2f1] font-mono text-xs flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50"
              type="button"
            >
              <Bug className="w-4 h-4 text-[#ffb4ab]" />
              <span>Simular Sin Caso Base</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
