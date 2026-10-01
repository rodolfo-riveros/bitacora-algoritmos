import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  ArrowLeft,
  BrainCircuit,
  Award,
  BookOpen,
  Layers,
  ListOrdered,
  Gamepad2,
  Terminal,
  Link2,
  Hash,
  GitBranch,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import { TopicCard, CardTheme } from '../components/TopicCard';

type QuizCategory =
  | 'Fundamentos'
  | 'Pilas (LIFO)'
  | 'Colas (FIFO)'
  | 'Torres de Hanói'
  | 'Recursión & Call Stack'
  | 'Listas Enlazadas'
  | 'Tablas Hash'
  | 'Árboles Binarios'
  | 'Grafos';

interface QuizQuestion {
  id: number;
  category: QuizCategory;
  title: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'Fundamentos',
    title: '¿Cuál de estas NO es una característica que debe cumplir un algoritmo?',
    options: [
      'Debe tardar exactamente el mismo tiempo sin importar el tamaño de la entrada',
      'Debe terminar en un número finito de pasos',
      'Debe tener entradas y salidas bien definidas',
      'Cada paso debe ser preciso y no ambiguo',
    ],
    correctIndex: 0,
    explanation:
      'Un algoritmo NO necesita tiempo constante — su complejidad (O(1), O(n), O(n²)...) puede variar mucho según el tamaño de la entrada. Lo que sí debe cumplir es finitud, pasos precisos, y entradas/salidas bien definidas.',
  },
  {
    id: 2,
    category: 'Fundamentos',
    title: 'Una Pila (Stack) es un Tipo de Dato Abstracto (TDA). ¿Qué significa esto?',
    options: [
      'Define QUÉ operaciones ofrece (push, pop, peek) sin importar CÓMO se implementan por dentro',
      'Solo puede implementarse usando un arreglo',
      'No se puede usar en programas reales',
      'Es lo mismo que una clase de Python',
    ],
    correctIndex: 0,
    explanation:
      'Un TDA describe el comportamiento (qué operaciones existen y qué garantizan), no la implementación — una Pila puede implementarse con una lista de Python, un arreglo o una lista enlazada, y sigue siendo la misma TDA.',
  },
  {
    id: 3,
    category: 'Pilas (LIFO)',
    title: 'Dada una pila inicialmente vacía, se ejecutan las siguientes operaciones en orden: push(5), push(9), pop(), push(3), push(1), pop(), push(8). ¿Cuál elemento queda en la CIMA (Top)?',
    options: ['8', '1', '3', '5'],
    correctIndex: 0,
    explanation: 'Traza: push(5)->[5], push(9)->[5,9], pop()->retorna 9 [5], push(3)->[5,3], push(1)->[5,3,1], pop()->retorna 1 [5,3], push(8)->[5,3,8]. El elemento en la cima es 8.',
  },
  {
    id: 4,
    category: 'Colas (FIFO)',
    title: 'Se tienen los clientes [C1, C2, C3] en una cola FIFO. Se ejecuta enqueue(C4), dequeue(), dequeue(), enqueue(C5). ¿Cuál es el próximo elemento que saldrá con dequeue()?',
    options: ['C3', 'C1', 'C4', 'C5'],
    correctIndex: 0,
    explanation: 'Inicial: [C1, C2, C3]. enqueue(C4) -> [C1, C2, C3, C4]. dequeue() -> sale C1 [C2, C3, C4]. dequeue() -> sale C2 [C3, C4]. enqueue(C5) -> [C3, C4, C5]. El frente es C3.',
  },
  {
    id: 5,
    category: 'Torres de Hanói',
    title: '¿Cuál es el número mínimo de movimientos necesarios para resolver las Torres de Hanói con n = 4 discos?',
    options: ['15 movimientos', '7 movimientos', '16 movimientos', '31 movimientos'],
    correctIndex: 0,
    explanation: 'La fórmula matemática óptima es 2ⁿ - 1. Para n = 4: 2⁴ - 1 = 16 - 1 = 15 movimientos.',
  },
  {
    id: 6,
    category: 'Recursión & Call Stack',
    title: '¿Cuál es la complejidad de espacio en el Call Stack (memoria de pila) al resolver Torres de Hanói con n discos?',
    options: ['O(n) - Altura máxima del árbol de recursión', 'O(2ⁿ - 1) - Espacio exponencial', 'O(1) - Espacio constante', 'O(n²)'],
    correctIndex: 0,
    explanation: 'Aunque el tiempo es exponencial O(2ⁿ - 1), la memoria en el Call Stack es solo O(n) porque los marcos de llamadas recursivas se desapilan (.pop()) conforme retornan.',
  },
  {
    id: 7,
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
  {
    id: 8,
    category: 'Listas Enlazadas',
    title: 'En una lista enlazada simple, ¿cuál es la complejidad de insertar un nuevo nodo al INICIO de la lista?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
    correctIndex: 0,
    explanation:
      'Insertar al inicio solo crea el nodo, apunta su .next al antiguo head, y reasigna head — nunca se recorre la lista, por eso es O(1). Insertar al final o buscar sí son O(n).',
  },
  {
    id: 9,
    category: 'Listas Enlazadas',
    title: '¿Cómo se accede al elemento en la posición 50 de una lista enlazada de 100 elementos?',
    options: [
      'Recorriendo 50 nodos siguiendo .next desde head',
      'Con lista[50], igual que un arreglo, en O(1)',
      'Es imposible, las listas enlazadas no tienen posiciones',
      'Se accede desde el final (tail) automáticamente',
    ],
    correctIndex: 0,
    explanation: 'A diferencia de un arreglo, una lista enlazada no tiene acceso directo por índice: hay que recorrer nodo por nodo desde head, con complejidad O(n).',
  },
  {
    id: 10,
    category: 'Tablas Hash',
    title: "Con hash(clave) = suma de códigos ASCII % tamaño, las claves 'cat' y 'act' producen el mismo índice. ¿Por qué?",
    options: [
      'Tienen las mismas letras, así que la suma de sus códigos ASCII es igual (colisión)',
      'El tamaño de la tabla es demasiado grande',
      'Python las trata como la misma variable',
      'Una está en mayúsculas y la otra no',
    ],
    correctIndex: 0,
    explanation: "'cat' y 'act' son anagramas: tienen las mismas letras en distinto orden, así que sum(ord(c) for c in clave) da el mismo resultado. Esto se llama colisión.",
  },
  {
    id: 11,
    category: 'Tablas Hash',
    title: '¿Cómo resuelve una tabla hash con encadenamiento (chaining) una colisión?',
    options: [
      'Guarda ambas claves en una lista dentro de la misma cubeta',
      'Sobrescribe la clave anterior, perdiéndola para siempre',
      'Aumenta el tamaño de la tabla automáticamente',
      'Lanza un error y detiene el programa',
    ],
    correctIndex: 0,
    explanation: 'Con encadenamiento, cada cubeta guarda una lista de pares (clave, valor); si dos claves colisionan, ambas quedan en esa lista y hay que recorrerla comparando clave por clave.',
  },
  {
    id: 12,
    category: 'Árboles Binarios',
    title: 'En un Árbol Binario de Búsqueda (BST), al insertar un valor MENOR que el nodo actual, ¿hacia qué lado se va?',
    options: ['Izquierda', 'Derecha', 'Se queda en la raíz', 'Se descarta'],
    correctIndex: 0,
    explanation: 'En un BST, los valores menores que el nodo actual siempre van al subárbol izquierdo, y los mayores o iguales al derecho — así se mantiene ordenado.',
  },
  {
    id: 13,
    category: 'Árboles Binarios',
    title: '¿Qué recorrido de un BST devuelve los valores de menor a mayor?',
    options: [
      'Inorder (izquierda, raíz, derecha)',
      'Preorder (raíz, izquierda, derecha)',
      'Postorder (izquierda, derecha, raíz)',
      'Ninguno, siempre hay que ordenar después',
    ],
    correctIndex: 0,
    explanation: 'El recorrido Inorder visita primero el subárbol izquierdo, luego la raíz, luego el derecho — en un BST esto siempre produce los valores en orden ascendente.',
  },
  {
    id: 14,
    category: 'Grafos',
    title: '¿Qué estructura de datos usa el recorrido BFS (Breadth-First Search) para decidir qué nodo visitar después?',
    options: ['Una cola (FIFO)', 'Una pila (LIFO)', 'Una tabla hash', 'Un árbol binario'],
    correctIndex: 0,
    explanation: 'BFS explora nivel por nivel usando una cola: los vecinos se agregan al final y se visitan en el orden en que se agregaron (FIFO) — el mismo mecanismo del simulador de Colas.',
  },
  {
    id: 15,
    category: 'Grafos',
    title: '¿Qué estructura usa (o simula) el recorrido DFS (Depth-First Search)?',
    options: [
      'Una pila (LIFO) — o recursión, que usa el Call Stack',
      'Una cola (FIFO)',
      'Una tabla hash',
      'Ninguna, el orden es aleatorio',
    ],
    correctIndex: 0,
    explanation: 'DFS profundiza en una rama antes de retroceder, comportamiento típico de una pila LIFO. La versión recursiva usa el Call Stack — el mismo mecanismo de Torres de Hanói.',
  },
];

interface CategoryMeta {
  id: QuizCategory;
  icon: LucideIcon;
  theme: CardTheme;
  description: string;
}

const CATEGORY_META: CategoryMeta[] = [
  { id: 'Fundamentos', icon: BookOpen, theme: 'primary', description: 'Qué es un algoritmo, qué es un TDA, y Big-O.' },
  { id: 'Listas Enlazadas', icon: Link2, theme: 'secondary', description: 'Nodos, punteros, inserción y recorrido.' },
  { id: 'Pilas (LIFO)', icon: Layers, theme: 'primary', description: 'Push, pop, peek y disciplina LIFO.' },
  { id: 'Colas (FIFO)', icon: ListOrdered, theme: 'secondary', description: 'Enqueue, dequeue y disciplina FIFO.' },
  { id: 'Torres de Hanói', icon: Gamepad2, theme: 'tertiary', description: 'El clásico rompecabezas recursivo de pilas.' },
  { id: 'Recursión & Call Stack', icon: Terminal, theme: 'primary', description: 'Caso base, marcos de pila, desbordamiento.' },
  { id: 'Tablas Hash', icon: Hash, theme: 'tertiary', description: 'Funciones hash, colisiones y encadenamiento.' },
  { id: 'Árboles Binarios', icon: GitBranch, theme: 'primary', description: 'BST, inserción y recorridos.' },
  { id: 'Grafos', icon: Share2, theme: 'secondary', description: 'Lista de adyacencia, BFS y DFS.' },
];

export const ChallengesView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const getCategoryQuestions = (cat: QuizCategory) => QUESTIONS.filter((q) => q.category === cat);

  const getCategoryStats = (cat: QuizCategory) => {
    const qs = getCategoryQuestions(cat);
    const answered = qs.filter((q) => selectedAnswers[q.id] !== undefined);
    const correct = answered.filter((q) => selectedAnswers[q.id] === q.correctIndex);
    return { total: qs.length, answered: answered.length, correct: correct.length };
  };

  const handleResetCategory = (cat: QuizCategory) => {
    const ids = getCategoryQuestions(cat).map((q) => q.id);
    setSelectedAnswers((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  };

  const overallAnswered = Object.keys(selectedAnswers).length;
  const overallCorrect = Object.entries(selectedAnswers).filter(
    ([qId, ansIdx]) => QUESTIONS.find((q) => q.id === Number(qId))?.correctIndex === ansIdx
  ).length;

  // -------------------------------------------------------------------------
  // Pantalla 1: elegir tema
  // -------------------------------------------------------------------------
  if (!selectedCategory) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="px-2 py-0.5 rounded-full bg-[#ffb95f]/10 text-[#ffb95f] font-mono text-[10px] tracking-widest uppercase border border-[#ffb95f]/20 w-fit">
            Evaluación & Desafíos
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#dfe2f1] flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-[#d0bcff]" />
            ¿En qué tema quieres evaluarte?
          </h1>
          <p className="text-sm text-[#cbc3d7] max-w-2xl">
            Cada tema tiene su propia evaluación corta. Progreso general:{' '}
            <strong className="text-[#4cd7f6]">
              {overallCorrect}/{QUESTIONS.length}
            </strong>{' '}
            correctas ({overallAnswered}/{QUESTIONS.length} respondidas).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORY_META.map((meta) => {
            const stats = getCategoryStats(meta.id);
            const isDone = stats.answered === stats.total;
            return (
              <TopicCard
                key={meta.id}
                icon={meta.icon}
                theme={meta.theme}
                eyebrow={`${stats.total} pregunta${stats.total > 1 ? 's' : ''}`}
                title={meta.id}
                description={meta.description}
                cta={isDone ? 'Ver resultado' : stats.answered > 0 ? 'Continuar' : 'Evaluarme ahora'}
                trailing={
                  stats.answered > 0 ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        stats.correct === stats.total
                          ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                          : 'bg-[#262a35] text-[#cbc3d7]'
                      }`}
                    >
                      {stats.correct}/{stats.total}
                    </span>
                  ) : undefined
                }
                onClick={() => setSelectedCategory(meta.id)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Pantalla 2: evaluación de un tema
  // -------------------------------------------------------------------------
  const questions = getCategoryQuestions(selectedCategory);
  const stats = getCategoryStats(selectedCategory);

  return (
    <div className="flex flex-col w-full text-[#dfe2f1] px-4 lg:px-6 py-4 max-w-5xl mx-auto gap-6">
      <button
        onClick={() => setSelectedCategory(null)}
        type="button"
        className="flex items-center gap-1.5 text-xs text-[#958ea0] hover:text-[#dfe2f1] transition-colors w-fit"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Volver a los temas
      </button>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">{selectedCategory}</h1>
          <p className="text-xs text-[#958ea0]">{questions.length} pregunta{questions.length > 1 ? 's' : ''}</p>
        </div>

        <div className="flex items-center gap-3 bg-[#0a0e18] px-4 py-2.5 rounded-xl border border-[#262a35] shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-mono text-[#958ea0] uppercase">Puntuación</span>
            <span className="text-base font-bold font-mono text-[#4cd7f6]">
              {stats.correct} / {stats.total}
            </span>
          </div>
          {stats.answered > 0 && (
            <button
              onClick={() => handleResetCategory(selectedCategory)}
              className="p-1.5 rounded-lg bg-[#171b26] text-[#958ea0] hover:text-[#dfe2f1] hover:bg-[#262a35] transition-colors"
              title="Reiniciar este tema"
              type="button"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Questions list */}
      <div className="flex flex-col gap-4">
        {questions.map((q, idx) => {
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
                  Pregunta {idx + 1}/{questions.length}
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
              <h2 className="text-sm font-semibold text-[#dfe2f1] leading-snug">{q.title}</h2>

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
      {stats.answered === stats.total && (
        <div className="p-4 bg-gradient-to-r from-[#171b26] via-[#1c1f2a] to-[#171b26] border border-[#d0bcff]/40 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-[#d0bcff]" />
            <div>
              <span className="font-bold text-sm text-[#dfe2f1] block">
                ¡Completaste la evaluación de {selectedCategory}!
              </span>
              <span className="text-xs text-[#cbc3d7]">
                {stats.correct} de {stats.total} correctas ({Math.round((stats.correct / stats.total) * 100)}%).
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleResetCategory(selectedCategory)}
              className="px-4 py-1.5 rounded-lg bg-[#262a35] text-[#cbc3d7] font-mono text-xs font-bold hover:bg-[#313540] transition-all"
              type="button"
            >
              Reintentar
            </button>
            <button
              onClick={() => setSelectedCategory(null)}
              className="px-4 py-1.5 rounded-lg bg-[#d0bcff] text-[#3c0091] font-mono text-xs font-bold hover:bg-[#e9ddff] transition-all"
              type="button"
            >
              Elegir otro tema
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
