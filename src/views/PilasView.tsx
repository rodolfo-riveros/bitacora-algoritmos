import React, { useState } from 'react';
import { Layers, ArrowUp, Plus, Trash2, Eye, AlertCircle, Zap, Clock, Gamepad2 } from 'lucide-react';
import { PythonCodePanel } from '../components/PythonCodePanel';
import { OperationLogPanel } from '../components/OperationLogPanel';
import { TheoryCards, TheoryCard } from '../components/TheoryCards';
import { getSwatch } from '../constants/palette';
import { LogEntry, CodeLine } from '../types';
import { HanoiSimulatorView } from './HanoiSimulatorView';

const STACK_DISK_WIDTHS = ['w-64', 'w-56', 'w-48', 'w-40', 'w-32', 'w-24'];

const STACK_CODE: CodeLine[] = [
  { num: 1, code: 'class Pila:' },
  { num: 2, code: '    def __init__(self):' },
  { num: 3, code: '        self.elementos = []' },
  { num: 4, code: '' },
  { num: 5, code: '    def push(self, dato):' },
  { num: 6, code: '        self.elementos.append(dato)' },
  { num: 7, code: '        print(f"Apilaste: {dato}")' },
  { num: 8, code: '' },
  { num: 9, code: '    def pop(self):' },
  { num: 10, code: '        if len(self.elementos) == 0:' },
  { num: 11, code: '            print("La pila está vacía, no hay nada que sacar")' },
  { num: 12, code: '            return None' },
  { num: 13, code: '        dato = self.elementos.pop()' },
  { num: 14, code: '        print(f"Desapilaste: {dato}")' },
  { num: 15, code: '        return dato' },
  { num: 16, code: '' },
  { num: 17, code: '    def peek(self):' },
  { num: 18, code: '        if len(self.elementos) == 0:' },
  { num: 19, code: '            print("La pila está vacía")' },
  { num: 20, code: '            return None' },
  { num: 21, code: '        return self.elementos[-1]' },
];

interface StackItem {
  id: string;
  value: string;
  animating?: 'push' | 'pop' | null;
}

const pilasTheoryCards: TheoryCard[] = [
  {
    icon: ArrowUp,
    eyebrow: 'Principio Rector',
    title: 'Repaso: Pila (Stack) — LIFO',
    accent: 'primary',
    body: (
      <>
        <strong className="text-[#dfe2f1]">Last-In, First-Out:</strong> el último valor apilado es el primero en
        salir. Solo hay un punto de acceso: la cima (Top). Como en Torres de Hanói, no puedes tomar un disco de
        en medio sin quitar antes los de arriba.
      </>
    ),
    footer: <span>➔ Acceso restringido a la cima (Top)</span>,
  },
  {
    icon: Zap,
    eyebrow: 'Primitivas de Datos',
    title: 'push() / pop() / peek()',
    accent: 'tertiary',
    body: (
      <>
        <code className="text-[#ffb95f] font-bold">push(dato)</code>: agrega arriba de todo.{' '}
        <code className="text-[#4cd7f6] font-bold">pop()</code>: saca y devuelve el de arriba.{' '}
        <code className="text-[#d0bcff] font-bold">peek()</code>: mira el de arriba sin sacarlo. Mover un disco
        en Hanói es siempre un <code className="text-[#ffb95f]">pop()</code> seguido de un{' '}
        <code className="text-[#4cd7f6]">push()</code>.
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
    title: 'Torres de Hanói',
    accent: 'secondary',
    body: (
      <>
        Resolver Hanói con <em>n</em> discos usa exactamente{' '}
        <code className="text-[#4cd7f6] font-bold">2ⁿ - 1</code> movimientos (push+pop), y la recursión ocupa{' '}
        <code className="text-[#d0bcff] font-bold">O(n)</code> de memoria en el Call Stack — el mismo principio
        LIFO, aplicado dos veces: en los discos y en las llamadas de función.
      </>
    ),
    footer: <span>✓ n=3 → 7 movimientos, n=4 → 15, n=5 → 31...</span>,
  },
];

export const PilasView: React.FC = () => {
  const [stackItems, setStackItems] = useState<StackItem[]>([
    { id: 's-1', value: 'Token_1' },
    { id: 's-2', value: 'Token_2' },
    { id: 's-3', value: 'Token_3' },
  ]);
  const [stackInput, setStackInput] = useState('');
  const stackCapacity = 6;
  const [stackMessage, setStackMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' }>({
    text: 'Ingresa un valor y usa Push, Pop o Peek.',
    type: 'info',
  });
  const [peekedStackId, setPeekedStackId] = useState<string | null>(null);
  const [isStackBusy, setIsStackBusy] = useState(false);
  const [stackActiveLine, setStackActiveLine] = useState<number | null>(3);
  const [stackCaption, setStackCaption] = useState<string | null>(
    'self.elementos = [] → la pila ya tiene 3 elementos cargados de ejemplo.'
  );
  const [stackTone, setStackTone] = useState<'default' | 'error'>('default');

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'log-0', time: '00:00', text: 'Pila lista con 3 elementos. Cima inicial: Token_3', type: 'info' },
  ]);

  const [numDisks, setNumDisks] = useState(3);

  const addLog = (text: string, type: LogEntry['type']) => {
    const now = new Date();
    const timeStr = `${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const id = `${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`;
    setLogs((prev) => [...prev.slice(-40), { id, time: timeStr, text, type }]);
  };

  const handlePush = (val?: string) => {
    if (isStackBusy) return;
    const itemVal = (val !== undefined ? val : stackInput).trim() || `Token_${stackItems.length + 1}`;

    setStackActiveLine(6);

    if (stackItems.length >= stackCapacity) {
      setStackTone('error');
      setStackCaption(`push() bloqueado: alcanzaste el límite visual de la pila (${stackCapacity} discos).`);
      setStackMessage({ text: `¡Stack Overflow! Capacidad máxima (${stackCapacity}) alcanzada.`, type: 'error' });
      return;
    }
    setStackTone('default');

    const newItem: StackItem = {
      id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      value: itemVal,
      animating: 'push',
    };

    setIsStackBusy(true);
    setStackItems((prev) => [...prev, newItem]);
    setStackInput('');
    setPeekedStackId(null);
    setStackCaption(`push(dato) → self.elementos.append("${itemVal}") → imprime "Apilaste: ${itemVal}"`);
    setStackMessage({ text: `push("${itemVal}") — nuevo Top en índice [${stackItems.length}].`, type: 'success' });
    addLog(`push("${itemVal}") apilado en la cima`, 'push');

    setTimeout(() => {
      setStackItems((prev) => prev.map((item) => (item.id === newItem.id ? { ...item, animating: null } : item)));
      setIsStackBusy(false);
    }, 420);
  };

  const handlePop = () => {
    if (isStackBusy) return;

    if (stackItems.length === 0) {
      setStackActiveLine(11);
      setStackTone('error');
      setStackCaption('if len(self.elementos) == 0 → True → imprime "La pila está vacía, no hay nada que sacar"');
      setStackMessage({ text: '¡Stack Underflow! La pila está vacía.', type: 'error' });
      return;
    }

    const topIndex = stackItems.length - 1;
    const poppingItem = stackItems[topIndex];

    setIsStackBusy(true);
    setPeekedStackId(null);
    setStackItems((prev) => prev.map((item, idx) => (idx === topIndex ? { ...item, animating: 'pop' } : item)));
    setStackActiveLine(13);
    setStackTone('default');
    setStackCaption(`dato = self.elementos.pop() → retorna y elimina "${poppingItem.value}"`);
    setStackMessage({ text: `pop() removiendo "${poppingItem.value}"...`, type: 'info' });

    setTimeout(() => {
      setStackItems((prev) => prev.slice(0, -1));
      setIsStackBusy(false);
      setStackMessage({ text: `pop() completado: retornó "${poppingItem.value}".`, type: 'success' });
      addLog(`pop() desapiló "${poppingItem.value}"`, 'pop');
    }, 380);
  };

  const handlePeekStack = () => {
    if (isStackBusy) return;

    if (stackItems.length === 0) {
      setStackActiveLine(19);
      setStackTone('error');
      setStackCaption('if len(self.elementos) == 0 → True → imprime "La pila está vacía"');
      setStackMessage({ text: 'Pila vacía. peek() no tiene nada que devolver.', type: 'error' });
      return;
    }

    const topItem = stackItems[stackItems.length - 1];
    setPeekedStackId(topItem.id);
    setStackActiveLine(21);
    setStackTone('default');
    setStackCaption(`return self.elementos[-1] → consulta "${topItem.value}" sin modificar la pila`);
    setStackMessage({ text: `peek() → "${topItem.value}". La pila permanece intacta.`, type: 'info' });
    addLog(`peek() observó cima "${topItem.value}"`, 'info');

    setTimeout(() => setPeekedStackId(null), 2000);
  };

  const handleClearStack = () => {
    if (isStackBusy) return;
    setStackItems([]);
    setPeekedStackId(null);
    setStackActiveLine(3);
    setStackTone('default');
    setStackCaption('self.elementos = [] — botón de la interfaz, no un método de la clase; reinicia la pila.');
    setStackMessage({ text: 'Pila vaciada.', type: 'info' });
    addLog('reiniciada a 0 elementos', 'info');
  };

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Header */}
      <section className="w-full px-4 lg:px-6 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">Pilas (Stack)</h1>
        <p className="text-xs text-[#958ea0] mt-0.5">
          Piénsalo como Torres de Hanói: solo puedes tomar o colocar un valor en la punta (Top).
        </p>
      </section>

      {/* Command bar */}
      <section className="w-full px-4 lg:px-6 pb-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Valor (ej: Token_A, 99)"
          value={stackInput}
          onChange={(e) => setStackInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handlePush()}
          disabled={isStackBusy}
          className="w-44 bg-[#171b26] border border-[#262a35] rounded-lg px-3 py-1.5 text-xs text-[#dfe2f1] placeholder-[#6b6678] focus:outline-none focus:border-[#d0bcff] transition-all disabled:opacity-50"
        />
        <button
          onClick={() => handlePush()}
          disabled={isStackBusy || stackItems.length >= stackCapacity}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a078ff] text-[#340080] text-xs font-semibold hover:bg-[#d0bcff] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5" /> Push
        </button>
        <button
          onClick={handlePop}
          disabled={isStackBusy}
          type="button"
          title="Funciona incluso con la pila vacía, para que veas el aviso del código"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#ffb95f] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowUp className="w-3.5 h-3.5" /> Pop
        </button>
        <button
          onClick={handlePeekStack}
          disabled={isStackBusy}
          type="button"
          title="Funciona incluso con la pila vacía, para que veas el aviso del código"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#4cd7f6] hover:bg-[#171b26] text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Eye className="w-3.5 h-3.5" /> Peek
        </button>
        <button
          onClick={handleClearStack}
          disabled={isStackBusy || stackItems.length === 0}
          type="button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#958ea0] hover:text-[#ffb4ab] text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          <Trash2 className="w-3.5 h-3.5" /> Vaciar
        </button>
      </section>

      {stackMessage.type === 'error' && (
        <div className="mx-4 lg:mx-6 mb-3 px-3 py-2 rounded-lg text-xs flex items-center gap-2 bg-[#93000a]/20 text-[#ffb4ab]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{stackMessage.text}</span>
        </div>
      )}

      {/* Main grid: visual + python */}
      <div className="w-full px-4 lg:px-6 py-2 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex flex-col justify-end items-center bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 min-h-[300px] relative overflow-hidden">
            <div className="absolute top-2 right-3 text-[11px] text-[#4cd7f6] z-20">
              {stackItems.length > 0 ? `Top: índice [${stackItems.length - 1}]` : 'Vacía'}
            </div>

            {stackItems.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[#6b6678] text-xs">Pila vacía</div>
            ) : (
              <>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3 h-56 bg-[#262a35] rounded-t-full border border-[#313540] z-0" />
                <div className="w-full flex flex-col-reverse items-center gap-1.5 pb-1 z-10">
                  {stackItems.map((item, idx) => {
                    const isTop = idx === stackItems.length - 1;
                    const isPeeked = peekedStackId === item.id;
                    const swatch = getSwatch(idx);
                    const widthClass = STACK_DISK_WIDTHS[Math.min(idx, STACK_DISK_WIDTHS.length - 1)];
                    let animClass = '';
                    if (item.animating === 'push') animClass = 'animate-stack-push';
                    if (item.animating === 'pop') animClass = 'animate-stack-pop';
                    if (isPeeked) animClass = 'animate-peek-pulse';

                    return (
                      <div
                        key={item.id}
                        className={`h-10 ${widthClass} ${swatch.bg} ${swatch.text} ${swatch.border} ${swatch.shadow} border rounded-md px-3.5 flex items-center justify-between text-xs font-bold transition-all ${animClass} ${
                          isTop ? 'ring-2 ring-[#4cd7f6]' : ''
                        } ${isPeeked ? 'ring-4 ring-[#4cd7f6]' : ''}`}
                      >
                        <span className="truncate px-2">{item.value}</span>
                        <span className="text-[9px] uppercase opacity-90">{isTop ? '◄ TOP' : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div className="w-64 h-3.5 bg-[#313540] rounded-full z-10 mt-1" />
          </div>

          <OperationLogPanel logs={logs} onClear={() => setLogs([])} />
        </div>

        <div className="lg:col-span-5 h-[440px]">
          <PythonCodePanel
            filename="pila.py"
            lines={STACK_CODE}
            activeLine={stackActiveLine}
            caption={stackCaption}
            tone={stackTone}
          />
        </div>
      </div>

      {/* Embedded game: Torres de Hanói */}
      <div className="w-full px-4 lg:px-6 pt-4">
        <div className="flex items-center gap-2 text-xs text-[#958ea0] border-t border-[#262a35] pt-4">
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Ponlo en práctica con el rompecabezas clásico de pilas:</span>
        </div>
      </div>
      <HanoiSimulatorView numDisks={numDisks} setNumDisks={setNumDisks} />

      {/* Theory — repaso */}
      <div className="w-full px-4 lg:px-6">
        <TheoryCards cards={pilasTheoryCards} />
      </div>
    </div>
  );
};
