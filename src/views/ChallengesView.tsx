import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Award,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  category: 'Pilas (LIFO)' | 'Colas (FIFO)' | 'Torres de Hanói' | 'Recursión & Call Stack';
  title: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'Pilas (LIFO)',
    title: 'Dada una pila inicialmente vacía, se ejecutan las siguientes operaciones en orden: push(5), push(9), pop(), push(3), push(1), pop(), push(8). ¿Cuál elemento queda en la CIMA (Top)?',
    options: ['8', '1', '3', '5'],
    correctIndex: 0,
    explanation: 'Traza: push(5)->[5], push(9)->[5,9], pop()->retorna 9 [5], push(3)->[5,3], push(1)->[5,3,1], pop()->retorna 1 [5,3], push(8)->[5,3,8]. El elemento en la cima es 8.',
  },
  {
    id: 2,
    category: 'Colas (FIFO)',
    title: 'Se tienen los clientes [C1, C2, C3] en una cola FIFO. Se ejecuta enqueue(C4), dequeue(), dequeue(), enqueue(C5). ¿Cuál es el próximo elemento que saldrá con dequeue()?',
    options: ['C3', 'C1', 'C4', 'C5'],
    correctIndex: 0,
    explanation: 'Inicial: [C1, C2, C3]. enqueue(C4) -> [C1, C2, C3, C4]. dequeue() -> sale C1 [C2, C3, C4]. dequeue() -> sale C2 [C3, C4]. enqueue(C5) -> [C3, C4, C5]. El frente es C3.',
  },
  {
    id: 3,
    category: 'Torres de Hanói',
    title: '¿Cuál es el número mínimo de movimientos necesarios para resolver las Torres de Hanói con n = 4 discos?',
    options: ['15 movimientos', '7 movimientos', '16 movimientos', '31 movimientos'],
    correctIndex: 0,
    explanation: 'La fórmula matemática óptima es 2ⁿ - 1. Para n = 4: 2⁴ - 1 = 16 - 1 = 15 movimientos.',
  },
  {
    id: 4,
    category: 'Recursión & Call Stack',
    title: '¿Cuál es la complejidad de espacio en el Call Stack (memoria de pila) al resolver Torres de Hanói con n discos?',
    options: ['O(n) - Altura máxima del árbol de recursión', 'O(2ⁿ - 1) - Espacio exponencial', 'O(1) - Espacio constante', 'O(n²)'],
    correctIndex: 0,
    explanation: 'Aunque el tiempo es exponencial O(2ⁿ - 1), la memoria en el Call Stack es solo O(n) porque los marcos de llamadas recursivas se desapilan (.pop()) conforme retornan.',
  },
  {
    id: 5,
    category: 'Recursión & Call Stack',
    title: '¿Qué sucede si en una función recursiva se omite el Caso Base (Base Case)?',
    options: [
      'Desbordamiento de Pila (Stack Overflow / RecursionError)',
      'La función se ejecuta en tiempo O(1)',
      'El compilador optimiza el bucle automáticamente a una cola',
      'Retorna automáticamente 0',
    ],
    correctIndex: 0,
    explanation: 'Sin caso base, la función sigue apilando marcos indefinidamente hasta consumir la memoria asignada al Call Stack del hilo, lanzando un desbordamiento de pila.',
  },
];

export const ChallengesView: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<Record<number, boolean>>({});

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    setShowResults((prev) => ({ ...prev, [questionId]: true }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowResults({});
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = Object.entries(selectedAnswers).filter(
    ([qId, ansIdx]) => QUESTIONS.find((q) => q.id === Number(qId))?.correctIndex === ansIdx
  ).length;

  return (
    <div className="flex flex-col w-full text-[#dfe2f1] px-4 lg:px-6 py-4 max-w-5xl mx-auto gap-6">
      {/* Header Banner */}
      <div className="bg-[#171b26] border border-[#262a35] rounded-xl p-4 lg:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-[#ffb95f]/10 text-[#ffb95f] font-mono text-[10px] tracking-widest uppercase border border-[#ffb95f]/20">
              Evaluación & Desafíos
            </span>
            <span className="text-[#958ea0] font-mono text-xs">•</span>
            <span className="text-[#4cd7f6] font-mono text-xs">Pilas, Colas & Recursión</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1] flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#d0bcff]" />
            Desafíos Interactivos de Algoritmos
          </h1>
          <p className="text-xs text-[#cbc3d7]">
            Pon a prueba tu comprensión de las operaciones LIFO, FIFO, árboles recursivos y punteros del Call Stack.
          </p>
        </div>

        {/* Score Card */}
        <div className="flex items-center gap-3 bg-[#0a0e18] px-4 py-2.5 rounded-xl border border-[#262a35] shadow-inner shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono text-[#958ea0] uppercase">Puntuación</span>
            <span className="text-base font-bold font-mono text-[#4cd7f6]">
              {correctCount} / {QUESTIONS.length}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#262a35] flex items-center justify-center text-[#ffb95f]">
            <Trophy className="w-5 h-5" />
          </div>
          {answeredCount > 0 && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-[#171b26] text-[#958ea0] hover:text-[#dfe2f1] hover:bg-[#262a35] transition-colors"
              title="Reiniciar Desafíos"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-4">
        {QUESTIONS.map((q, idx) => {
          const selected = selectedAnswers[q.id];
          const isAnswered = selected !== undefined;
          const isCorrect = selected === q.correctIndex;

          return (
            <div
              key={q.id}
              className={`bg-[#0a0e18] border rounded-xl p-4 lg:p-5 shadow-md flex flex-col gap-3 transition-all ${
                isAnswered
                  ? isCorrect
                    ? 'border-[#4cd7f6]/40 bg-[#0a0e18]'
                    : 'border-[#ffb4ab]/40 bg-[#0a0e18]'
                  : 'border-[#262a35]'
              }`}
            >
              {/* Question metadata */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-[#171b26] text-[#d0bcff] font-mono text-[11px] border border-[#262a35]">
                  Reto #{idx + 1} // {q.category}
                </span>
                {isAnswered && (
                  <span
                    className={`font-mono text-xs flex items-center gap-1 font-bold ${
                      isCorrect ? 'text-[#4cd7f6]' : 'text-[#ffb4ab]'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> ¡Correcto!
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Incorrecto
                      </>
                    )}
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-sm font-semibold text-[#dfe2f1] leading-snug">
                {q.title}
              </h2>

              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  let optStyle = 'bg-[#171b26] border-[#262a35] text-[#cbc3d7] hover:border-[#a078ff]/50 hover:bg-[#1c1f2a]';
                  if (isAnswered) {
                    if (optIdx === q.correctIndex) {
                      optStyle = 'bg-[#4cd7f6]/15 border-[#4cd7f6] text-[#4cd7f6] font-bold shadow-sm';
                    } else if (optIdx === selected) {
                      optStyle = 'bg-[#93000a]/20 border-[#ffb4ab] text-[#ffb4ab]';
                    } else {
                      optStyle = 'bg-[#171b26] border-[#262a35] text-[#958ea0] opacity-50';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(q.id, optIdx)}
                      disabled={isAnswered}
                      type="button"
                      className={`text-left px-3.5 py-2.5 rounded-lg border font-mono text-xs transition-all flex items-center justify-between gap-2 ${optStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswered && optIdx === q.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-[#4cd7f6] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Didactic explanation upon answering */}
              {isAnswered && (
                <div className="mt-2 p-3 rounded-lg bg-[#171b26] border border-[#262a35] text-xs text-[#cbc3d7] flex items-start gap-2">
                  <HelpCircle className="w-4 h-4 text-[#ffb95f] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#dfe2f1] block mb-0.5">Explicación Didáctica:</span>
                    <span>{q.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {answeredCount === QUESTIONS.length && (
        <div className="p-4 bg-gradient-to-r from-[#171b26] via-[#1c1f2a] to-[#171b26] border border-[#d0bcff]/40 rounded-xl shadow-lg flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-[#d0bcff]" />
            <div>
              <span className="font-bold text-sm text-[#dfe2f1] block">
                ¡Completaste todos los desafíos de Pilas y Colas!
              </span>
              <span className="text-xs text-[#cbc3d7]">
                Lograste {correctCount} de {QUESTIONS.length} respuestas correctas ({Math.round((correctCount / QUESTIONS.length) * 100)}%).
              </span>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-1.5 rounded-lg bg-[#d0bcff] text-[#3c0091] font-mono text-xs font-bold hover:bg-[#e9ddff] transition-all"
            type="button"
          >
            Volver a Intentar
          </button>
        </div>
      )}
    </div>
  );
};
