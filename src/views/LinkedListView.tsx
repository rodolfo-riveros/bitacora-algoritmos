/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  Search,
  ListOrdered,
  Sparkles,
  RotateCcw,
  Play,
  Pause,
  StepForward,
  Gauge,
  ArrowRight,
  Link2,
  Hash,
  Clock,
} from 'lucide-react';
import { LogEntry, CodeLine } from '../types';
import { PythonCodePanel } from '../components/PythonCodePanel';
import { OperationLogPanel } from '../components/OperationLogPanel';
import { TheoryCards, TheoryCard } from '../components/TheoryCards';
import { getSwatch } from '../constants/palette';

// ---------------------------------------------------------------------------
// Modelo de datos y "motor" de micro-pasos
// ---------------------------------------------------------------------------

interface VisualNode {
  id: string;
  value: string;
  status?: 'current' | 'found' | 'removing' | 'new' | null;
}

interface PointerTag {
  nodeId: string;
  label: string;
}

interface SimStep {
  line: number | null;
  logText?: string;
  logType?: LogEntry['type'];
  nodes: VisualNode[];
  staged?: VisualNode | null;
  pointers?: PointerTag[];
  comparisonsDelta?: number;
}

const genId = () => `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const cloneNodes = (nodes: VisualNode[]): VisualNode[] => nodes.map((n) => ({ id: n.id, value: n.value, status: null }));

// ---------------------------------------------------------------------------
// Código Python de referencia (los números de línea son los que se resaltan)
// ---------------------------------------------------------------------------

const LINKED_LIST_CODE: CodeLine[] = [
  { num: 1, code: 'class Nodo:' },
  { num: 2, code: '    def __init__(self, valor):' },
  { num: 3, code: '        self.valor = valor' },
  { num: 4, code: '        self.next = None' },
  { num: 5, code: '' },
  { num: 6, code: 'class ListaEnlazada:' },
  { num: 7, code: '    def __init__(self):' },
  { num: 8, code: '        self.head = None' },
  { num: 9, code: '' },
  { num: 10, code: '    def insertar_al_inicio(self, valor):' },
  { num: 11, code: '        nuevo = Nodo(valor)' },
  { num: 12, code: '        nuevo.next = self.head' },
  { num: 13, code: '        self.head = nuevo' },
  { num: 14, code: '' },
  { num: 15, code: '    def insertar_al_final(self, valor):' },
  { num: 16, code: '        nuevo = Nodo(valor)' },
  { num: 17, code: '        if self.head is None:' },
  { num: 18, code: '            self.head = nuevo' },
  { num: 19, code: '            return' },
  { num: 20, code: '        actual = self.head' },
  { num: 21, code: '        while actual.next is not None:' },
  { num: 22, code: '            actual = actual.next' },
  { num: 23, code: '        actual.next = nuevo' },
  { num: 24, code: '' },
  { num: 25, code: '    def insertar_en_posicion(self, valor, index):' },
  { num: 26, code: '        if index == 0:' },
  { num: 27, code: '            self.insertar_al_inicio(valor)' },
  { num: 28, code: '            return' },
  { num: 29, code: '        nuevo = Nodo(valor)' },
  { num: 30, code: '        actual = self.head' },
  { num: 31, code: '        for _ in range(index - 1):' },
  { num: 32, code: '            actual = actual.next' },
  { num: 33, code: '        nuevo.next = actual.next' },
  { num: 34, code: '        actual.next = nuevo' },
  { num: 35, code: '' },
  { num: 36, code: '    def eliminar(self, valor):' },
  { num: 37, code: '        if self.head is None:' },
  { num: 38, code: '            return False' },
  { num: 39, code: '        if self.head.valor == valor:' },
  { num: 40, code: '            self.head = self.head.next' },
  { num: 41, code: '            return True' },
  { num: 42, code: '        anterior = self.head' },
  { num: 43, code: '        actual = self.head.next' },
  { num: 44, code: '        while actual is not None:' },
  { num: 45, code: '            if actual.valor == valor:' },
  { num: 46, code: '                anterior.next = actual.next' },
  { num: 47, code: '                return True' },
  { num: 48, code: '            anterior = actual' },
  { num: 49, code: '            actual = actual.next' },
  { num: 50, code: '        return False' },
  { num: 51, code: '' },
  { num: 52, code: '    def buscar(self, valor):' },
  { num: 53, code: '        actual = self.head' },
  { num: 54, code: '        posicion = 0' },
  { num: 55, code: '        while actual is not None:' },
  { num: 56, code: '            if actual.valor == valor:' },
  { num: 57, code: '                return posicion' },
  { num: 58, code: '            actual = actual.next' },
  { num: 59, code: '            posicion += 1' },
  { num: 60, code: '        return -1' },
  { num: 61, code: '' },
  { num: 62, code: '    def recorrer(self):' },
  { num: 63, code: '        actual = self.head' },
  { num: 64, code: '        valores = []' },
  { num: 65, code: '        while actual is not None:' },
  { num: 66, code: '            valores.append(actual.valor)' },
  { num: 67, code: '            actual = actual.next' },
  { num: 68, code: '        return valores' },
];

// ---------------------------------------------------------------------------
// Generadores de micro-pasos por operación
// ---------------------------------------------------------------------------

function buildInsertHeadSteps(source: VisualNode[], value: string): SimStep[] {
  const base = cloneNodes(source);
  const nuevo: VisualNode = { id: genId(), value, status: 'new' };
  const steps: SimStep[] = [];

  steps.push({
    line: 11,
    logText: `Se crea un nuevo nodo con valor "${value}".`,
    logType: 'info',
    nodes: base,
    staged: nuevo,
  });

  steps.push({
    line: 12,
    logText:
      base.length > 0
        ? `nuevo.next apunta al antiguo head ("${base[0].value}").`
        : 'nuevo.next apunta a NULL (la lista estaba vacía).',
    logType: 'info',
    nodes: base,
    staged: nuevo,
    pointers: base.length > 0 ? [{ nodeId: base[0].id, label: 'antiguo head' }] : [],
  });

  steps.push({
    line: 13,
    logText: `head ahora apunta al nuevo nodo "${value}". Inserción en O(1).`,
    logType: 'success',
    nodes: [{ ...nuevo, status: null }, ...base],
    staged: null,
  });

  return steps;
}

function buildInsertTailSteps(source: VisualNode[], value: string): SimStep[] {
  const base = cloneNodes(source);
  const nuevo: VisualNode = { id: genId(), value, status: 'new' };
  const steps: SimStep[] = [];

  steps.push({
    line: 16,
    logText: `Se crea un nuevo nodo con valor "${value}".`,
    logType: 'info',
    nodes: base,
    staged: nuevo,
  });

  if (base.length === 0) {
    steps.push({
      line: 17,
      logText: 'self.head is None → la lista está vacía.',
      logType: 'info',
      nodes: base,
      staged: nuevo,
    });
    steps.push({
      line: 18,
      logText: `head apunta directamente al nuevo nodo "${value}".`,
      logType: 'success',
      nodes: [{ ...nuevo, status: null }],
      staged: null,
    });
    return steps;
  }

  steps.push({
    line: 17,
    logText: 'self.head is None → False, la lista no está vacía.',
    logType: 'info',
    nodes: base,
    staged: nuevo,
  });

  steps.push({
    line: 20,
    logText: `actual = head ("${base[0].value}"). Se recorrerá hasta el último nodo.`,
    logType: 'info',
    nodes: base,
    staged: nuevo,
    pointers: [{ nodeId: base[0].id, label: 'actual' }],
  });

  for (let i = 0; i < base.length - 1; i++) {
    steps.push({
      line: 21,
      logText: `actual.next no es None → avanza a "${base[i + 1].value}".`,
      logType: 'info',
      nodes: base,
      staged: nuevo,
      pointers: [{ nodeId: base[i].id, label: 'actual' }],
    });
    steps.push({
      line: 22,
      logText: `actual = actual.next ("${base[i + 1].value}").`,
      logType: 'info',
      nodes: base,
      staged: nuevo,
      pointers: [{ nodeId: base[i + 1].id, label: 'actual' }],
    });
  }

  const last = base[base.length - 1];
  steps.push({
    line: 21,
    logText: `actual.next es None → "${last.value}" es el último nodo.`,
    logType: 'info',
    nodes: base,
    staged: nuevo,
    pointers: [{ nodeId: last.id, label: 'actual' }],
  });

  steps.push({
    line: 23,
    logText: `actual.next = nuevo. "${value}" queda enlazado al final. Inserción en O(n).`,
    logType: 'success',
    nodes: [...base, { ...nuevo, status: null }],
    staged: null,
  });

  return steps;
}

function buildInsertAtSteps(source: VisualNode[], value: string, indexRaw: number): SimStep[] {
  const base = cloneNodes(source);
  const index = Math.max(0, Math.min(indexRaw, base.length));

  if (index === 0) {
    const steps = buildInsertHeadSteps(source, value);
    steps.unshift({
      line: 26,
      logText: 'index == 0 → se delega en insertar_al_inicio(valor).',
      logType: 'info',
      nodes: base,
      staged: null,
    });
    return steps;
  }

  const nuevo: VisualNode = { id: genId(), value, status: 'new' };
  const steps: SimStep[] = [];

  steps.push({
    line: 29,
    logText: `Se crea un nuevo nodo con valor "${value}" para insertarlo en la posición ${index}.`,
    logType: 'info',
    nodes: base,
    staged: nuevo,
  });

  steps.push({
    line: 30,
    logText: `actual = head ("${base[0].value}").`,
    logType: 'info',
    nodes: base,
    staged: nuevo,
    pointers: [{ nodeId: base[0].id, label: 'actual' }],
  });

  let currentIdx = 0;
  for (let hop = 0; hop < index - 1; hop++) {
    steps.push({
      line: 32,
      logText: `actual = actual.next ("${base[currentIdx + 1].value}"). Paso ${hop + 1} de ${index - 1}.`,
      logType: 'info',
      nodes: base,
      staged: nuevo,
      pointers: [{ nodeId: base[currentIdx + 1].id, label: 'actual' }],
    });
    currentIdx++;
  }

  const prevNode = base[currentIdx];
  const nextNode = base[currentIdx + 1];

  steps.push({
    line: 33,
    logText: nextNode
      ? `nuevo.next = actual.next ("${nextNode.value}").`
      : 'nuevo.next = actual.next (None, actual era el último nodo).',
    logType: 'info',
    nodes: base,
    staged: nuevo,
    pointers: [{ nodeId: prevNode.id, label: 'actual' }],
  });

  const finalNodes = [...base.slice(0, currentIdx + 1), { ...nuevo, status: null }, ...base.slice(currentIdx + 1)];

  steps.push({
    line: 34,
    logText: `actual.next = nuevo. "${value}" queda insertado en la posición ${index}. Inserción en O(n).`,
    logType: 'success',
    nodes: finalNodes,
    staged: null,
  });

  return steps;
}

function buildDeleteSteps(source: VisualNode[], value: string): SimStep[] {
  const base = cloneNodes(source);
  const steps: SimStep[] = [];

  if (base.length === 0) {
    steps.push({
      line: 37,
      logText: 'self.head is None → la lista está vacía. eliminar() retorna False.',
      logType: 'error',
      nodes: base,
    });
    return steps;
  }

  steps.push({
    line: 39,
    logText: `¿head.valor ("${base[0].value}") == "${value}"?`,
    logType: 'info',
    nodes: base,
    pointers: [{ nodeId: base[0].id, label: 'head' }],
  });

  if (base[0].value === value) {
    steps.push({
      line: 40,
      logText: `Coincide. El nodo "${value}" será desenlazado (era el head).`,
      logType: 'pop',
      nodes: base.map((n, i) => (i === 0 ? { ...n, status: 'removing' as const } : n)),
      pointers: [{ nodeId: base[0].id, label: 'head' }],
    });
    steps.push({
      line: 41,
      logText: `head = head.next. Eliminación completada en O(1).`,
      logType: 'success',
      nodes: base.slice(1),
    });
    return steps;
  }

  steps.push({
    line: 42,
    logText: `No coincide. anterior = head ("${base[0].value}").`,
    logType: 'info',
    nodes: base,
    pointers: [{ nodeId: base[0].id, label: 'anterior' }],
  });

  steps.push({
    line: 43,
    logText: base[1]
      ? `actual = anterior.next ("${base[1].value}").`
      : 'actual = anterior.next (None).',
    logType: 'info',
    nodes: base,
    pointers: [{ nodeId: base[0].id, label: 'anterior' }, ...(base[1] ? [{ nodeId: base[1].id, label: 'actual' }] : [])],
  });

  for (let i = 1; i < base.length; i++) {
    steps.push({
      line: 45,
      logText: `¿actual.valor ("${base[i].value}") == "${value}"?`,
      logType: 'info',
      nodes: base,
      pointers: [
        { nodeId: base[i - 1].id, label: 'anterior' },
        { nodeId: base[i].id, label: 'actual' },
      ],
    });

    if (base[i].value === value) {
      steps.push({
        line: 46,
        logText: `Coincide. anterior.next = actual.next. El nodo "${value}" queda desenlazado.`,
        logType: 'pop',
        nodes: base.map((n, idx) => (idx === i ? { ...n, status: 'removing' as const } : n)),
        pointers: [
          { nodeId: base[i - 1].id, label: 'anterior' },
          { nodeId: base[i].id, label: 'actual' },
        ],
      });
      steps.push({
        line: 47,
        logText: 'Eliminación completada. Costo O(n) por la búsqueda previa.',
        logType: 'success',
        nodes: base.filter((_, idx) => idx !== i),
      });
      return steps;
    }

    if (i < base.length - 1) {
      steps.push({
        line: 49,
        logText: `No coincide. anterior = actual ("${base[i].value}"), actual = actual.next ("${base[i + 1].value}").`,
        logType: 'info',
        nodes: base,
        pointers: [
          { nodeId: base[i].id, label: 'anterior' },
          { nodeId: base[i + 1].id, label: 'actual' },
        ],
      });
    }
  }

  steps.push({
    line: 50,
    logText: `Se llegó a NULL sin encontrar "${value}". eliminar() retorna False.`,
    logType: 'error',
    nodes: base,
  });

  return steps;
}

function buildSearchSteps(source: VisualNode[], value: string): SimStep[] {
  const base = cloneNodes(source);
  const steps: SimStep[] = [];

  steps.push({
    line: 53,
    logText: 'actual = head. posicion = 0.',
    logType: 'info',
    nodes: base,
    pointers: base.length > 0 ? [{ nodeId: base[0].id, label: 'actual' }] : [],
  });

  for (let i = 0; i < base.length; i++) {
    steps.push({
      line: 56,
      logText: `¿actual.valor ("${base[i].value}") == "${value}"? (comparación #${i + 1})`,
      logType: 'info',
      nodes: base.map((n, idx) => (idx === i ? { ...n, status: 'current' as const } : n)),
      pointers: [{ nodeId: base[i].id, label: 'actual' }],
      comparisonsDelta: 1,
    });

    if (base[i].value === value) {
      steps.push({
        line: 57,
        logText: `¡Encontrado! "${value}" está en la posición ${i}.`,
        logType: 'success',
        nodes: base.map((n, idx) => (idx === i ? { ...n, status: 'found' as const } : n)),
        pointers: [{ nodeId: base[i].id, label: 'actual' }],
      });
      return steps;
    }

    if (i < base.length - 1) {
      steps.push({
        line: 58,
        logText: `actual = actual.next ("${base[i + 1].value}"). posicion = ${i + 1}.`,
        logType: 'info',
        nodes: base,
        pointers: [{ nodeId: base[i + 1].id, label: 'actual' }],
      });
    }
  }

  steps.push({
    line: 60,
    logText: `Se llegó a NULL. "${value}" no está en la lista. buscar() retorna -1.`,
    logType: 'error',
    nodes: base,
  });

  return steps;
}

function buildTraverseSteps(source: VisualNode[]): SimStep[] {
  const base = cloneNodes(source);
  const steps: SimStep[] = [];

  steps.push({
    line: 63,
    logText: 'actual = head. valores = [].',
    logType: 'info',
    nodes: base,
    pointers: base.length > 0 ? [{ nodeId: base[0].id, label: 'actual' }] : [],
  });

  if (base.length === 0) {
    steps.push({
      line: 65,
      logText: 'actual es None de inmediato: la lista está vacía.',
      logType: 'info',
      nodes: base,
    });
    return steps;
  }

  const collected: string[] = [];
  for (let i = 0; i < base.length; i++) {
    collected.push(base[i].value);
    steps.push({
      line: 66,
      logText: `valores.append("${base[i].value}") → [${collected.join(', ')}]`,
      logType: 'info',
      nodes: base.map((n, idx) => (idx === i ? { ...n, status: 'current' as const } : n)),
      pointers: [{ nodeId: base[i].id, label: 'actual' }],
    });
    if (i < base.length - 1) {
      steps.push({
        line: 67,
        logText: `actual = actual.next ("${base[i + 1].value}").`,
        logType: 'info',
        nodes: base,
        pointers: [{ nodeId: base[i + 1].id, label: 'actual' }],
      });
    }
  }

  steps.push({
    line: 67,
    logText: `actual llega a None. Recorrido completo: [${collected.join(', ')}]`,
    logType: 'success',
    nodes: base,
  });

  return steps;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

const SEED_NODES: VisualNode[] = ['10', '25', '7'].map((value) => ({ id: genId(), value }));

export const LinkedListView: React.FC = () => {
  const [nodes, setNodes] = useState<VisualNode[]>(SEED_NODES);
  const [staged, setStaged] = useState<VisualNode | null>(null);
  const [pointers, setPointers] = useState<PointerTag[]>([]);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [comparisons, setComparisons] = useState(0);
  const [stepProgress, setStepProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMs, setSpeedMs] = useState(800);
  const speedMsRef = useRef(speedMs);
  useEffect(() => {
    speedMsRef.current = speedMs;
  }, [speedMs]);

  const [valueInput, setValueInput] = useState('');
  const [indexInput, setIndexInput] = useState('0');

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'll-log-1', time: '00:00', text: 'Lista enlazada inicializada con 3 nodos de ejemplo.', type: 'info' },
  ]);

  const stepsRef = useRef<SimStep[]>([]);
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

  const applyStep = (step: SimStep, idx: number, total: number) => {
    setActiveLine(step.line);
    setNodes(step.nodes);
    setStaged(step.staged ?? null);
    setPointers(step.pointers ?? []);
    if (step.comparisonsDelta) setComparisons((c) => c + step.comparisonsDelta!);
    if (step.logText) {
      addLog(step.logText, step.logType ?? 'info');
      setCaption(step.logText);
    }
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

  const runOperation = (steps: SimStep[]) => {
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

  const getValueOrFallback = () => valueInput.trim() || `Nodo_${nodes.length + 1}`;

  const handleInsertHead = () => {
    if (isRunning) return;
    runOperation(buildInsertHeadSteps(nodes, getValueOrFallback()));
    setValueInput('');
  };

  const handleInsertTail = () => {
    if (isRunning) return;
    runOperation(buildInsertTailSteps(nodes, getValueOrFallback()));
    setValueInput('');
  };

  const handleInsertAt = () => {
    if (isRunning) return;
    const idx = Number.parseInt(indexInput, 10);
    runOperation(buildInsertAtSteps(nodes, getValueOrFallback(), Number.isFinite(idx) ? idx : nodes.length));
    setValueInput('');
  };

  const handleDelete = () => {
    if (isRunning || !valueInput.trim()) return;
    runOperation(buildDeleteSteps(nodes, valueInput.trim()));
    setValueInput('');
  };

  const handleSearch = () => {
    if (isRunning || !valueInput.trim()) return;
    runOperation(buildSearchSteps(nodes, valueInput.trim()));
  };

  const handleTraverse = () => {
    if (isRunning) return;
    runOperation(buildTraverseSteps(nodes));
  };

  const handleClear = () => {
    if (isRunning) return;
    setNodes([]);
    setStaged(null);
    setPointers([]);
    setActiveLine(null);
    setCaption(null);
    setComparisons(0);
    setStepProgress({ current: 0, total: 0 });
    addLog('Lista vaciada completamente.', 'info');
  };

  const handleLoadSample = () => {
    if (isRunning) return;
    const sample = ['10', '25', '7'].map((value) => ({ id: genId(), value }));
    setNodes(sample);
    setStaged(null);
    setPointers([]);
    setActiveLine(null);
    setCaption(null);
    setComparisons(0);
    setStepProgress({ current: 0, total: 0 });
    addLog('Lista de ejemplo cargada: [10, 25, 7].', 'info');
  };

  const pointersByNode: Record<string, string[]> = {};
  pointers.forEach((p) => {
    (pointersByNode[p.nodeId] ??= []).push(p.label);
  });

  const renderNodeCard = (node: VisualNode, isHead: boolean, colorIndex: number) => {
    const tags = pointersByNode[node.id] ?? [];
    const swatch = getSwatch(colorIndex);
    const statusStyle =
      node.status === 'found'
        ? 'bg-[#4cd7f6] text-[#003640] border-[#acedff] shadow-[0_0_18px_rgba(76,215,246,0.7)]'
        : node.status === 'removing'
        ? 'bg-[#93000a]/30 text-[#ffb4ab] border-[#ffb4ab] animate-queue-dequeue'
        : node.status === 'current'
        ? 'bg-[#ffb95f] text-[#472a00] border-[#ffddb8] shadow-[0_0_14px_rgba(255,185,95,0.5)]'
        : node.status === 'new'
        ? 'bg-[#a078ff] text-[#340080] border-[#d0bcff] animate-queue-enqueue'
        : `${swatch.bg} ${swatch.text} ${swatch.border} ${swatch.shadow}`;

    return (
      <div key={node.id} className="flex flex-col items-center gap-1 shrink-0">
        <span
          className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider ${
            isHead ? 'bg-[#d0bcff] text-[#3c0091]' : 'opacity-0 select-none'
          }`}
        >
          HEAD
        </span>
        <div
          className={`w-20 h-14 rounded-lg border flex items-center justify-center font-mono text-xs font-bold transition-all duration-300 ${statusStyle}`}
        >
          <span className="truncate max-w-[70px] px-1">{node.value}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 min-h-[18px]">
          {tags.map((t) => (
            <span
              key={t}
              className="px-1.5 py-0.5 rounded bg-[#0a0e18] border border-[#4cd7f6]/40 text-[#4cd7f6] font-mono text-[9px] whitespace-nowrap"
            >
              ◄ {t}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const theoryCards: TheoryCard[] = [
    {
      icon: Link2,
      eyebrow: 'Principio Rector',
      title: '¿Qué es una Lista Enlazada?',
      accent: 'primary',
      body: (
        <>
          Una secuencia de <strong className="text-[#dfe2f1]">nodos</strong>, cada uno con un valor y un puntero{' '}
          <code className="text-[#d0bcff]">.next</code> al siguiente nodo. A diferencia de un arreglo, no ocupa
          memoria contigua: para llegar al nodo N hay que recorrer los N-1 anteriores.
        </>
      ),
      footer: <span>➔ head apunta al primer nodo, el último apunta a NULL</span>,
    },
    {
      icon: Hash,
      eyebrow: 'Primitivas de Datos',
      title: 'Operaciones Principales',
      accent: 'tertiary',
      body: (
        <div className="space-y-1">
          <p>
            <code className="text-[#ffb95f] font-bold">insertar_al_inicio(valor)</code>: reasigna head — O(1).
          </p>
          <p>
            <code className="text-[#4cd7f6] font-bold">insertar_al_final / eliminar(valor)</code>: recorre la
            lista primero — O(n).
          </p>
          <p>
            <code className="text-[#d0bcff] font-bold">buscar(valor)</code>: compara nodo por nodo hasta
            encontrarlo o llegar a NULL — O(n).
          </p>
        </div>
      ),
      footer: (
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> El costo depende de qué tan lejos del head esté el nodo
        </span>
      ),
    },
    {
      icon: Gauge,
      eyebrow: 'Análisis Asintótico',
      title: 'Lista Enlazada vs. Arreglo',
      accent: 'secondary',
      body: (
        <div className="space-y-1">
          <p>
            <strong className="text-[#dfe2f1]">Inserción/eliminación al inicio:</strong>{' '}
            <code className="text-[#4cd7f6] font-bold">O(1)</code> en lista enlazada vs.{' '}
            <code className="text-[#ffb95f] font-bold">O(n)</code> en arreglo (hay que desplazar todo).
          </p>
          <p>
            <strong className="text-[#dfe2f1]">Acceso por índice:</strong>{' '}
            <code className="text-[#ffb95f] font-bold">O(n)</code> en lista enlazada vs.{' '}
            <code className="text-[#4cd7f6] font-bold">O(1)</code> en arreglo (acceso directo).
          </p>
        </div>
      ),
      footer: <span>✓ Cada estructura gana según la operación que más se repita</span>,
    },
  ];

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Header */}
      <section className="w-full px-4 lg:px-6 pt-6 pb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">Listas Enlazadas</h1>
          <p className="text-xs text-[#958ea0] mt-0.5">
            Piénsalo como un tren 🚂 — cada vagón (nodo) solo conoce al siguiente.
          </p>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs text-[#958ea0]">
          <span>
            Nodos <strong className="text-[#dfe2f1]">{nodes.length}</strong>
          </span>
          {comparisons > 0 && (
            <span>
              Comparaciones <strong className="text-[#ffb95f]">{comparisons}</strong>
            </span>
          )}
        </div>
      </section>

      {/* Command bar */}
      <section className="w-full px-4 lg:px-6 pb-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Valor (ej: 42, Nodo_A)"
          value={valueInput}
          onChange={(e) => setValueInput(e.target.value)}
          disabled={isRunning}
          className="w-40 bg-[#171b26] border border-[#262a35] rounded-lg px-3 py-1.5 text-xs text-[#dfe2f1] placeholder-[#6b6678] focus:outline-none focus:border-[#d0bcff] transition-all disabled:opacity-50"
        />
        <input
          type="number"
          min={0}
          placeholder="Índice"
          value={indexInput}
          onChange={(e) => setIndexInput(e.target.value)}
          disabled={isRunning}
          className="w-16 bg-[#171b26] border border-[#262a35] rounded-lg px-2.5 py-1.5 text-xs text-[#dfe2f1] placeholder-[#6b6678] focus:outline-none focus:border-[#d0bcff] transition-all disabled:opacity-50"
        />

        <button
          onClick={handleInsertHead}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a078ff] text-[#340080] text-xs font-semibold hover:bg-[#d0bcff] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" /> Al Inicio
        </button>
        <button
          onClick={handleInsertTail}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03b5d3] text-[#001f26] text-xs font-semibold hover:bg-[#4cd7f6] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" /> Al Final
        </button>
        <button
          onClick={handleInsertAt}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171b26] text-[#d0bcff] text-xs font-medium hover:bg-[#262a35] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ListOrdered className="w-3.5 h-3.5" /> En Posición
        </button>
        <button
          onClick={handleSearch}
          disabled={isRunning || !valueInput.trim()}
          type="button"
          title={!valueInput.trim() ? 'Escribe un valor para buscar' : undefined}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171b26] text-[#4cd7f6] text-xs font-medium hover:bg-[#262a35] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Search className="w-3.5 h-3.5" /> Buscar
        </button>
        <button
          onClick={handleDelete}
          disabled={isRunning || !valueInput.trim()}
          type="button"
          title={!valueInput.trim() ? 'Escribe un valor para eliminar' : undefined}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171b26] text-[#ffb95f] text-xs font-medium hover:bg-[#262a35] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
        <button
          onClick={handleTraverse}
          disabled={isRunning}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171b26] text-[#cbc3d7] text-xs font-medium hover:bg-[#262a35] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ListOrdered className="w-3.5 h-3.5" /> Recorrer
        </button>

        <span className="w-px h-5 bg-[#262a35] mx-1 hidden sm:block" />

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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d0bcff] text-[#3c0091] font-semibold hover:bg-[#e9ddff] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRunning && !isPaused ? (
            <>
              <Pause className="w-4 h-4" /> <span>Pausar</span>
            </>
          ) : isRunning && isPaused ? (
            <>
              <Play className="w-4 h-4" /> <span>Reanudar</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> <span>Reproducir</span>
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

      {/* Main grid: visual list + python */}
      <div className="w-full px-4 lg:px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="w-full bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 lg:p-6 flex flex-col relative overflow-hidden min-h-[340px]">
            {staged && (
              <div className="mb-3 p-2.5 rounded-lg border border-dashed border-[#a078ff]/50 bg-[#a078ff]/5 flex items-center gap-3 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-[#d0bcff]">
                  En preparación (aún sin enlazar):
                </span>
                {renderNodeCard(staged, false, nodes.length)}
              </div>
            )}

            <div className="flex-1 flex flex-wrap items-start content-center gap-x-1 gap-y-4 py-4">
              {nodes.length === 0 && !staged ? (
                <div className="w-full flex flex-col items-center justify-center text-[#6b6678] text-xs gap-1 py-10">
                  <span>Lista vacía — head → NULL</span>
                  <span className="text-[11px]">Inserta un valor arriba o carga el ejemplo.</span>
                </div>
              ) : (
                <>
                  {nodes.map((node, idx) => (
                    <React.Fragment key={node.id}>
                      {renderNodeCard(node, idx === 0, idx)}
                      <ArrowRight className="w-4 h-4 text-[#494454] shrink-0 mt-5" />
                    </React.Fragment>
                  ))}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="px-2 py-0.5 text-[9px] uppercase opacity-0 select-none">HEAD</span>
                    <div className="w-16 h-14 rounded-lg border border-dashed border-[#494454] flex items-center justify-center text-[10px] text-[#6b6678] shrink-0">
                      NULL
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <OperationLogPanel logs={logs} onClear={() => setLogs([])} />
        </div>

        <div className="lg:col-span-5 h-[520px]">
          <PythonCodePanel filename="lista_enlazada.py" lines={LINKED_LIST_CODE} activeLine={activeLine} caption={caption} />
        </div>
      </div>

      <div className="w-full px-4 lg:px-6">
        <TheoryCards cards={theoryCards} />
      </div>
    </div>
  );
};
