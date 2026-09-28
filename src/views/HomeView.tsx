import React from 'react';
import {
  Layers,
  ListOrdered,
  GitBranch,
  Link2,
  Gauge,
  Terminal,
  BrainCircuit,
  Lock,
  ArrowRight,
  Hash,
  Share2,
  BookOpen,
  type LucideIcon,
} from 'lucide-react';
import { ModuleId } from '../types';

interface HomeViewProps {
  onSelectModule: (id: ModuleId) => void;
}

interface ModuleCard {
  id: ModuleId | null;
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  accent: string;
  disabled?: boolean;
}

interface ModuleCategory {
  title: string;
  cards: ModuleCard[];
}

const CATEGORIES: ModuleCategory[] = [
  {
    title: '1 · Fundamentos',
    cards: [
      {
        id: null,
        title: 'Fundamentos de Algoritmos y TDA',
        description: 'Qué es un algoritmo, qué es un Tipo de Dato Abstracto, e introducción a Big-O.',
        icon: BookOpen,
        badge: 'FN-01 · Próximamente',
        accent: 'text-[#958ea0] bg-[#1c1f2a]',
        disabled: true,
      },
    ],
  },
  {
    title: '2-3 · Estructuras Lineales',
    cards: [
      {
        id: 'listas-enlazadas',
        title: 'Listas Enlazadas',
        description: 'Inserta, elimina y busca nodos viendo cada puntero cambiar paso a paso.',
        icon: Link2,
        badge: 'DS-01 · Nodos y Punteros',
        accent: 'text-[#4cd7f6] bg-[#1c1f2a]',
      },
      {
        id: 'pilas',
        title: 'Pilas',
        description: 'Push, Pop, Peek — y de regalo, resuelve Torres de Hanói.',
        icon: Layers,
        badge: 'DS-02 · LIFO',
        accent: 'text-[#d0bcff] bg-[#1c1f2a]',
      },
      {
        id: 'colas',
        title: 'Colas',
        description: 'Enqueue, Dequeue, Peek — y juega Papa Caliente.',
        icon: ListOrdered,
        badge: 'DS-03 · FIFO',
        accent: 'text-[#4cd7f6] bg-[#1c1f2a]',
      },
    ],
  },
  {
    title: '4 · Tablas Hash',
    cards: [
      {
        id: 'tablas-hash',
        title: 'Tablas Hash',
        description: 'Inserta, busca y elimina claves — y observa cómo se resuelven las colisiones.',
        icon: Hash,
        badge: 'DS-04 · Hashing',
        accent: 'text-[#ffb95f] bg-[#1c1f2a]',
      },
    ],
  },
  {
    title: '5-7 · Árboles y Grafos',
    cards: [
      {
        id: null,
        title: 'Árboles Binarios',
        description: 'Inserción en un BST y recorridos: inorder, preorder, postorder.',
        icon: GitBranch,
        badge: 'DS-05 · Próximamente',
        accent: 'text-[#958ea0] bg-[#1c1f2a]',
        disabled: true,
      },
      {
        id: null,
        title: 'Grafos',
        description: 'Representación (lista/matriz de adyacencia) y recorridos BFS/DFS.',
        icon: Share2,
        badge: 'DS-06 · Próximamente',
        accent: 'text-[#958ea0] bg-[#1c1f2a]',
        disabled: true,
      },
    ],
  },
  {
    title: 'Recursión',
    cards: [
      {
        id: 'recursion',
        title: 'Recursión & Call Stack',
        description: 'Depurador paso a paso de la pila de llamadas del sistema.',
        icon: Terminal,
        badge: 'REC-01 · Call Stack',
        accent: 'text-[#d0bcff] bg-[#1c1f2a]',
      },
    ],
  },
  {
    title: 'Análisis de Algoritmos',
    cards: [
      {
        id: null,
        title: 'Complejidad de Algoritmos',
        description: 'Visualiza algoritmos de ordenamiento y compara su notación Big-O.',
        icon: Gauge,
        badge: 'AL-01 · Próximamente',
        accent: 'text-[#958ea0] bg-[#1c1f2a]',
        disabled: true,
      },
    ],
  },
  {
    title: 'Práctica',
    cards: [
      {
        id: 'desafios',
        title: 'Desafíos',
        description: 'Quiz interactivo para poner a prueba lo aprendido.',
        icon: BrainCircuit,
        badge: 'QZ-01 · Evaluación',
        accent: 'text-[#4cd7f6] bg-[#1c1f2a]',
      },
    ],
  },
];

export const HomeView: React.FC<HomeViewProps> = ({ onSelectModule }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 lg:px-6 py-6 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="px-2 py-0.5 rounded-full bg-[#4cd7f6]/10 text-[#4cd7f6] font-mono text-[10px] tracking-widest uppercase border border-[#4cd7f6]/20 w-fit">
          Laboratorio de Estructuras de Datos y Algoritmos
        </span>
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#dfe2f1]">
          ¿Qué vamos a aprender hoy?
        </h1>
        <p className="text-sm text-[#cbc3d7] max-w-2xl">
          Elige un módulo. Cada uno combina un <strong className="text-[#d0bcff]">simulador interactivo</strong>,
          el <strong className="text-[#4cd7f6]">código en Python</strong> sincronizado con lo que ves en pantalla, y
          la <strong className="text-[#ffb95f]">teoría</strong> explicada al final.
        </p>
      </div>

      {CATEGORIES.map((category) => (
        <div key={category.title} className="flex flex-col gap-3">
          <h2 className="font-mono text-xs uppercase tracking-wider text-[#958ea0] font-semibold">
            {category.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.cards.map((card) => {
              const Icon = card.icon;
              const clickable = !card.disabled && card.id !== null;

              return (
                <button
                  key={card.title}
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && card.id && onSelectModule(card.id)}
                  className={`text-left bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 shadow-md flex flex-col gap-3 transition-all ${
                    clickable
                      ? 'hover:border-[#a078ff]/40 hover:shadow-[0_0_18px_rgba(160,120,255,0.15)] hover:-translate-y-0.5 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {card.disabled ? (
                      <Lock className="w-4 h-4 text-[#958ea0]" />
                    ) : (
                      <ArrowRight className="w-4 h-4 text-[#958ea0]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded bg-[#171b26] text-[#958ea0] font-mono text-[10px] font-semibold w-fit border border-[#262a35]">
                      {card.badge}
                    </span>
                    <h3 className="text-sm font-bold text-[#dfe2f1]">{card.title}</h3>
                    <p className="text-xs text-[#cbc3d7] leading-relaxed">{card.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
