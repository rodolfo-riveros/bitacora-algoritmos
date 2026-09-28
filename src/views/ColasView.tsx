import React, { useState } from 'react';
import { ListOrdered, ArrowRight, Plus, Trash2, Eye, AlertCircle, Zap, Clock, Gamepad2 } from 'lucide-react';
import { PythonCodePanel } from '../components/PythonCodePanel';
import { OperationLogPanel } from '../components/OperationLogPanel';
import { TheoryCards, TheoryCard } from '../components/TheoryCards';
import { getSwatch } from '../constants/palette';
import { LogEntry, CodeLine } from '../types';
import { HotPotatoGame } from './HotPotatoGame';

const QUEUE_CODE: CodeLine[] = [
  { num: 1, code: 'class Cola:' },
  { num: 2, code: '    def __init__(self):' },
  { num: 3, code: '        self.elementos = []' },
  { num: 4, code: '' },
  { num: 5, code: '    def enqueue(self, dato):' },
  { num: 6, code: '        self.elementos.append(dato)' },
  { num: 7, code: '        print(f"Encolaste: {dato}")' },
  { num: 8, code: '' },
  { num: 9, code: '    def dequeue(self):' },
  { num: 10, code: '        if len(self.elementos) == 0:' },
  { num: 11, code: '            print("La cola está vacía, no hay nada que atender")' },
  { num: 12, code: '            return None' },
  { num: 13, code: '        dato = self.elementos.pop(0)' },
  { num: 14, code: '        print(f"Desencolaste: {dato}")' },
  { num: 15, code: '        return dato' },
  { num: 16, code: '' },
  { num: 17, code: '    def peek(self):' },
  { num: 18, code: '        if len(self.elementos) == 0:' },
  { num: 19, code: '            print("La cola está vacía")' },
  { num: 20, code: '            return None' },
  { num: 21, code: '        return self.elementos[0]' },
];

interface QueueItem {
  id: string;
  value: string;
  animating?: 'enqueue' | 'dequeue' | null;
}

const colasTheoryCards: TheoryCard[] = [
  {
    icon: ListOrdered,
    eyebrow: 'Principio Rector',
    title: 'Repaso: Cola (Queue) — FIFO',
    accent: 'secondary',
    body: (
      <>
        <strong className="text-[#dfe2f1]">First-In, First-Out:</strong> el primer valor en entrar es el primero
        en salir, como una fila de personas. Se entra por el final (Tail) y se sale por el frente (Head).
      </>
    ),
    footer: <span>➔ Dos puntos de acceso: Head (sale) y Tail (entra)</span>,
  },
  {
    icon: Zap,
    eyebrow: 'Primitivas de Datos',
    title: 'enqueue() / dequeue() / peek()',
    accent: 'tertiary',
    body: (
      <>
        <code className="text-[#4cd7f6] font-bold">enqueue(dato)</code>: agrega al final.{' '}
        <code className="text-[#ffb95f] font-bold">dequeue()</code>: saca y devuelve el del frente.{' '}
        <code className="text-[#d0bcff] font-bold">peek()</code>: mira el del frente sin sacarlo.
      </>
    ),
    footer: (
      <span className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Las tres operan en tiempo constante O(1)
      </span>
    ),
  },
  {
    icon: Gamepad2,
    eyebrow: 'Ejemplo en Grande',
    title: 'Papa Caliente',
    accent: 'primary',
    body: (
      <>
        Cada "pase" es un <code className="text-[#ffb95f] font-bold">dequeue()</code> seguido de un{' '}
        <code className="text-[#4cd7f6] font-bold">enqueue()</code> del mismo jugador — la cola da toda la
        vuelta. Cuando se acaban los pases, el del frente queda eliminado con un{' '}
        <code className="text-[#d0bcff] font-bold">dequeue()</code> puro (sin volver a encolar).
      </>
    ),
    footer: <span>✓ Rotar una cola = dequeue() + enqueue() del mismo valor</span>,
  },
];

export const ColasView: React.FC = () => {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([
    { id: 'q-1', value: 'Cliente_A' },
    { id: 'q-2', value: 'Cliente_B' },
    { id: 'q-3', value: 'Cliente_C' },
  ]);
  const [queueInput, setQueueInput] = useState('');
  const queueCapacity = 6;
  const [queueMessage, setQueueMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' }>({
    text: 'Ingresa un valor y usa Enqueue, Dequeue o Peek.',
    type: 'info',
  });
  const [peekedQueueId, setPeekedQueueId] = useState<string | null>(null);
  const [isQueueBusy, setIsQueueBusy] = useState(false);
  const [queueActiveLine, setQueueActiveLine] = useState<number | null>(3);
  const [queueCaption, setQueueCaption] = useState<string | null>(
    'self.elementos = [] → la cola ya tiene 3 elementos cargados de ejemplo.'
  );
  const [queueTone, setQueueTone] = useState<'default' | 'error'>('default');

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'log-0', time: '00:00', text: 'Cola lista con 3 elementos. Frente inicial: Cliente_A', type: 'info' },
  ]);

  const addLog = (text: string, type: LogEntry['type']) => {
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const id = `${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`;
    setLogs((prev) => [...prev.slice(-40), { id, time: timeStr, text, type }]);
  };

  const handleEnqueue = (val?: string) => {
    if (isQueueBusy) return;
    const itemVal = (val !== undefined ? val : queueInput).trim() || `Turno_${queueItems.length + 1}`;

    setQueueActiveLine(6);

    if (queueItems.length >= queueCapacity) {
      setQueueTone('error');
      setQueueCaption(`enqueue() bloqueado: alcanzaste el límite visual de la cola (${queueCapacity}).`);
      setQueueMessage({ text: `¡Queue Overflow! Capacidad límite (${queueCapacity}) alcanzada.`, type: 'error' });
      return;
    }
    setQueueTone('default');

    const newItem: QueueItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      value: itemVal,
      animating: 'enqueue',
    };

    setIsQueueBusy(true);
    setQueueItems((prev) => [...prev, newItem]);
    setQueueInput('');
    setPeekedQueueId(null);
    setQueueCaption(`enqueue(dato) → self.elementos.append("${itemVal}") → imprime "Encolaste: ${itemVal}"`);
    setQueueMessage({ text: `enqueue("${itemVal}") ingresó al final (Tail).`, type: 'success' });
    addLog(`enqueue("${itemVal}") encolado al final`, 'push');

    setTimeout(() => {
      setQueueItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, animating: null } : item)));
      setIsQueueBusy(false);
    }, 420);
  };

  const handleDequeue = () => {
    if (isQueueBusy) return;

    if (queueItems.length === 0) {
      setQueueActiveLine(11);
      setQueueTone('error');
      setQueueCaption('if len(self.elementos) == 0 → True → imprime "La cola está vacía, no hay nada que atender"');
      setQueueMessage({ text: '¡Queue Underflow! No hay elementos en la cola.', type: 'error' });
      return;
    }

    const dequeuingItem = queueItems[0];
    setIsQueueBusy(true);
    setPeekedQueueId(null);
    setQueueItems((prev) => prev.map((item, idx) => (idx === 0 ? { ...item, animating: 'dequeue' } : item)));
    setQueueActiveLine(13);
    setQueueTone('default');
    setQueueCaption(`dato = self.elementos.pop(0) → retorna y elimina "${dequeuingItem.value}"`);
    setQueueMessage({ text: `dequeue() procesando a "${dequeuingItem.value}"...`, type: 'info' });

    setTimeout(() => {
      setQueueItems((prev) => prev.slice(1));
      setIsQueueBusy(false);
      setQueueMessage({ text: `dequeue() completado: "${dequeuingItem.value}" fue atendido.`, type: 'success' });
      addLog(`dequeue() atendió a "${dequeuingItem.value}"`, 'pop');
    }, 380);
  };

  const handlePeekQueue = () => {
    if (isQueueBusy) return;

    if (queueItems.length === 0) {
      setQueueActiveLine(19);
      setQueueTone('error');
      setQueueCaption('if len(self.elementos) == 0 → True → imprime "La cola está vacía"');
      setQueueMessage({ text: 'Cola vacía. peek() no tiene nada que devolver.', type: 'error' });
      return;
    }

    const frontItem = queueItems[0];
    setPeekedQueueId(frontItem.id);
    setQueueActiveLine(21);
    setQueueTone('default');
    setQueueCaption(`return self.elementos[0] → consulta "${frontItem.value}" sin modificar la cola`);
    setQueueMessage({ text: `peek() → "${frontItem.value}". No se retiró de la cola.`, type: 'info' });
    addLog(`peek() consultó frente "${frontItem.value}"`, 'info');

    setTimeout(() => setPeekedQueueId(null), 2000);
  };

  const handleClearQueue = () => {
    if (isQueueBusy) return;
    setQueueItems([]);
    setPeekedQueueId(null);
    setQueueActiveLine(3);
    setQueueTone('default');
    setQueueCaption('self.elementos = [] — botón de la interfaz, no un método de la clase; reinicia la cola.');
    setQueueMessage({ text: 'Cola vaciada.', type: 'info' });
    addLog('reiniciada a 0 elementos', 'info');
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Header */}
      <section className="w-full px-4 lg:px-6 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">Colas (Queue)</h1>
        <p className="text-xs text-[#958ea0] mt-0.5">Piénsalo como una fila de personas: el primero en llegar es el primero en salir.</p>
      </section>

      {/* Command bar */}
      <section className="w-full px-4 lg:px-6 pb-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Valor (ej: Cliente_1)"
          value={queueInput}
          onChange={(e) => setQueueInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEnqueue()}
          disabled={isQueueBusy}
          className="w-44 bg-[#171b26] border border-[#262a35] rounded-lg px-3 py-1.5 text-xs text-[#dfe2f1] placeholder-[#6b6678] focus:outline-none focus:border-[#4cd7f6] transition-all disabled:opacity-50"
        />
        <button
          onClick={() => handleEnqueue()}
          disabled={isQueueBusy || queueItems.length >= queueCapacity}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03b5d3] text-[#001f26] text-xs font-semibold hover:bg-[#4cd7f6] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" /> Enqueue
        </button>
        <button
          onClick={handleDequeue}
          disabled={isQueueBusy}
          type="button"
          title="Funciona incluso con la cola vacía, para que veas el aviso del código"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#ffb95f] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-3.5 h-3.5" /> Dequeue
        </button>
        <button
          onClick={handlePeekQueue}
          disabled={isQueueBusy}
          type="button"
          title="Funciona incluso con la cola vacía, para que veas el aviso del código"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#d0bcff] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Eye className="w-3.5 h-3.5" /> Peek
        </button>
        <button
          onClick={handleClearQueue}
          disabled={isQueueBusy || queueItems.length === 0}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#958ea0] hover:text-[#ffb4ab] text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Vaciar
        </button>
      </section>

      {queueMessage.type === 'error' && (
        <div className="mx-4 lg:mx-6 mb-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 bg-[#93000a]/20 text-[#ffb4ab]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{queueMessage.text}</span>
        </div>
      )}

      {/* Main grid: visual + python */}
      <div className="w-full px-4 lg:px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 min-h-[160px] flex flex-col justify-center">
            <div className="w-full flex items-center justify-between pb-2 text-[10px] text-[#958ea0]">
              <span className="text-[#ffb95f]">◄ Head (sale)</span>
              <span className="text-[#4cd7f6]">Tail (entra) ◄</span>
            </div>
            <div className="w-full flex items-center gap-2.5 overflow-x-auto py-3">
              {queueItems.length === 0 ? (
                <div className="w-full text-center text-[#6b6678] text-xs py-4">Cola vacía</div>
              ) : (
                queueItems.map((item, idx) => {
                  const isHead = idx === 0;
                  const isTail = idx === queueItems.length - 1;
                  const isPeeked = peekedQueueId === item.id;
                  let animClass = '';
                  if (item.animating === 'enqueue') animClass = 'animate-queue-enqueue';
                  if (item.animating === 'dequeue') animClass = 'animate-queue-dequeue';
                  if (isPeeked) animClass = 'animate-peek-pulse';
                  const swatch = getSwatch(idx);

                  return (
                    <div
                      key={item.id}
                      className={`h-14 min-w-[110px] rounded-lg p-2 flex flex-col justify-between text-xs border transition-all shrink-0 ${animClass} ${swatch.bg} ${swatch.text} ${swatch.border} ${swatch.shadow} ${
                        isHead ? 'ring-2 ring-[#ffb95f]' : ''
                      } ${isTail ? 'ring-2 ring-[#4cd7f6]' : ''} ${isPeeked ? 'ring-4 ring-[#4cd7f6]' : ''}`}
                    >
                      <span className="text-[9px] font-bold uppercase opacity-90">
                        {isHead ? 'HEAD' : isTail ? 'TAIL' : ''}
                      </span>
                      <span className="font-bold truncate text-center">{item.value}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <OperationLogPanel logs={logs} onClear={() => setLogs([])} />
        </div>

        <div className="lg:col-span-5 h-[440px]">
          <PythonCodePanel
            filename="cola.py"
            lines={QUEUE_CODE}
            activeLine={queueActiveLine}
            caption={queueCaption}
            tone={queueTone}
          />
        </div>
      </div>

      {/* Embedded game: Papa Caliente */}
      <div className="w-full px-4 lg:px-6 pt-4">
        <div className="flex items-center gap-2 text-xs text-[#958ea0] border-t border-[#262a35] pt-4">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Ponlo en práctica con un juego clásico de colas:</span>
        </div>
      </div>
      <HotPotatoGame />

      {/* Theory — repaso */}
      <div className="w-full px-4 lg:px-6">
        <TheoryCards cards={colasTheoryCards} />
      </div>
    </div>
  );
};
