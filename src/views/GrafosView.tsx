/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, StepForward, Gauge, RotateCcw, Share2, ListOrdered, Layers, Clock } from 'lucide-react';
import { LogEntry, CodeLine } from '../types';
import { PythonCodePanel } from '../components/PythonCodePanel';
import { OperationLogPanel } from '../components/OperationLogPanel';
import { TheoryCards, TheoryCard } from '../components/TheoryCards';

// ---------------------------------------------------------------------------
// Grafo de ejemplo (fijo) y motor de micro-pasos
// ---------------------------------------------------------------------------

const GRAPH: Record<string, string[]> = {
  A: ['B', 'C'],
  B: ['A', 'D'],
  C: ['A', 'D', 'E'],
  D: ['B', 'C', 'F'],
  E: ['C', 'F'],
  F: ['D', 'E'],
};

const POSITIONS: Record<string, { x: number; y: number }> = {
  A: { x: 150, y: 20 },
  B: { x: 270, y: 90 },
  C: { x: 30, y: 90 },
  D: { x: 270, y: 210 },
  E: { x: 30, y: 210 },
  F: { x: 150, y: 280 },
};

const EDGES: [string, string][] = [
  ['A', 'B'],
  ['A', 'C'],
  ['B', 'D'],
  ['C', 'D'],
  ['C', 'E'],
  ['D', 'F'],
  ['E', 'F'],
];

interface GraphStep {
  visited: string[];
  current: string | null;
  frontier: string[];
  line: number;
  logText: string;
  logType: LogEntry['type'];
  order?: string[];
}

const GRAPH_CODE: CodeLine[] = [
  { num: 1, code: "grafo = {" },
  { num: 2, code: "    'A': ['B', 'C']," },
  { num: 3, code: "    'B': ['A', 'D']," },
  { num: 4, code: "    'C': ['A', 'D', 'E']," },
  { num: 5, code: "    'D': ['B', 'C', 'F']," },
  { num: 6, code: "    'E': ['C', 'F']," },
  { num: 7, code: "    'F': ['D', 'E']," },
  { num: 8, code: '}' },
  { num: 9, code: '' },
  { num: 10, code: 'def bfs(grafo, inicio):' },
  { num: 11, code: '    visitados = [inicio]' },
  { num: 12, code: '    cola = [inicio]' },
  { num: 13, code: '    orden = []' },
  { num: 14, code: '    while cola:' },
  { num: 15, code: '        actual = cola.pop(0)' },
  { num: 16, code: '        orden.append(actual)' },
  { num: 17, code: '        for vecino in grafo[actual]:' },
  { num: 18, code: '            if vecino not in visitados:' },
  { num: 19, code: '                visitados.append(vecino)' },
  { num: 20, code: '                cola.append(vecino)' },
  { num: 21, code: '    return orden' },
  { num: 22, code: '' },
  { num: 23, code: 'def dfs(grafo, inicio):' },
  { num: 24, code: '    visitados = [inicio]' },
  { num: 25, code: '    pila = [inicio]' },
  { num: 26, code: '    orden = []' },
  { num: 27, code: '    while pila:' },
  { num: 28, code: '        actual = pila.pop()' },
  { num: 29, code: '        if actual not in orden:' },
  { num: 30, code: '            orden.append(actual)' },
  { num: 31, code: '        for vecino in grafo[actual]:' },
  { num: 32, code: '            if vecino not in visitados:' },
  { num: 33, code: '                visitados.append(vecino)' },
  { num: 34, code: '                pila.append(vecino)' },
  { num: 35, code: '    return orden' },
];

function buildBFSSteps(start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = [start];
  const queue = [start];
  const order: string[] = [];

  steps.push({ visited: [...visited], current: null, frontier: [...queue], line: 12, logText: `cola = ["${start}"] → se inicia el recorrido BFS.`, logType: 'info' });

  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    steps.push({
      visited: [...visited],
      current,
      frontier: [...queue],
      line: 15,
      logText: `cola.pop(0) → visita "${current}". orden = [${order.join(', ')}]`,
      logType: 'push',
      order: [...order],
    });

    for (const neighbor of GRAPH[current]) {
      if (!visited.includes(neighbor)) {
        visited.push(neighbor);
        queue.push(neighbor);
        steps.push({
          visited: [...visited],
          current,
          frontier: [...queue],
          line: 20,
          logText: `"${neighbor}" no visitado → se agrega al final de la cola.`,
          logType: 'info',
        });
      }
    }
  }

  steps.push({ visited: [...visited], current: null, frontier: [], line: 21, logText: `BFS completo. Orden de visita: [${order.join(', ')}]`, logType: 'success', order: [...order] });
  return steps;
}

function buildDFSSteps(start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = [start];
  const stack = [start];
  const order: string[] = [];

  steps.push({ visited: [...visited], current: null, frontier: [...stack], line: 25, logText: `pila = ["${start}"] → se inicia el recorrido DFS.`, logType: 'info' });

  while (stack.length > 0) {
    const current = stack.pop()!;
    if (!order.includes(current)) order.push(current);
    steps.push({
      visited: [...visited],
      current,
      frontier: [...stack],
      line: 28,
      logText: `pila.pop() → visita "${current}". orden = [${order.join(', ')}]`,
      logType: 'push',
      order: [...order],
    });

    for (const neighbor of GRAPH[current]) {
      if (!visited.includes(neighbor)) {
        visited.push(neighbor);
        stack.push(neighbor);
        steps.push({
          visited: [...visited],
          current,
          frontier: [...stack],
          line: 34,
          logText: `"${neighbor}" no visitado → se agrega a la cima de la pila.`,
          logType: 'info',
        });
      }
    }
  }

  steps.push({ visited: [...visited], current: null, frontier: [], line: 35, logText: `DFS completo. Orden de visita: [${order.join(', ')}]`, logType: 'success', order: [...order] });
  return steps;
}

const grafosTheoryCards: TheoryCard[] = [
  {
    icon: Share2,
    eyebrow: 'Principio Rector',
    title: 'Repaso: ¿Qué es un Grafo?',
    accent: 'primary',
    body: (
      <>
        Un conjunto de <strong className="text-[#dfe2f1]">nodos (vértices)</strong> conectados por{' '}
        <strong className="text-[#dfe2f1]">aristas</strong>. Aquí se representa como una{' '}
        <code className="text-[#4cd7f6]">lista de adyacencia</code>: un diccionario donde cada nodo apunta a la
        lista de sus vecinos.
      </>
    ),
    footer: <span>➔ Árboles, redes sociales, mapas... todos son grafos</span>,
  },
  {
    icon: ListOrdered,
    eyebrow: 'BFS',
    title: 'BFS usa una Cola (FIFO)',
    accent: 'secondary',
    body: (
      <>
        BFS explora <strong className="text-[#dfe2f1]">nivel por nivel</strong>: visita todos los vecinos
        directos antes de ir más lejos. Por eso usa una cola — el mismo mecanismo del simulador de Colas.
      </>
    ),
    footer: <span>✓ Encuentra el camino más corto en pasos (sin pesos)</span>,
  },
  {
    icon: Layers,
    eyebrow: 'DFS',
    title: 'DFS usa una Pila (LIFO)',
    accent: 'tertiary',
    body: (
      <>
        DFS profundiza en una rama <strong className="text-[#dfe2f1]">hasta el final</strong> antes de
        retroceder. Por eso usa una pila — igual que en Torres de Hanói, aunque aquí no hay recursión, solo una
        pila explícita.
      </>
    ),
    footer: (
      <span className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> BFS y DFS visitan cada nodo una vez — O(nodos + aristas)
      </span>
    ),
  },
];

export const GrafosView: React.FC = () => {
  const [startNode, setStartNode] = useState('A');
  const [visited, setVisited] = useState<string[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [frontier, setFrontier] = useState<string[]>([]);
  const [frontierLabel, setFrontierLabel] = useState<'Cola' | 'Pila' | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);

  const [activeLine, setActiveLine] = useState<number | null>(1);
  const [caption, setCaption] = useState<string | null>('grafo = {...} → representación con lista de adyacencia, ya cargada.');

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMs, setSpeedMs] = useState(750);
  const speedMsRef = useRef(speedMs);
  useEffect(() => {
    speedMsRef.current = speedMs;
  }, [speedMs]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'gr-0', time: '00:00', text: 'Grafo de ejemplo cargado: A-B-C-D-E-F.', type: 'info' },
  ]);

  const stepsRef = useRef<GraphStep[]>([]);
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

  const applyStep = (step: GraphStep) => {
    setVisited(step.visited);
    setCurrent(step.current);
    setFrontier(step.frontier);
    setActiveLine(step.line);
    setCaption(step.logText);
    if (step.order) setOrder(step.order);
    addLog(step.logText, step.logType);
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
    applyStep(stepsRef.current[idx]);

    const isLast = idx >= stepsRef.current.length - 1;
    if (isLast) {
      finishRun();
    } else if (auto) {
      timerRef.current = setTimeout(() => advance(true), speedMsRef.current);
    }
  };

  const runOperation = (steps: GraphStep[], label: 'Cola' | 'Pila') => {
    if (isRunning || steps.length === 0) return;
    stepsRef.current = steps;
    stepIndexRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setOrder(null);
    setFrontierLabel(label);
    applyStep(steps[0]);

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

  const handleBFS = () => {
    if (isRunning) return;
    runOperation(buildBFSSteps(startNode), 'Cola');
  };

  const handleDFS = () => {
    if (isRunning) return;
    runOperation(buildDFSSteps(startNode), 'Pila');
  };

  const handleReset = () => {
    if (isRunning) return;
    setVisited([]);
    setCurrent(null);
    setFrontier([]);
    setFrontierLabel(null);
    setOrder(null);
    setActiveLine(1);
    setCaption('grafo = {...} → representación con lista de adyacencia, ya cargada.');
    addLog('Recorrido reiniciado.', 'info');
  };

  const nodeColor = (id: string) => {
    if (id === current) return { fill: '#ffb95f', text: '#472a00', stroke: '#ffddb8' };
    if (visited.includes(id)) return { fill: '#4cd7f6', text: '#003640', stroke: '#acedff' };
    return { fill: '#262a35', text: '#dfe2f1', stroke: '#313540' };
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Header */}
      <section className="w-full px-4 lg:px-6 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">Grafos</h1>
        <p className="text-xs text-[#958ea0] mt-0.5">
          BFS recorre por niveles usando una cola; DFS profundiza usando una pila — mismos conceptos, nueva
          estructura.
        </p>
      </section>

      {/* Command bar */}
      <section className="w-full px-4 lg:px-6 pb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#958ea0]">Nodo inicial:</span>
        <div className="flex items-center gap-1 bg-[#171b26] p-0.5 rounded-lg border border-[#262a35]">
          {Object.keys(GRAPH).map((id) => (
            <button
              key={id}
              onClick={() => !isRunning && setStartNode(id)}
              type="button"
              disabled={isRunning}
              className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                startNode === id ? 'bg-[#a078ff] text-[#340080]' : 'text-[#cbc3d7] hover:bg-[#262a35]'
              }`}
            >
              {id}
            </button>
          ))}
        </div>
        <button
          onClick={handleBFS}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03b5d3] text-[#001f26] text-xs font-semibold hover:bg-[#4cd7f6] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ListOrdered className="w-3.5 h-3.5" /> BFS
        </button>
        <button
          onClick={handleDFS}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a078ff] text-[#340080] text-xs font-semibold hover:bg-[#d0bcff] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Layers className="w-3.5 h-3.5" /> DFS
        </button>
        <button
          onClick={handleReset}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#958ea0] hover:text-[#ffb4ab] text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reiniciar
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

        {frontierLabel && (
          <span className="text-[#958ea0]">
            {frontierLabel}: <span className="text-[#dfe2f1] font-mono">[{frontier.join(', ') || '—'}]</span>
          </span>
        )}
        {order && (
          <span className="text-[#958ea0]">
            Orden: <span className="text-[#dfe2f1] font-mono">[{order.join(', ')}]</span>
          </span>
        )}

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

      {/* Main grid: grafo + python */}
      <div className="w-full px-4 lg:px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 min-h-[320px] flex items-center justify-center">
            <svg width={300} height={300} className="overflow-visible">
              {EDGES.map(([a, b], i) => (
                <line
                  key={i}
                  x1={POSITIONS[a].x}
                  y1={POSITIONS[a].y}
                  x2={POSITIONS[b].x}
                  y2={POSITIONS[b].y}
                  stroke="#313540"
                  strokeWidth={2}
                />
              ))}
              {Object.keys(GRAPH).map((id) => {
                const { x, y } = POSITIONS[id];
                const color = nodeColor(id);
                return (
                  <g key={id} transform={`translate(${x}, ${y})`}>
                    <circle r={20} fill={color.fill} stroke={color.stroke} strokeWidth={2} />
                    <text textAnchor="middle" dominantBaseline="central" fill={color.text} fontSize={13} fontWeight="bold">
                      {id}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <OperationLogPanel logs={logs} onClear={() => setLogs([])} />
        </div>

        <div className="lg:col-span-5 h-[520px]">
          <PythonCodePanel filename="grafo.py" lines={GRAPH_CODE} activeLine={activeLine} caption={caption} />
        </div>
      </div>

      {/* Theory — repaso */}
      <div className="w-full px-4 lg:px-6">
        <TheoryCards cards={grafosTheoryCards} />
      </div>
    </div>
  );
};
