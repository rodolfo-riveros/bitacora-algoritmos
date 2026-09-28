import React, { useState, useEffect, useRef } from 'react';
import { TowerId, HanoiMove, LogEntry, CallStackFrame, CodeLine } from '../types';
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  Undo2,
  Layers,
  Gauge,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { PythonCodePanel } from '../components/PythonCodePanel';
import { OperationLogPanel } from '../components/OperationLogPanel';

interface HanoiSimulatorViewProps {
  numDisks: number;
  setNumDisks: (n: number) => void;
}

const HANOI_CODE: CodeLine[] = [
  { num: 1, code: 'def hanoi(n, origen, destino, aux):' },
  { num: 2, code: '    if n == 1:' },
  { num: 3, code: '        mover_disco(origen, destino)' },
  { num: 4, code: '        return' },
  { num: 5, code: '    hanoi(n - 1, origen, aux, destino)' },
  { num: 6, code: '    mover_disco(origen, destino)' },
  { num: 7, code: '    hanoi(n - 1, aux, destino, origen)' },
];

const DISK_STYLES: Record<number, { bg: string; text: string; shadow: string; border: string; width: string }> = {
  1: { bg: 'bg-[#4cd7f6]', text: 'text-[#003640]', shadow: 'shadow-[0_0_14px_rgba(76,215,246,0.5)]', border: 'border-[#acedff]', width: 'w-24' },
  2: { bg: 'bg-[#a078ff]', text: 'text-[#340080]', shadow: 'shadow-[0_0_14px_rgba(160,120,255,0.4)]', border: 'border-[#d0bcff]', width: 'w-32' },
  3: { bg: 'bg-[#d0bcff]', text: 'text-[#3c0091]', shadow: 'shadow-[0_0_14px_rgba(208,188,255,0.4)]', border: 'border-[#e9ddff]', width: 'w-40' },
  4: { bg: 'bg-[#ffb95f]', text: 'text-[#472a00]', shadow: 'shadow-[0_0_14px_rgba(255,185,95,0.4)]', border: 'border-[#ffddb8]', width: 'w-48' },
  5: { bg: 'bg-[#ca8100]', text: 'text-[#fff8f0]', shadow: 'shadow-[0_0_14px_rgba(202,129,0,0.4)]', border: 'border-[#ffb95f]', width: 'w-56' },
  6: { bg: 'bg-[#03b5d3]', text: 'text-[#001f26]', shadow: 'shadow-[0_0_14px_rgba(3,181,211,0.5)]', border: 'border-[#4cd7f6]', width: 'w-64' },
};

export const HanoiSimulatorView: React.FC<HanoiSimulatorViewProps> = ({
  numDisks,
  setNumDisks,
}) => {
  const initialAForN = (n: number) => {
    const arr: number[] = [];
    for (let i = n; i >= 1; i--) arr.push(i);
    return arr;
  };

  // Stacks state
  const [stacks, setStacks] = useState<Record<TowerId, number[]>>(() => ({
    A: initialAForN(numDisks),
    B: [],
    C: [],
  }));

  const stacksRef = useRef<Record<TowerId, number[]>>(stacks);
  stacksRef.current = stacks;

  const [moves, setMoves] = useState(0);
  const [pushOps, setPushOps] = useState(3);
  const [popOps, setPopOps] = useState(0);
  const [selectedTower, setSelectedTower] = useState<TowerId | null>(null);
  const [moveHistory, setMoveHistory] = useState<HanoiMove[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);
  const speedMsRef = useRef<number>(speedMs);
  useEffect(() => {
    speedMsRef.current = speedMs;
  }, [speedMs]);

  const [activeCodeLine, setActiveCodeLine] = useState<number | null>(null);
  const [codeCaption, setCodeCaption] = useState<string | null>(null);
  const [systemState, setSystemState] = useState<'Listo' | 'Resolviendo' | 'Éxito' | 'Error' | 'Pausado'>('Listo');
  const [statusMessage, setStatusMessage] = useState('Listo para interactuar');

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'log-1', time: '00:00', text: 'Inicializando Stack_A con discos en orden descendente...', type: 'info' },
    { id: 'log-2', time: '00:00', text: 'Stack_A.push(Disco 3) → Base creada', type: 'push' },
    { id: 'log-3', time: '00:00', text: 'Stack_A.push(Disco 2)', type: 'push' },
    { id: 'log-4', time: '00:00', text: 'Stack_A.push(Disco 1) → [Top] asignado', type: 'push' },
  ]);

  // Call Stack Frames
  const [callStack, setCallStack] = useState<CallStackFrame[]>([
    {
      id: 'frame-base',
      name: `hanoi(${numDisks}, orig=A, dest=C, aux=B)`,
      pc: 'Entrada Raíz (Línea 1)',
      badge: 'Frame 1 (Base)',
      isTop: true,
    },
  ]);

  const solveQueueRef = useRef<{ n: number; from: TowerId; to: TowerId; aux: TowerId }[]>([]);
  const timerRef = useRef<any>(null);

  // Initialize towers when disk count changes
  useEffect(() => {
    resetTowers(numDisks);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [numDisks]);

  const addLog = (text: string, type: LogEntry['type']) => {
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const logId = `${now.getTime()}-${Math.random().toString(36).substring(2, 9)}`;
    setLogs((prev) => [...prev.slice(-40), { id: logId, time: timeStr, text, type }]);
  };

  const resetTowers = (n: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsSolving(false);
    setSelectedTower(null);
    setMoveHistory([]);
    solveQueueRef.current = [];
    setActiveCodeLine(null);
    setCodeCaption(null);
    setSystemState('Listo');
    setStatusMessage('Estado: Listo');

    const initialA = initialAForN(n);
    const newStacks = {
      A: initialA,
      B: [],
      C: [],
    };
    stacksRef.current = newStacks;
    setStacks(newStacks);

    setMoves(0);
    setPushOps(n);
    setPopOps(0);

    setLogs([
      { id: `r1-${Date.now()}`, time: '00:00', text: `Torre reiniciada con ${n} discos en Stack_A.`, type: 'info' },
      ...initialA.map((d, idx) => ({
        id: `r-init-${d}-${idx}-${Date.now()}`,
        time: '00:00',
        text: `Stack_A.push(Disco ${d}) ${idx === initialA.length - 1 ? '→ [Top: Disco 1]' : ''}`,
        type: 'push' as const,
      })),
    ]);

    setCallStack([
      {
        id: `frame-root-${Date.now()}`,
        name: `hanoi(${n}, orig=A, dest=C, aux=B)`,
        pc: 'Entrada Raíz (Línea 1)',
        badge: 'Frame 1 (Base)',
        isTop: true,
      },
    ]);
  };

  // Generate recursive solution moves
  const generateHanoiMoves = (
    n: number,
    from: TowerId,
    to: TowerId,
    aux: TowerId,
    acc: { n: number; from: TowerId; to: TowerId; aux: TowerId }[]
  ) => {
    if (n === 1) {
      acc.push({ n: 1, from, to, aux });
      return;
    }
    generateHanoiMoves(n - 1, from, aux, to, acc);
    acc.push({ n, from, to, aux });
    generateHanoiMoves(n - 1, aux, to, from, acc);
  };

  // Execute a single move from one tower to another
  const executeMove = (fromPeg: TowerId, toPeg: TowerId, isAuto = false): boolean => {
    const currentStacks = stacksRef.current;
    const fromStack = currentStacks[fromPeg];
    const toStack = currentStacks[toPeg];

    if (!fromStack || fromStack.length === 0) {
      setStatusMessage(`Error: Stack_${fromPeg} está vacía (Stack Underflow)`);
      setSystemState('Error');
      addLog(`Error: Intentó .pop() en Stack_${fromPeg} vacía (Underflow).`, 'error');
      return false;
    }

    const movingDisk = fromStack[fromStack.length - 1];
    const targetTop = toStack.length > 0 ? toStack[toStack.length - 1] : Infinity;

    if (movingDisk > targetTop) {
      setStatusMessage(`Violación LIFO/Hanói: Disco ${movingDisk} > Disco ${targetTop}`);
      setSystemState('Error');
      addLog(`Violación de Integridad: Disco ${movingDisk} no puede apilarse sobre Disco ${targetTop}.`, 'error');
      return false;
    }

    // Apply move
    const newFrom = [...fromStack];
    newFrom.pop();
    const newTo = [...toStack, movingDisk];

    const nextStacks = {
      ...currentStacks,
      [fromPeg]: newFrom,
      [toPeg]: newTo,
    };
    stacksRef.current = nextStacks;
    setStacks(nextStacks);

    setMoves((m) => m + 1);
    setPopOps((p) => p + 1);
    setPushOps((p) => p + 1);
    setMoveHistory((h) => [...h, { from: fromPeg, to: toPeg, disk: movingDisk }]);

    setStatusMessage(`Válido: Stack_${fromPeg}.pop() → Stack_${toPeg}.push(Disco ${movingDisk})`);
    setSystemState('Listo');
    addLog(`Stack_${fromPeg}.pop() [Disco ${movingDisk}] ➔ Stack_${toPeg}.push()`, 'push');
    if (!isAuto) {
      setActiveCodeLine(3);
      setCodeCaption(`mover_disco(${fromPeg}, ${toPeg}) → Disco ${movingDisk} pasa de Stack_${fromPeg} a Stack_${toPeg}`);
    }

    // Check if target is full
    if (toPeg === 'C' && newTo.length === numDisks) {
      setStatusMessage('¡Objetivo Resuelto! Stack_C completado exitosamente.');
      setSystemState('Éxito');
      addLog(`🏆 ¡Éxito! Todos los ${numDisks} discos transferidos a Stack_C respetando LIFO.`, 'success');
    }

    return true;
  };

  // Tower click handler (Pop / Push)
  const handleTowerClick = (peg: TowerId) => {
    if (isSolving) return;

    const currentStacks = stacksRef.current;
    if (selectedTower === null) {
      // Trying to POP
      if (!currentStacks[peg] || currentStacks[peg].length === 0) {
        setStatusMessage(`Stack_${peg} está vacía (Underflow)`);
        setSystemState('Error');
        addLog(`Stack_${peg}.pop() falló: contenedor vacío.`, 'error');
        return;
      }
      setSelectedTower(peg);
      const diskVal = currentStacks[peg][currentStacks[peg].length - 1];
      setStatusMessage(`Disco ${diskVal} desapilado (.pop) de Stack_${peg}. Selecciona torre destino.`);
      addLog(`Stack_${peg}.pop() ➔ Disco ${diskVal} en tránsito`, 'pop');
    } else if (selectedTower === peg) {
      // Cancel selection
      setSelectedTower(null);
      setStatusMessage('Operación cancelada. Disco devuelto a la cima.');
    } else {
      // Trying to PUSH
      executeMove(selectedTower, peg);
      setSelectedTower(null);
    }
  };

  // Auto-solve recursion loop
  const handleAutoSolve = () => {
    if (isSolving) {
      setIsSolving(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      setSystemState('Pausado');
      setStatusMessage('Resolución pausada');
      return;
    }

    // If already solved or empty, reinitialize
    if (stacksRef.current.C.length === numDisks || (moves > 0 && solveQueueRef.current.length === 0)) {
      const initialA = initialAForN(numDisks);
      const nextStacks = { A: initialA, B: [], C: [] };
      stacksRef.current = nextStacks;
      setStacks(nextStacks);
      setMoves(0);
      setPushOps(numDisks);
      setPopOps(0);
      setMoveHistory([]);
    }

    solveQueueRef.current = [];
    generateHanoiMoves(numDisks, 'A', 'C', 'B', solveQueueRef.current);

    setIsSolving(true);
    setSystemState('Resolviendo');
    setStatusMessage('Resolviendo recursivamente con llamada canónica...');
    setActiveCodeLine(1);
    setCodeCaption(`hanoi(${numDisks}, A, C, B) → se invoca la función principal.`);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(runNextSolveStep, 100);
  };

  const runNextSolveStep = () => {
    if (solveQueueRef.current.length === 0) {
      setIsSolving(false);
      setSystemState('Éxito');
      setStatusMessage('¡Resolución completa!');
      setActiveCodeLine(4);
      setCodeCaption('return → el caso base terminó; retorna a la llamada que lo invocó.');
      return;
    }

    const nextStep = solveQueueRef.current.shift()!;
    setActiveCodeLine(nextStep.n === 1 ? 3 : 6);
    setCodeCaption(
      `mover_disco(${nextStep.from}, ${nextStep.to}) → Disco ${nextStep.n} pasa de Stack_${nextStep.from} a Stack_${nextStep.to}`
    );

    executeMove(nextStep.from, nextStep.to, true);

    const now = Date.now();
    // Update activation call stack representation
    const frames: CallStackFrame[] = [
      {
        id: `f-${now}-${Math.random()}`,
        name: `hanoi(${nextStep.n}, from=${nextStep.from}, to=${nextStep.to}, aux=${nextStep.aux})`,
        pc: nextStep.n === 1 ? 'Línea 3: moverDisco (Caso Base)' : 'Línea 6: moverDisco (Cima)',
        badge: 'SP (Top)',
        isTop: true,
      },
    ];

    if (nextStep.n < numDisks) {
      frames.push({
        id: `f-prev-${now}`,
        name: `hanoi(${nextStep.n + 1}, frame subproblema)`,
        pc: 'Línea 5: Esperando retorno de rama',
        badge: 'Frame N-1',
      });
    }

    frames.push({
      id: `f-root-${now}`,
      name: `hanoi(${numDisks}, orig=A, dest=C, aux=B)`,
      pc: 'Línea 1: Marco de Entrada Principal',
      badge: 'Frame 1 (Base)',
    });

    setCallStack(frames);

    timerRef.current = setTimeout(runNextSolveStep, speedMsRef.current);
  };

  // Step single move
  const handleStep = () => {
    if (isSolving) {
      setIsSolving(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }

    if (solveQueueRef.current.length === 0) {
      if (stacksRef.current.C.length === numDisks) {
        resetTowers(numDisks);
      }
      generateHanoiMoves(numDisks, 'A', 'C', 'B', solveQueueRef.current);
    }

    if (solveQueueRef.current.length > 0) {
      const step = solveQueueRef.current.shift()!;
      setActiveCodeLine(step.n === 1 ? 3 : 6);
      setCodeCaption(
        `mover_disco(${step.from}, ${step.to}) → Disco ${step.n} pasa de Stack_${step.from} a Stack_${step.to}`
      );
      executeMove(step.from, step.to, true);

      const now = Date.now();
      setCallStack([
        {
          id: `step-${now}-${Math.random()}`,
          name: `hanoi(${step.n}, ${step.from} ➔ ${step.to})`,
          pc: 'Línea 3/6: Paso manual ejecutado',
          badge: 'SP (Top)',
          isTop: true,
        },
        {
          id: `step-root-${now}`,
          name: `hanoi(${numDisks}, Main)`,
          pc: 'Puntero de Activación Raíz',
          badge: 'Frame 1 (Base)',
        },
      ]);
    }
  };

  // Undo last move
  const handleUndo = () => {
    if (isSolving || moveHistory.length === 0) return;

    const last = moveHistory[moveHistory.length - 1];
    const newHistory = moveHistory.slice(0, -1);

    const currentStacks = stacksRef.current;
    // Reverse: pop from 'to' and push to 'from'
    const newTo = [...currentStacks[last.to]];
    const disk = newTo.pop();
    if (disk === undefined) return;

    const newFrom = [...currentStacks[last.from], disk];

    const nextStacks = {
      ...currentStacks,
      [last.to]: newTo,
      [last.from]: newFrom,
    };
    stacksRef.current = nextStacks;
    setStacks(nextStacks);

    setMoveHistory(newHistory);
    setMoves((m) => Math.max(0, m - 1));
    setStatusMessage(`Deshecho: Disco ${disk} regresado a Stack_${last.from}`);
    addLog(`Deshacer: Stack_${last.to}.pop() ➔ Stack_${last.from}.push(Disco ${disk})`, 'info');
  };

  const minMoves = Math.pow(2, numDisks) - 1;
  const holdingDisk = selectedTower && stacks[selectedTower].length > 0
    ? stacks[selectedTower][stacks[selectedTower].length - 1]
    : null;

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Header */}
      <section className="w-full px-4 lg:px-6 pt-6 pb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">Torres de Hanói</h1>
          <p className="text-xs text-[#958ea0] mt-0.5">
            Cada disco es un valor en la pila; solo puedes mover el de la cima (Top).
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-[#958ea0]">
          <span>
            Movimientos <strong className="text-[#dfe2f1]">{moves}</strong> / {minMoves}
          </span>
          <span>{systemState}</span>
        </div>
      </section>

      {/* Command bar */}
      <section className="w-full px-4 lg:px-6 pb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1">
          <span className="text-xs text-[#958ea0] mr-1">Discos:</span>
          {[3, 4, 5, 6].map((count) => (
            <button
              key={count}
              onClick={() => setNumDisks(count)}
              type="button"
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                numDisks === count ? 'bg-[#a078ff] text-[#340080]' : 'text-[#cbc3d7] hover:bg-[#171b26]'
              }`}
            >
              {count}
            </button>
          ))}
        </div>

        <span className="w-px h-5 bg-[#262a35]" />

        <button
          onClick={handleAutoSolve}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d0bcff] text-[#3c0091] text-xs font-semibold hover:bg-[#e9ddff] transition-all"
        >
          {isSolving ? (
            <>
              <Pause className="w-4 h-4" /> <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> <span>Resolver</span>
            </>
          )}
        </button>
        <button
          onClick={handleStep}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#4cd7f6] hover:bg-[#171b26] transition-all text-xs font-medium"
        >
          <StepForward className="w-4 h-4" />
          <span>Paso</span>
        </button>
        <button
          onClick={handleUndo}
          disabled={moveHistory.length === 0 || isSolving}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#cbc3d7] hover:bg-[#171b26] disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs"
        >
          <Undo2 className="w-4 h-4" />
          <span>Deshacer</span>
        </button>
        <button
          onClick={() => resetTowers(numDisks)}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#958ea0] hover:text-[#ffb4ab] hover:bg-[#171b26] transition-all text-xs"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reiniciar</span>
        </button>

        <div className="flex items-center gap-1 ml-auto text-[#958ea0]">
          <Gauge className="w-3.5 h-3.5" />
          {[
            { label: '1x', val: 800 },
            { label: '2x', val: 400 },
            { label: '4x', val: 150 },
          ].map((sp) => (
            <button
              key={sp.label}
              onClick={() => setSpeedMs(sp.val)}
              type="button"
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                speedMs === sp.val ? 'text-[#4cd7f6]' : 'text-[#6b6678] hover:text-[#cbc3d7]'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main grid: towers + python code */}
      <div className="w-full px-4 lg:px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="w-full bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 lg:p-6 flex flex-col min-h-[420px]">
            {selectedTower && (
              <div className="flex items-center gap-2 bg-[#ca8100]/15 px-3 py-2 rounded-lg mb-3 text-xs text-[#ffb95f]">
                <ArrowUp className="w-4 h-4" />
                <span>
                  Disco {holdingDisk} en tránsito desde Stack_{selectedTower} — elige la torre destino.
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 pt-2 pb-2 min-h-[340px] items-end relative">
              {(['A', 'B', 'C'] as TowerId[]).map((peg) => {
                const isSelected = selectedTower === peg;
                const towerDisks = stacks[peg];
                const topDisk = towerDisks.length > 0 ? towerDisks[towerDisks.length - 1] : null;

                const pegTheme =
                  peg === 'A'
                    ? { name: 'Stack_A', role: 'Origen', color: 'text-[#d0bcff]', rod: 'bg-[#d0bcff]/20' }
                    : peg === 'B'
                    ? { name: 'Stack_B', role: 'Auxiliar', color: 'text-[#ffb95f]', rod: 'bg-[#ffb95f]/20' }
                    : { name: 'Stack_C', role: 'Destino', color: 'text-[#4cd7f6]', rod: 'bg-[#4cd7f6]/20' };

                return (
                  <div
                    key={peg}
                    onClick={() => handleTowerClick(peg)}
                    className={`flex flex-col items-center cursor-pointer transition-all duration-200 p-2 rounded-xl ${
                      isSelected ? 'bg-[#ffb95f]/10' : 'hover:bg-[#171b26]/50'
                    }`}
                  >
                    <div className="flex flex-col items-center mb-2 text-center">
                      <span className={`text-sm font-bold ${pegTheme.color}`}>{pegTheme.name}</span>
                      <span className="text-[11px] text-[#6b6678]">
                        {topDisk !== null ? `Top: Disco ${topDisk}` : 'Vacía'}
                      </span>
                    </div>

                    <div className="relative w-full h-56 flex flex-col justify-end items-center px-1">
                      <div className="absolute bottom-0 w-3 h-48 bg-[#262a35] rounded-t-full">
                        <div className={`w-0.5 h-full mx-auto ${pegTheme.rod}`}></div>
                      </div>

                      <div className="w-full flex flex-col-reverse items-center z-10 gap-1 pb-1">
                        {towerDisks.map((diskVal, idx) => {
                          const isTop = idx === towerDisks.length - 1;
                          const style = DISK_STYLES[diskVal] || DISK_STYLES[1];

                          return (
                            <div
                              key={`${peg}-disk-${diskVal}-pos-${idx}`}
                              className={`h-7 ${style.width} ${style.bg} ${style.text} ${style.shadow} ${style.border} border rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                                isTop ? 'ring-2 ring-[#4cd7f6]' : ''
                              }`}
                            >
                              Disco {diskVal}
                            </div>
                          );
                        })}
                      </div>

                      <div className="w-full h-3 bg-[#262a35] rounded-full z-20"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <OperationLogPanel title="Registro de Movimientos" logs={logs} onClear={() => setLogs([])} />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="h-[300px]">
            <PythonCodePanel filename="hanoi.py" lines={HANOI_CODE} activeLine={activeCodeLine} caption={codeCaption} />
          </div>

          {/* Call Stack Frame Visualizer */}
          <div className="w-full bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#dfe2f1] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#d0bcff]" /> Call Stack (memoria)
              </span>
              <span className="text-[10px] text-[#6b6678]">O(n) espacio</span>
            </div>

            <div className="flex flex-col gap-1.5 min-h-[120px]">
              {callStack.map((frame, idx) => (
                <div
                  key={frame.id || idx}
                  className={`flex items-center justify-between px-2.5 py-2 rounded text-xs transition-all ${
                    frame.isTop ? 'bg-[#313540] text-[#4cd7f6] font-semibold' : 'bg-[#171b26] text-[#cbc3d7]'
                  }`}
                >
                  <div className="flex flex-col">
                    <span>{frame.name}</span>
                    <span className="text-[10px] text-[#6b6678]">{frame.pc}</span>
                  </div>
                  <span className="text-[9px] uppercase text-[#6b6678] shrink-0">{frame.badge}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-[#262a35] flex items-center gap-2 text-[11px] text-[#6b6678]">
              <ArrowDown className="w-3 h-3" />
              <span>Fondo de la pila — cuando una función retorna, su marco se desapila (pop)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
