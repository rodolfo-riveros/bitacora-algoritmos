/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, Layers, ArrowRight, Gauge, Clock, BookOpen } from 'lucide-react';
import { PythonCodePanel } from '../components/PythonCodePanel';
import { TheoryCards, TheoryCard } from '../components/TheoryCards';
import { CodeLine } from '../types';

const ALGORITHM_TRAITS = [
  { title: 'Finito', body: 'Termina después de un número finito de pasos — no corre para siempre.' },
  { title: 'Definido', body: 'Cada paso es preciso y no ambiguo — cualquiera que lo siga llega al mismo resultado.' },
  { title: 'Entrada', body: 'Recibe cero o más valores antes de empezar (ej: la lista a ordenar).' },
  { title: 'Salida', body: 'Produce al menos un resultado relacionado con la entrada.' },
  { title: 'Efectivo', body: 'Cada paso se puede realizar en un tiempo finito, con recursos reales.' },
];

interface Complexity {
  id: string;
  label: string;
  color: string;
  compute: (n: number) => number;
  code: CodeLine[];
  example: string;
}

const COMPLEXITIES: Complexity[] = [
  {
    id: 'O(1)',
    label: 'O(1) — Constante',
    color: 'text-[#4cd7f6]',
    compute: () => 1,
    example: 'push() de una Pila — sin importar cuántos elementos ya tenga.',
    code: [
      { num: 1, code: 'def push(pila, dato):' },
      { num: 2, code: '    pila.append(dato)  # siempre 1 paso, sea la pila del tamaño que sea' },
    ],
  },
  {
    id: 'O(log n)',
    label: 'O(log n) — Logarítmica',
    color: 'text-[#d0bcff]',
    compute: (n) => Math.max(1, Math.ceil(Math.log2(Math.max(n, 1) + 1))),
    example: 'Búsqueda binaria — cada paso descarta la mitad de las opciones.',
    code: [
      { num: 1, code: 'def busqueda_binaria(lista, objetivo):' },
      { num: 2, code: '    inicio, fin = 0, len(lista) - 1' },
      { num: 3, code: '    while inicio <= fin:' },
      { num: 4, code: '        medio = (inicio + fin) // 2' },
      { num: 5, code: '        if lista[medio] == objetivo:' },
      { num: 6, code: '            return medio' },
      { num: 7, code: '        elif lista[medio] < objetivo:' },
      { num: 8, code: '            inicio = medio + 1' },
      { num: 9, code: '        else:' },
      { num: 10, code: '            fin = medio - 1' },
      { num: 11, code: '    return -1' },
    ],
  },
  {
    id: 'O(n)',
    label: 'O(n) — Lineal',
    color: 'text-[#ffb95f]',
    compute: (n) => n,
    example: 'Buscar un valor en una Lista Enlazada — hay que recorrer nodo por nodo.',
    code: [
      { num: 1, code: 'def buscar(lista_enlazada, valor):' },
      { num: 2, code: '    actual = lista_enlazada.head' },
      { num: 3, code: '    while actual is not None:' },
      { num: 4, code: '        if actual.valor == valor:' },
      { num: 5, code: '            return True' },
      { num: 6, code: '        actual = actual.next' },
      { num: 7, code: '    return False' },
    ],
  },
  {
    id: 'O(n log n)',
    label: 'O(n log n) — Cuasi-lineal',
    color: 'text-[#a078ff]',
    compute: (n) => Math.ceil(n * Math.max(1, Math.log2(Math.max(n, 1) + 1))),
    example: 'Merge Sort — divide la lista a la mitad, log n veces, mezclando n elementos cada vez.',
    code: [
      { num: 1, code: 'def merge_sort(lista):' },
      { num: 2, code: '    if len(lista) <= 1:' },
      { num: 3, code: '        return lista' },
      { num: 4, code: '    medio = len(lista) // 2' },
      { num: 5, code: '    izquierda = merge_sort(lista[:medio])' },
      { num: 6, code: '    derecha = merge_sort(lista[medio:])' },
      { num: 7, code: '    return mezclar(izquierda, derecha)' },
    ],
  },
  {
    id: 'O(n²)',
    label: 'O(n²) — Cuadrática',
    color: 'text-[#ca8100]',
    compute: (n) => n * n,
    example: 'Ordenamiento Burbuja — un bucle dentro de otro bucle, ambos de tamaño n.',
    code: [
      { num: 1, code: 'def ordenamiento_burbuja(lista):' },
      { num: 2, code: '    for i in range(len(lista)):' },
      { num: 3, code: '        for j in range(len(lista) - 1):' },
      { num: 4, code: '            if lista[j] > lista[j + 1]:' },
      { num: 5, code: '                lista[j], lista[j + 1] = lista[j + 1], lista[j]' },
      { num: 6, code: '    return lista' },
    ],
  },
  {
    id: 'O(2ⁿ)',
    label: 'O(2ⁿ) — Exponencial',
    color: 'text-[#ffb4ab]',
    compute: (n) => Math.pow(2, Math.min(n, 20)),
    example: 'Torres de Hanói — cada disco adicional duplica los movimientos necesarios.',
    code: [
      { num: 1, code: 'def hanoi(n, origen, destino, aux):' },
      { num: 2, code: '    if n == 1:' },
      { num: 3, code: '        mover_disco(origen, destino)' },
      { num: 4, code: '        return' },
      { num: 5, code: '    hanoi(n - 1, origen, aux, destino)' },
      { num: 6, code: '    mover_disco(origen, destino)' },
      { num: 7, code: '    hanoi(n - 1, aux, destino, origen)' },
    ],
  },
];

const fundamentosTheoryCards: TheoryCard[] = [
  {
    icon: BookOpen,
    eyebrow: 'Repaso',
    title: '¿Qué es un Algoritmo?',
    accent: 'primary',
    body: (
      <>
        Una secuencia <strong className="text-[#dfe2f1]">finita</strong> y{' '}
        <strong className="text-[#dfe2f1]">precisa</strong> de pasos que transforma una entrada en una salida.
        Todo lo que simulaste en esta plataforma — push, buscar, insertar — es un algoritmo.
      </>
    ),
    footer: <span>➔ Finito + Definido + Entrada + Salida + Efectivo</span>,
  },
  {
    icon: Layers,
    eyebrow: 'Repaso',
    title: '¿Qué es un TDA?',
    accent: 'secondary',
    body: (
      <>
        Un <strong className="text-[#dfe2f1]">Tipo de Dato Abstracto</strong> define QUÉ operaciones existen
        (push, pop, peek) sin decir CÓMO están hechas por dentro. Por eso la misma Pila puede vivir en una lista
        de Python o en nodos enlazados — la interfaz no cambia.
      </>
    ),
    footer: <span>➔ Interfaz (qué hace) ≠ Implementación (cómo lo hace)</span>,
  },
  {
    icon: Gauge,
    eyebrow: 'Repaso',
    title: 'Big-O: mide el crecimiento, no el tiempo',
    accent: 'tertiary',
    body: (
      <>
        Big-O no dice "cuántos segundos tarda" — dice{' '}
        <strong className="text-[#dfe2f1]">cómo crece el trabajo</strong> cuando <em>n</em> crece. Un algoritmo
        O(n²) puede ser más rápido que uno O(n) con pocos datos, pero pierde por completo cuando n es grande.
      </>
    ),
    footer: (
      <span className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> El "peor caso" es el que casi siempre importa
      </span>
    ),
  },
];

export const FundamentosView: React.FC = () => {
  const [n, setN] = useState(8);
  const [selectedId, setSelectedId] = useState<string>('O(n)');
  const selected = COMPLEXITIES.find((c) => c.id === selectedId)!;

  const values = COMPLEXITIES.map((c) => ({ ...c, value: c.compute(n) }));
  const maxValue = Math.max(...values.map((v) => v.value), 1);

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      {/* Header */}
      <section className="w-full px-4 lg:px-6 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">Fundamentos de Algoritmos y TDA</h1>
        <p className="text-xs text-[#958ea0] mt-0.5">
          Antes de simular estructuras, aclaremos qué es un algoritmo, qué es un TDA, y cómo medimos su costo.
        </p>
      </section>

      {/* Qué es un algoritmo */}
      <section className="w-full px-4 lg:px-6 pb-4">
        <h2 className="text-sm font-bold text-[#d0bcff] mb-2">¿Qué es un Algoritmo?</h2>
        <p className="text-xs text-[#cbc3d7] mb-3 max-w-2xl">
          Una receta precisa y finita de pasos para resolver un problema. Para ser considerado un algoritmo,
          debe cumplir 5 características:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {ALGORITHM_TRAITS.map((trait) => (
            <div key={trait.title} className="bg-[#0a0e18] border border-[#262a35] rounded-lg p-3 flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#4cd7f6]">
                <CheckCircle2 className="w-3.5 h-3.5" /> {trait.title}
              </span>
              <p className="text-[11px] text-[#958ea0] leading-relaxed">{trait.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Qué es un TDA */}
      <section className="w-full px-4 lg:px-6 pb-4">
        <h2 className="text-sm font-bold text-[#4cd7f6] mb-2">¿Qué es un Tipo de Dato Abstracto (TDA)?</h2>
        <p className="text-xs text-[#cbc3d7] mb-3 max-w-2xl">
          Un TDA define <strong className="text-[#dfe2f1]">la interfaz</strong> (qué operaciones ofrece) sin
          imponer <strong className="text-[#dfe2f1]">una implementación</strong>. La Pila que simulaste es el
          mismo TDA en ambos casos:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-stretch">
          <div className="bg-[#0a0e18] border border-[#a078ff]/40 rounded-lg p-3 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-[#d0bcff] font-semibold">TDA: Pila</span>
            <p className="text-[11px] text-[#958ea0]">Interfaz: push(dato), pop(), peek()</p>
          </div>
          <div className="flex items-center justify-center text-[#494454]">
            <ArrowRight className="w-4 h-4 hidden sm:block" />
            <span className="sm:hidden">↓</span>
          </div>
          <div className="bg-[#0a0e18] border border-[#262a35] rounded-lg p-3 flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-[#4cd7f6] font-semibold">Implementación A</span>
            <p className="text-[11px] text-[#958ea0]">self.elementos = [] (lista de Python) — lo que viste en Pilas</p>
          </div>
        </div>
      </section>

      {/* Big-O explorer */}
      <section className="w-full px-4 lg:px-6 pb-4">
        <h2 className="text-sm font-bold text-[#ffb95f] mb-2">Explorador de Complejidad (Big-O)</h2>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-[#958ea0]">n =</span>
          <input
            type="range"
            min={1}
            max={16}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-40"
          />
          <span className="text-xs font-bold text-[#dfe2f1] w-6">{n}</span>

          <div className="flex flex-wrap items-center gap-1.5 ml-auto">
            {COMPLEXITIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                type="button"
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedId === c.id ? 'bg-[#171b26] ' + c.color : 'text-[#6b6678] hover:text-[#cbc3d7]'
                }`}
              >
                {c.id}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <div className="bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 flex flex-col gap-2">
              {values.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <span className={`w-20 shrink-0 text-[11px] font-mono font-bold ${c.color}`}>{c.id}</span>
                  <div className="flex-1 h-3 bg-[#171b26] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${c.color.replace('text-', 'bg-')}`}
                      style={{ width: `${(Math.log10(c.value + 1) / Math.log10(maxValue + 1)) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-[11px] text-[#958ea0]">
                    {c.value.toLocaleString('es')}
                  </span>
                </div>
              ))}
              <p className="text-[10px] text-[#6b6678] pt-1">
                Barras en escala logarítmica para poder comparar todas a la vez — fíjate en los números de la
                derecha para el valor real.
              </p>
            </div>

            <div className="bg-[#0a0e18] border border-[#262a35] rounded-xl p-4">
              <p className="text-xs text-[#cbc3d7]">
                <strong className={selected.color}>{selected.label}:</strong> {selected.example}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 h-[280px]">
            <PythonCodePanel filename={`${selected.id}.py`} lines={selected.code} activeLine={null} caption={selected.example} />
          </div>
        </div>
      </section>

      {/* Theory — repaso */}
      <div className="w-full px-4 lg:px-6">
        <TheoryCards cards={fundamentosTheoryCards} />
      </div>
    </div>
  );
};
