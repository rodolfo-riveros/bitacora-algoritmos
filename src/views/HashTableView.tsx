/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Search, Sparkles, RotateCcw, Play, Pause, StepForward, Gauge, Hash, Layers, Clock } from 'lucide-react';
import { LogEntry, CodeLine } from '../types';
import { PythonCodePanel } from '../components/PythonCodePanel';
import { OperationLogPanel } from '../components/OperationLogPanel';
import { TheoryCards, TheoryCard } from '../components/TheoryCards';
import { getSwatch } from '../constants/palette';

// ---------------------------------------------------------------------------
// Modelo y motor de micro-pasos
// ---------------------------------------------------------------------------

interface HashEntry {
  id: string;
  key: string;
  value: string;
  status?: 'checking' | 'found' | 'removing' | 'new' | null;
}

interface HashStep {
  buckets: HashEntry[][];
  activeIndex: number | null;
  line: number | null;
  logText: string;
  logType: LogEntry['type'];
  tone?: 'default' | 'error';
  comparisonsDelta?: number;
}

const TABLE_SIZE = 7;
const genId = () => `h-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const hashOf = (key: string): number => {
  let sum = 0;
  for (const ch of String(key)) sum += ch.codePointAt(0) ?? 0;
  return sum % TABLE_SIZE;
};

const cloneBuckets = (buckets: HashEntry[][]): HashEntry[][] =>
  buckets.map((b) => b.map((e) => ({ id: e.id, key: e.key, value: e.value, status: null })));

const HASH_CODE: CodeLine[] = [
  { num: 1, code: 'class TablaHash:' },
  { num: 2, code: '    def __init__(self, tamano=7):' },
  { num: 3, code: '        self.tamano = tamano' },
  { num: 4, code: '        self.cubetas = [[] for _ in range(tamano)]' },
  { num: 5, code: '' },
  { num: 6, code: '    def _hash(self, clave):' },
  { num: 7, code: '        return sum(ord(c) for c in str(clave)) % self.tamano' },
  { num: 8, code: '' },
  { num: 9, code: '    def insertar(self, clave, valor):' },
  { num: 10, code: '        indice = self._hash(clave)' },
  { num: 11, code: '        for i, (k, v) in enumerate(self.cubetas[indice]):' },
  { num: 12, code: '            if k == clave:' },
  { num: 13, code: '                self.cubetas[indice][i] = (clave, valor)' },
  { num: 14, code: '                return' },
  { num: 15, code: '        self.cubetas[indice].append((clave, valor))' },
  { num: 16, code: '' },
  { num: 17, code: '    def buscar(self, clave):' },
  { num: 18, code: '        indice = self._hash(clave)' },
  { num: 19, code: '        for k, v in self.cubetas[indice]:' },
  { num: 20, code: '            if k == clave:' },
  { num: 21, code: '                return v' },
  { num: 22, code: '        return None' },
  { num: 23, code: '' },
  { num: 24, code: '    def eliminar(self, clave):' },
  { num: 25, code: '        indice = self._hash(clave)' },
  { num: 26, code: '        for i, (k, v) in enumerate(self.cubetas[indice]):' },
  { num: 27, code: '            if k == clave:' },
  { num: 28, code: '                self.cubetas[indice].pop(i)' },
  { num: 29, code: '                return True' },
  { num: 30, code: '        return False' },
];

function buildInsertSteps(source: HashEntry[][], key: string, value: string): HashStep[] {
  const buckets = cloneBuckets(source);
  const idx = hashOf(key);
  const bucket = buckets[idx];
  const steps: HashStep[] = [];

  steps.push({
    buckets: cloneBuckets(buckets),
    activeIndex: idx,
    line: 7,
    logText: `_hash("${key}") = ${idx} → esta clave vive en la cubeta ${idx}.`,
    logType: 'info',
  });

  let matchIdx = -1;
  for (let i = 0; i < bucket.length; i++) {
    const snap = cloneBuckets(buckets);
    snap[idx][i].status = 'checking';
    steps.push({
      buckets: snap,
      activeIndex: idx,
      line: 12,
      logText: `¿"${bucket[i].key}" == "${key}"? — colisión en la cubeta ${idx} (comparación #${i + 1})`,
      logType: 'info',
    });
    if (bucket[i].key === key) {
      matchIdx = i;
      break;
    }
  }

  if (matchIdx >= 0) {
    const finalBuckets = cloneBuckets(buckets);
    finalBuckets[idx][matchIdx] = { id: bucket[matchIdx].id, key, value, status: 'new' };
    steps.push({
      buckets: finalBuckets,
      activeIndex: idx,
      line: 13,
      logText: `Ya existía "${key}" → se actualiza el valor a "${value}".`,
      logType: 'success',
    });
  } else {
    const finalBuckets = cloneBuckets(buckets);
    finalBuckets[idx] = [...finalBuckets[idx], { id: genId(), key, value, status: 'new' }];
    steps.push({
      buckets: finalBuckets,
      activeIndex: idx,
      line: 15,
      logText: `Se agrega "${key}: ${value}" al final de la cubeta ${idx}.`,
      logType: 'push',
    });
  }

  return steps;
}

function buildSearchSteps(source: HashEntry[][], key: string): HashStep[] {
  const buckets = cloneBuckets(source);
  const idx = hashOf(key);
  const bucket = buckets[idx];
  const steps: HashStep[] = [];

  steps.push({
    buckets: cloneBuckets(buckets),
    activeIndex: idx,
    line: 18,
    logText: `_hash("${key}") = ${idx} → se revisa la cubeta ${idx}.`,
    logType: 'info',
  });

  for (let i = 0; i < bucket.length; i++) {
    const snap = cloneBuckets(buckets);
    snap[idx][i].status = 'checking';
    steps.push({
      buckets: snap,
      activeIndex: idx,
      line: 20,
      logText: `¿"${bucket[i].key}" == "${key}"? (comparación #${i + 1})`,
      logType: 'info',
      comparisonsDelta: 1,
    });

    if (bucket[i].key === key) {
      const found = cloneBuckets(buckets);
      found[idx][i].status = 'found';
      steps.push({
        buckets: found,
        activeIndex: idx,
        line: 21,
        logText: `¡Encontrado! "${key}" → "${bucket[i].value}"`,
        logType: 'success',
      });
      return steps;
    }
  }

  steps.push({
    buckets: cloneBuckets(buckets),
    activeIndex: idx,
    line: 22,
    logText: `"${key}" no está en la cubeta ${idx}. buscar() retorna None.`,
    logType: 'error',
    tone: 'error',
  });

  return steps;
}

function buildDeleteSteps(source: HashEntry[][], key: string): HashStep[] {
  const buckets = cloneBuckets(source);
  const idx = hashOf(key);
  const bucket = buckets[idx];
  const steps: HashStep[] = [];

  steps.push({
    buckets: cloneBuckets(buckets),
    activeIndex: idx,
    line: 25,
    logText: `_hash("${key}") = ${idx} → se busca en la cubeta ${idx} para eliminar.`,
    logType: 'info',
  });

  for (let i = 0; i < bucket.length; i++) {
    const snap = cloneBuckets(buckets);
    snap[idx][i].status = 'checking';
    steps.push({
      buckets: snap,
      activeIndex: idx,
      line: 27,
      logText: `¿"${bucket[i].key}" == "${key}"? (comparación #${i + 1})`,
      logType: 'info',
    });

    if (bucket[i].key === key) {
      const removing = cloneBuckets(buckets);
      removing[idx][i].status = 'removing';
      steps.push({
        buckets: removing,
        activeIndex: idx,
        line: 28,
        logText: `Coincide. Se elimina "${key}" de la cubeta ${idx}.`,
        logType: 'pop',
      });
      const after = cloneBuckets(buckets);
      after[idx] = after[idx].filter((_, j) => j !== i);
      steps.push({
        buckets: after,
        activeIndex: idx,
        line: 29,
        logText: `eliminar() retorna True.`,
        logType: 'success',
      });
      return steps;
    }
  }

  steps.push({
    buckets: cloneBuckets(buckets),
    activeIndex: idx,
    line: 30,
    logText: `"${key}" no está en la tabla. eliminar() retorna False.`,
    logType: 'error',
    tone: 'error',
  });

  return steps;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

const seedBuckets = (): HashEntry[][] => {
  const buckets: HashEntry[][] = Array.from({ length: TABLE_SIZE }, () => []);
  const seed: [string, string][] = [
    ['cat', 'gato'],
    ['act', 'actuar'],
    ['dog', 'perro'],
  ];
  seed.forEach(([key, value]) => {
    const idx = hashOf(key);
    buckets[idx].push({ id: genId(), key, value });
  });
  return buckets;
};

const hashTheoryCards: TheoryCard[] = [
  {
    icon: Hash,
    eyebrow: 'Principio Rector',
    title: 'Repaso: ¿Qué es una Tabla Hash?',
    accent: 'primary',
    body: (
      <>
        Una función <code className="text-[#d0bcff] font-bold">hash</code> convierte una clave en un índice de un
        arreglo ("cubetas"). Con una buena función, insertar/buscar/eliminar son casi instantáneos —{' '}
        <code className="text-[#4cd7f6] font-bold">O(1)</code> en promedio, aunque en el peor caso (muchas
        colisiones) puede llegar a <code className="text-[#ffb95f] font-bold">O(n)</code>.
      </>
    ),
    footer: <span>➔ "cat" y "act" tienen las mismas letras → mismo hash → colisión</span>,
  },
  {
    icon: Layers,
    eyebrow: 'Manejo de Colisiones',
    title: 'Encadenamiento (Chaining)',
    accent: 'secondary',
    body: (
      <>
        Cuando dos claves distintas caen en la misma cubeta (una <strong className="text-[#dfe2f1]">colisión</strong>),
        esta tabla guarda ambas en una lista dentro de esa cubeta. Por eso <code className="text-[#4cd7f6]">insertar</code>{' '}
        y <code className="text-[#4cd7f6]">buscar</code> recorren la lista de la cubeta comparando clave por clave.
      </>
    ),
    footer: (
      <span className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Sin colisiones: O(1). Con muchas: O(n)
      </span>
    ),
  },
  {
    icon: Search,
    eyebrow: 'Diseño',
    title: '¿Por qué el tamaño importa?',
    accent: 'tertiary',
    body: (
      <>
        Con muy pocas cubetas, casi todo colisiona (como aquí, con solo 7). Las tablas hash reales usan tamaños
        mucho mayores y <em>redimensionan</em> cuando se llenan, para mantener las cadenas cortas y las
        operaciones rápidas.
      </>
    ),
    footer: <span>✓ Menos colisiones = más cerca de O(1) real</span>,
  },
];

export const HashTableView: React.FC = () => {
  const [buckets, setBuckets] = useState<HashEntry[][]>(seedBuckets());
  const [activeBucket, setActiveBucket] = useState<number | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(4);
  const [caption, setCaption] = useState<string | null>(
    'self.cubetas = [[], [], [], [], [], [], []] → tabla de 7 cubetas con 3 claves de ejemplo ya cargadas.'
  );
  const [tone, setTone] = useState<'default' | 'error'>('default');
  const [comparisons, setComparisons] = useState(0);
  const [stepProgress, setStepProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMs, setSpeedMs] = useState(750);
  const speedMsRef = useRef(speedMs);
  useEffect(() => {
    speedMsRef.current = speedMs;
  }, [speedMs]);

  const [keyInput, setKeyInput] = useState('');
  const [valueInput, setValueInput] = useState('');

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'ht-0', time: '00:00', text: 'Tabla hash inicializada con "cat", "act" (colisión) y "dog".', type: 'info' },
  ]);

  const stepsRef = useRef<HashStep[]>([]);
  const stepIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  const addLog = (text: string, type: LogEntry['type']) => {
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const id = `${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`;
    setLogs((prev) => [...prev.slice(-40), { id, time: timeStr, text, type }]);
  };

  const applyStep = (step: HashStep, idx: number, total: number) => {
    setBuckets(step.buckets);
    setActiveBucket(step.activeIndex);
    setActiveLine(step.line);
    setTone(step.tone ?? 'default');
    if (step.comparisonsDelta) setComparisons((c) => c + step.comparisonsDelta!);
    addLog(step.logText, step.logType);
    setCaption(step.logText);
    setStepProgress({ current: idx + 1, total });
  };

  const finishRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const advance = (auto: boolean) => {
    const idx = stepIndexRef.current + 1;
    stepIndexRef.current = idx;
    applyStep(stepsRef.current[idx], idx, stepsRef.current.length);

    const isLast = idx >= stepsRef.current.length - 1;
    if (isLast) {
      finishRun();
    } else if (auto) {
      timerRef.current = setTimeout(() => advance(true), speedMsRef.current);
    }
  };

  const runOperation = (steps: HashStep[]) => {
    if (isRunning || steps.length === 0) return;
    stepsRef.current = steps;
    stepIndexRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setComparisons(0);
    applyStep(steps[0], 0, steps.length);

    if (steps.length > 1) {
      timerRef.current = setTimeout(() => advance(true), speedMsRef.current);
    } else {
      finishRun();
    }
  };

  const handlePauseResume = () => {
    if (!isRunning) return;
    if (isPaused) {
      setIsPaused(false);
      timerRef.current = setTimeout(() => advance(true), speedMsRef.current);
    } else {
      setIsPaused(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleManualStep = () => {
    if (!isRunning || !isPaused) return;
    advance(false);
  };

  const handleInsert = () => {
    if (isRunning) return;
    const key = keyInput.trim();
    if (!key) return;
    const value = valueInput.trim() || 'valor';
    runOperation(buildInsertSteps(buckets, key, value));
    setKeyInput('');
    setValueInput('');
  };

  const handleSearch = () => {
    if (isRunning || !keyInput.trim()) return;
    runOperation(buildSearchSteps(buckets, keyInput.trim()));
  };

  const handleDelete = () => {
    if (isRunning || !keyInput.trim()) return;
    runOperation(buildDeleteSteps(buckets, keyInput.trim()));
    setKeyInput('');
  };

  const handleClear = () => {
    if (isRunning) return;
    setBuckets(Array.from({ length: TABLE_SIZE }, () => []));
    setActiveBucket(null);
    setActiveLine(4);
    setTone('default');
    setComparisons(0);
    setStepProgress({ current: 0, total: 0 });
    setCaption('self.cubetas = [[], [], [], [], [], [], []] → tabla vaciada.');
    addLog('Tabla vaciada completamente.', 'info');
  };

  const handleLoadSample = () => {
    if (isRunning) return;
    setBuckets(seedBuckets());
    setActiveBucket(null);
    setActiveLine(4);
    setTone('default');
    setComparisons(0);
    setStepProgress({ current: 0, total: 0 });
    setCaption('Ejemplo recargado: "cat", "act" (colisión) y "dog".');
    addLog('Ejemplo recargado.', 'info');
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Header */}
      <section className="w-full px-4 lg:px-6 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">Tablas Hash</h1>
        <p className="text-xs text-[#958ea0] mt-0.5">
          Una función convierte cada clave en un índice — así insertar y buscar no requieren revisar todo.
        </p>
      </section>

      {/* Command bar */}
      <section className="w-full px-4 lg:px-6 pb-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Clave (ej: cat)"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          disabled={isRunning}
          className="w-32 bg-[#171b26] border border-[#262a35] rounded-lg px-3 py-1.5 text-xs text-[#dfe2f1] placeholder-[#6b6678] focus:outline-none focus:border-[#d0bcff] transition-all disabled:opacity-50"
        />
        <input
          type="text"
          placeholder="Valor (ej: gato)"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
          disabled={isRunning}
          className="w-32 bg-[#171b26] border border-[#262a35] rounded-lg px-3 py-1.5 text-xs text-[#dfe2f1] placeholder-[#6b6678] focus:outline-none focus:border-[#d0bcff] transition-all disabled:opacity-50"
        />
        <button
          onClick={handleInsert}
          disabled={isRunning || !keyInput.trim()}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a078ff] text-[#340080] text-xs font-semibold hover:bg-[#d0bcff] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" /> Insertar
        </button>
        <button
          onClick={handleSearch}
          disabled={isRunning || !keyInput.trim()}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#4cd7f6] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search className="w-3.5 h-3.5" /> Buscar
        </button>
        <button
          onClick={handleDelete}
          disabled={isRunning || !keyInput.trim()}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#ffb95f] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
        <button
          onClick={handleLoadSample}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#958ea0] hover:text-[#d0bcff] text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-3.5 h-3.5" /> Ejemplo
        </button>
        <button
          onClick={handleClear}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#958ea0] hover:text-[#ffb4ab] text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Vaciar
        </button>
      </section>

      {/* Playback controls */}
      <section className="w-full px-4 lg:px-6 pb-4 flex flex-wrap items-center gap-3 text-xs">
        <button
          onClick={handlePauseResume}
          disabled={!isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d0bcff] text-[#3c0091] font-semibold hover:bg-[#e9ddff] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning && !isPaused ? (
            <>
              <Pause className="w-4 h-4" /> <span>Pausar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> <span>Reanudar</span>
            </>
          )}
        </button>
        <button
          onClick={handleManualStep}
          disabled={!isRunning || !isPaused}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#4cd7f6] hover:bg-[#171b26] transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <StepForward className="w-4 h-4" />
          <span>Paso</span>
        </button>

        {isRunning && (
          <span className="text-[#958ea0]">
            Paso {stepProgress.current}/{stepProgress.total}
          </span>
        )}
        {comparisons > 0 && <span className="text-[#ffb95f]">Comparaciones: {comparisons}</span>}

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
              className={`px-2 py-1 rounded font-medium transition-all ${
                speedMs === sp.val ? 'text-[#4cd7f6]' : 'text-[#6b6678] hover:text-[#cbc3d7]'
              }`}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main grid: buckets + python */}
      <div className="w-full px-4 lg:px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 flex flex-col gap-1.5">
            {buckets.map((bucket, idx) => {
              const isActiveBucket = activeBucket === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all ${
                    isActiveBucket ? 'bg-[#171b26] ring-1 ring-[#4cd7f6]/40' : ''
                  }`}
                >
                  <span className="w-5 text-right text-[10px] text-[#6b6678] shrink-0">{idx}</span>
                  <div className="flex-1 flex items-center gap-1.5 flex-wrap min-h-[28px]">
                    {bucket.length === 0 ? (
                      <span className="text-[10px] text-[#494454]">vacía</span>
                    ) : (
                      bucket.map((entry, i) => {
                        const swatch = getSwatch(idx);
                        const style =
                          entry.status === 'found'
                            ? 'bg-[#4cd7f6] text-[#003640] border-[#acedff]'
                            : entry.status === 'removing'
                            ? 'bg-[#93000a]/30 text-[#ffb4ab] border-[#ffb4ab] animate-queue-dequeue'
                            : entry.status === 'checking'
                            ? 'bg-[#ffb95f] text-[#472a00] border-[#ffddb8]'
                            : entry.status === 'new'
                            ? `${swatch.bg} ${swatch.text} ${swatch.border} animate-queue-enqueue`
                            : `${swatch.bg} ${swatch.text} ${swatch.border}`;

                        return (
                          <React.Fragment key={entry.id}>
                            <span className={`px-2 py-1 rounded text-[11px] font-bold border ${style}`}>
                              {entry.key}: {entry.value}
                            </span>
                            {i < bucket.length - 1 && <span className="text-[#494454] text-xs">→</span>}
                          </React.Fragment>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <OperationLogPanel logs={logs} onClear={() => setLogs([])} />
        </div>

        <div className="lg:col-span-5 h-[480px]">
          <PythonCodePanel
            filename="tabla_hash.py"
            lines={HASH_CODE}
            activeLine={activeLine}
            caption={caption}
            tone={tone}
          />
        </div>
      </div>

      {/* Theory — repaso */}
      <div className="w-full px-4 lg:px-6">
        <TheoryCards cards={hashTheoryCards} />
      </div>
    </div>
  );
};
