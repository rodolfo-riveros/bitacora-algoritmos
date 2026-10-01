/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { Plus, Search, Sparkles, RotateCcw, Play, Pause, StepForward, Gauge, GitBranch, ListOrdered, Clock } from 'lucide-react';
import { LogEntry, CodeLine } from '../types';
import { PythonCodePanel } from '../components/PythonCodePanel';
import { OperationLogPanel } from '../components/OperationLogPanel';
import { TheoryCards, TheoryCard } from '../components/TheoryCards';

// ---------------------------------------------------------------------------
// Modelo del árbol y motor de micro-pasos
// ---------------------------------------------------------------------------

interface TreeNode {
  id: string;
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  status?: 'checking' | 'found' | 'new' | 'visited' | null;
}

interface TreeStep {
  root: TreeNode | null;
  line: number | null;
  logText: string;
  logType: LogEntry['type'];
  tone?: 'default' | 'error';
  resultOrder?: number[];
}

const genId = () => `t-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cloneAndMark = (node: TreeNode | null, markId: string | null, status: TreeNode['status']): TreeNode | null => {
  if (!node) return null;
  return {
    id: node.id,
    value: node.value,
    left: cloneAndMark(node.left, markId, status),
    right: cloneAndMark(node.right, markId, status),
    status: node.id === markId ? status : null,
  };
};

const markVisited = (node: TreeNode | null, visitedIds: string[]): TreeNode | null => {
  if (!node) return null;
  const isCurrent = node.id === visitedIds[visitedIds.length - 1];
  const isVisited = visitedIds.includes(node.id);
  return {
    id: node.id,
    value: node.value,
    left: markVisited(node.left, visitedIds),
    right: markVisited(node.right, visitedIds),
    status: isCurrent ? 'checking' : isVisited ? 'visited' : null,
  };
};

const attachChild = (node: TreeNode, parentId: string, side: 'left' | 'right', child: TreeNode): TreeNode => {
  if (node.id === parentId) {
    return { ...node, [side]: child };
  }
  return {
    ...node,
    left: node.left ? attachChild(node.left, parentId, side, child) : null,
    right: node.right ? attachChild(node.right, parentId, side, child) : null,
  };
};

const TREE_CODE: CodeLine[] = [
  { num: 1, code: 'class Nodo:' },
  { num: 2, code: '    def __init__(self, valor):' },
  { num: 3, code: '        self.valor = valor' },
  { num: 4, code: '        self.izquierda = None' },
  { num: 5, code: '        self.derecha = None' },
  { num: 6, code: '' },
  { num: 7, code: 'class ArbolBinario:' },
  { num: 8, code: '    def __init__(self):' },
  { num: 9, code: '        self.raiz = None' },
  { num: 10, code: '' },
  { num: 11, code: '    def insertar(self, valor):' },
  { num: 12, code: '        if self.raiz is None:' },
  { num: 13, code: '            self.raiz = Nodo(valor)' },
  { num: 14, code: '            return' },
  { num: 15, code: '        actual = self.raiz' },
  { num: 16, code: '        while True:' },
  { num: 17, code: '            if valor < actual.valor:' },
  { num: 18, code: '                if actual.izquierda is None:' },
  { num: 19, code: '                    actual.izquierda = Nodo(valor)' },
  { num: 20, code: '                    return' },
  { num: 21, code: '                actual = actual.izquierda' },
  { num: 22, code: '            else:' },
  { num: 23, code: '                if actual.derecha is None:' },
  { num: 24, code: '                    actual.derecha = Nodo(valor)' },
  { num: 25, code: '                    return' },
  { num: 26, code: '                actual = actual.derecha' },
  { num: 27, code: '' },
  { num: 28, code: '    def buscar(self, valor):' },
  { num: 29, code: '        actual = self.raiz' },
  { num: 30, code: '        while actual is not None:' },
  { num: 31, code: '            if valor == actual.valor:' },
  { num: 32, code: '                return True' },
  { num: 33, code: '            actual = actual.izquierda if valor < actual.valor else actual.derecha' },
  { num: 34, code: '        return False' },
  { num: 35, code: '' },
  { num: 36, code: '    def inorder(self, nodo, resultado):' },
  { num: 37, code: '        if nodo is None: return' },
  { num: 38, code: '        self.inorder(nodo.izquierda, resultado)' },
  { num: 39, code: '        resultado.append(nodo.valor)' },
  { num: 40, code: '        self.inorder(nodo.derecha, resultado)' },
  { num: 41, code: '' },
  { num: 42, code: '    def preorder(self, nodo, resultado):' },
  { num: 43, code: '        if nodo is None: return' },
  { num: 44, code: '        resultado.append(nodo.valor)' },
  { num: 45, code: '        self.preorder(nodo.izquierda, resultado)' },
  { num: 46, code: '        self.preorder(nodo.derecha, resultado)' },
  { num: 47, code: '' },
  { num: 48, code: '    def postorder(self, nodo, resultado):' },
  { num: 49, code: '        if nodo is None: return' },
  { num: 50, code: '        self.postorder(nodo.izquierda, resultado)' },
  { num: 51, code: '        self.postorder(nodo.derecha, resultado)' },
  { num: 52, code: '        resultado.append(nodo.valor)' },
];

function buildInsertSteps(root: TreeNode | null, value: number): TreeStep[] {
  const steps: TreeStep[] = [];

  if (!root) {
    const newNode: TreeNode = { id: genId(), value, left: null, right: null, status: 'new' };
    steps.push({ root: newNode, line: 13, logText: `El árbol estaba vacío → "${value}" se convierte en la raíz.`, logType: 'success' });
    return steps;
  }

  let current = root;
  while (true) {
    const goesLeft = value < current.value;
    steps.push({
      root: cloneAndMark(root, current.id, 'checking'),
      line: 17,
      logText: `¿${value} < ${current.value}? → va a la ${goesLeft ? 'izquierda' : 'derecha'} de ${current.value}.`,
      logType: 'info',
    });

    const side: 'left' | 'right' = goesLeft ? 'left' : 'right';
    const next = current[side];
    if (!next) {
      const child: TreeNode = { id: genId(), value, left: null, right: null, status: 'new' };
      const newRoot = attachChild(root, current.id, side, child);
      steps.push({
        root: newRoot,
        line: goesLeft ? 19 : 24,
        logText: `Espacio vacío → "${value}" se inserta como hijo ${goesLeft ? 'izquierdo' : 'derecho'} de ${current.value}.`,
        logType: 'success',
      });
      return steps;
    }
    current = next;
  }
}

function buildSearchSteps(root: TreeNode | null, value: number): TreeStep[] {
  const steps: TreeStep[] = [];

  if (!root) {
    steps.push({ root: null, line: 30, logText: 'El árbol está vacío.', logType: 'error', tone: 'error' });
    return steps;
  }

  let current: TreeNode | null = root;
  while (current) {
    steps.push({
      root: cloneAndMark(root, current.id, 'checking'),
      line: 31,
      logText: `¿${value} == ${current.value}?`,
      logType: 'info',
    });

    if (value === current.value) {
      steps.push({
        root: cloneAndMark(root, current.id, 'found'),
        line: 32,
        logText: `¡Encontrado! "${value}" está en el árbol.`,
        logType: 'success',
      });
      return steps;
    }

    current = value < current.value ? current.left : current.right;
  }

  steps.push({
    root: cloneAndMark(root, null, null),
    line: 34,
    logText: `"${value}" no está en el árbol. buscar() retorna False.`,
    logType: 'error',
    tone: 'error',
  });
  return steps;
}

function collectOrder(node: TreeNode | null, order: 'inorder' | 'preorder' | 'postorder', acc: TreeNode[]) {
  if (!node) return;
  if (order === 'preorder') acc.push(node);
  collectOrder(node.left, order, acc);
  if (order === 'inorder') acc.push(node);
  collectOrder(node.right, order, acc);
  if (order === 'postorder') acc.push(node);
}

const TRAVERSE_LINE: Record<'inorder' | 'preorder' | 'postorder', number> = {
  inorder: 39,
  preorder: 44,
  postorder: 52,
};

function buildTraverseSteps(root: TreeNode | null, order: 'inorder' | 'preorder' | 'postorder'): TreeStep[] {
  const sequence: TreeNode[] = [];
  collectOrder(root, order, sequence);
  const steps: TreeStep[] = [];
  const visited: string[] = [];

  if (sequence.length === 0) {
    steps.push({ root: null, line: null, logText: 'El árbol está vacío — nada que recorrer.', logType: 'error', tone: 'error' });
    return steps;
  }

  sequence.forEach((node) => {
    visited.push(node.id);
    steps.push({
      root: markVisited(root, visited),
      line: TRAVERSE_LINE[order],
      logText: `Visita ${node.value} → resultado: [${sequence.slice(0, visited.length).map((s) => s.value).join(', ')}]`,
      logType: 'info',
      resultOrder: sequence.slice(0, visited.length).map((s) => s.value),
    });
  });

  return steps;
}

// ---------------------------------------------------------------------------
// Layout del árbol (posiciones para el SVG)
// ---------------------------------------------------------------------------

interface LaidOutNode {
  node: TreeNode;
  x: number;
  y: number;
}

function layoutTree(root: TreeNode | null): { nodes: LaidOutNode[]; width: number; height: number } {
  const nodes: LaidOutNode[] = [];
  const counter = { value: 0 };
  let maxDepth = 0;

  const visit = (node: TreeNode | null, depth: number) => {
    if (!node) return;
    visit(node.left, depth + 1);
    nodes.push({ node, x: counter.value, y: depth });
    counter.value += 1;
    maxDepth = Math.max(maxDepth, depth);
    visit(node.right, depth + 1);
  };
  visit(root, 0);

  const SPACING_X = 64;
  const SPACING_Y = 64;
  return {
    nodes,
    width: Math.max(counter.value * SPACING_X, SPACING_X),
    height: (maxDepth + 1) * SPACING_Y + 20,
  };
}

const NODE_RADIUS = 20;
const SPACING_X = 64;
const SPACING_Y = 64;

const seedTree = (): TreeNode | null => {
  let root: TreeNode | null = null;
  [8, 3, 10, 1, 6, 14, 4].forEach((value) => {
    if (!root) {
      root = { id: genId(), value, left: null, right: null };
      return;
    }
    let current = root;
    while (true) {
      const side: 'left' | 'right' = value < current.value ? 'left' : 'right';
      const next = current[side];
      if (!next) {
        current[side] = { id: genId(), value, left: null, right: null };
        break;
      }
      current = next;
    }
  });
  return root;
};

const arbolesTheoryCards: TheoryCard[] = [
  {
    icon: GitBranch,
    eyebrow: 'Principio Rector',
    title: 'Repaso: Árbol Binario de Búsqueda',
    accent: 'primary',
    body: (
      <>
        Cada nodo tiene como máximo 2 hijos. En un <strong className="text-[#dfe2f1]">BST</strong>, todo valor
        del subárbol izquierdo es <em>menor</em> que el nodo, y todo el derecho es <em>mayor o igual</em> — por
        eso <code className="text-[#4cd7f6]">buscar()</code> descarta media rama en cada paso.
      </>
    ),
    footer: <span>➔ Izquierda = menor, Derecha = mayor o igual</span>,
  },
  {
    icon: ListOrdered,
    eyebrow: 'Recorridos',
    title: 'Inorder, Preorder, Postorder',
    accent: 'secondary',
    body: (
      <>
        <strong className="text-[#dfe2f1]">Inorder</strong> (izq-raíz-der) da los valores ordenados.{' '}
        <strong className="text-[#dfe2f1]">Preorder</strong> (raíz-izq-der) sirve para copiar el árbol.{' '}
        <strong className="text-[#dfe2f1]">Postorder</strong> (izq-der-raíz) sirve para borrarlo de abajo hacia
        arriba.
      </>
    ),
    footer: (
      <span className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Los tres visitan cada nodo una vez — O(n)
      </span>
    ),
  },
  {
    icon: Gauge,
    eyebrow: 'Análisis Asintótico',
    title: 'Complejidad',
    accent: 'tertiary',
    body: (
      <>
        Con un árbol <strong className="text-[#dfe2f1]">balanceado</strong>, insertar y buscar son{' '}
        <code className="text-[#4cd7f6] font-bold">O(log n)</code> — igual que la búsqueda binaria. Pero si el
        árbol queda "torcido" (todo hacia un lado), degenera a{' '}
        <code className="text-[#ffb95f] font-bold">O(n)</code>, como una lista enlazada.
      </>
    ),
    footer: <span>✓ La forma del árbol importa tanto como los datos</span>,
  },
];

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

export const ArbolesView: React.FC = () => {
  const [root, setRoot] = useState<TreeNode | null>(seedTree());
  const [activeLine, setActiveLine] = useState<number | null>(12);
  const [caption, setCaption] = useState<string | null>('self.raiz → árbol de ejemplo ya cargado con 7 valores.');
  const [tone, setTone] = useState<'default' | 'error'>('default');
  const [resultOrder, setResultOrder] = useState<number[] | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMs, setSpeedMs] = useState(750);
  const speedMsRef = useRef(speedMs);
  useEffect(() => {
    speedMsRef.current = speedMs;
  }, [speedMs]);

  const [valueInput, setValueInput] = useState('');

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'ab-0', time: '00:00', text: 'Árbol de ejemplo cargado: 8, 3, 10, 1, 6, 14, 4.', type: 'info' },
  ]);

  const stepsRef = useRef<TreeStep[]>([]);
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

  const applyStep = (step: TreeStep) => {
    setRoot(step.root);
    setActiveLine(step.line);
    setTone(step.tone ?? 'default');
    setCaption(step.logText);
    if (step.resultOrder) setResultOrder(step.resultOrder);
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

  const runOperation = (steps: TreeStep[]) => {
    if (isRunning || steps.length === 0) return;
    stepsRef.current = steps;
    stepIndexRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
    setResultOrder(null);
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

  const parsedValue = Number.parseInt(valueInput, 10);
  const hasValidValue = valueInput.trim() !== '' && !Number.isNaN(parsedValue);

  const handleInsert = () => {
    if (isRunning || !hasValidValue) return;
    runOperation(buildInsertSteps(root, parsedValue));
    setValueInput('');
  };

  const handleSearch = () => {
    if (isRunning || !hasValidValue) return;
    runOperation(buildSearchSteps(root, parsedValue));
  };

  const handleTraverse = (order: 'inorder' | 'preorder' | 'postorder') => {
    if (isRunning) return;
    runOperation(buildTraverseSteps(root, order));
  };

  const handleClear = () => {
    if (isRunning) return;
    setRoot(null);
    setActiveLine(12);
    setTone('default');
    setResultOrder(null);
    setCaption('self.raiz = None → árbol vaciado.');
    addLog('Árbol vaciado completamente.', 'info');
  };

  const handleLoadSample = () => {
    if (isRunning) return;
    setRoot(seedTree());
    setActiveLine(12);
    setTone('default');
    setResultOrder(null);
    setCaption('Ejemplo recargado: 8, 3, 10, 1, 6, 14, 4.');
    addLog('Ejemplo recargado.', 'info');
  };

  const { nodes, width, height } = layoutTree(root);

  const statusStyle = (status: TreeNode['status']) => {
    switch (status) {
      case 'checking':
        return { fill: '#ffb95f', text: '#472a00', stroke: '#ffddb8' };
      case 'found':
        return { fill: '#4cd7f6', text: '#003640', stroke: '#acedff' };
      case 'visited':
        return { fill: '#a078ff', text: '#340080', stroke: '#d0bcff' };
      case 'new':
        return { fill: '#03b5d3', text: '#001f26', stroke: '#4cd7f6' };
      default:
        return { fill: '#262a35', text: '#dfe2f1', stroke: '#313540' };
    }
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Header */}
      <section className="w-full px-4 lg:px-6 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">Árboles Binarios</h1>
        <p className="text-xs text-[#958ea0] mt-0.5">
          En un BST, izquierda es siempre menor y derecha es siempre mayor — así se busca sin revisar todo.
        </p>
      </section>

      {/* Command bar */}
      <section className="w-full px-4 lg:px-6 pb-3 flex flex-wrap items-center gap-2">
        <input
          type="number"
          placeholder="Valor (ej: 7)"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
          disabled={isRunning}
          className="w-28 bg-[#171b26] border border-[#262a35] rounded-lg px-3 py-1.5 text-xs text-[#dfe2f1] placeholder-[#6b6678] focus:outline-none focus:border-[#d0bcff] transition-all disabled:opacity-50"
        />
        <button
          onClick={handleInsert}
          disabled={isRunning || !hasValidValue}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a078ff] text-[#340080] text-xs font-semibold hover:bg-[#d0bcff] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" /> Insertar
        </button>
        <button
          onClick={handleSearch}
          disabled={isRunning || !hasValidValue}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#4cd7f6] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search className="w-3.5 h-3.5" /> Buscar
        </button>
        <button
          onClick={() => handleTraverse('inorder')}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#ffb95f] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ListOrdered className="w-3.5 h-3.5" /> Inorder
        </button>
        <button
          onClick={() => handleTraverse('preorder')}
          disabled={isRunning}
          type="button"
          className="px-3 py-1.5 rounded-lg text-[#cbc3d7] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Preorder
        </button>
        <button
          onClick={() => handleTraverse('postorder')}
          disabled={isRunning}
          type="button"
          className="px-3 py-1.5 rounded-lg text-[#cbc3d7] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Postorder
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

        {resultOrder && (
          <span className="text-[#958ea0]">
            Resultado: <span className="text-[#dfe2f1] font-mono">[{resultOrder.join(', ')}]</span>
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

      {/* Main grid: árbol + python */}
      <div className="w-full px-4 lg:px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 min-h-[300px] overflow-x-auto flex items-center justify-center">
            {!root ? (
              <span className="text-xs text-[#6b6678]">Árbol vacío</span>
            ) : (
              <svg width={width + NODE_RADIUS * 2} height={height} className="overflow-visible">
                <g transform={`translate(${NODE_RADIUS}, 10)`}>
                  {nodes.map(({ node, x, y }) => {
                    const parentEntries: { x1: number; y1: number; x2: number; y2: number }[] = [];
                    if (node.left) {
                      const child = nodes.find((n) => n.node.id === node.left!.id);
                      if (child) parentEntries.push({ x1: x * SPACING_X, y1: y * SPACING_Y, x2: child.x * SPACING_X, y2: child.y * SPACING_Y });
                    }
                    if (node.right) {
                      const child = nodes.find((n) => n.node.id === node.right!.id);
                      if (child) parentEntries.push({ x1: x * SPACING_X, y1: y * SPACING_Y, x2: child.x * SPACING_X, y2: child.y * SPACING_Y });
                    }
                    return parentEntries.map((e, i) => (
                      <line key={`${node.id}-edge-${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#313540" strokeWidth={2} />
                    ));
                  })}
                  {nodes.map(({ node, x, y }) => {
                    const style = statusStyle(node.status);
                    return (
                      <g key={node.id} transform={`translate(${x * SPACING_X}, ${y * SPACING_Y})`}>
                        <circle
                          r={NODE_RADIUS}
                          fill={style.fill}
                          stroke={style.stroke}
                          strokeWidth={2}
                          className={node.status === 'new' ? 'animate-queue-enqueue' : undefined}
                        />
                        <text textAnchor="middle" dominantBaseline="central" fill={style.text} fontSize={12} fontWeight="bold">
                          {node.value}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>

          <OperationLogPanel logs={logs} onClear={() => setLogs([])} />
        </div>

        <div className="lg:col-span-5 h-[520px]">
          <PythonCodePanel filename="arbol_binario.py" lines={TREE_CODE} activeLine={activeLine} caption={caption} tone={tone} />
        </div>
      </div>

      {/* Theory — repaso */}
      <div className="w-full px-4 lg:px-6">
        <TheoryCards cards={arbolesTheoryCards} />
      </div>
    </div>
  );
};
