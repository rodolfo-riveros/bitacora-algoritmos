import React from 'react';
import { Layers, ListOrdered, GitBranch, Link2, Gauge, Terminal, BrainCircuit, Hash, Share2, BookOpen, type LucideIcon } from 'lucide-react';
import { ModuleId } from '../types';
import { TopicCard, CardTheme } from '../components/TopicCard';

interface HomeViewProps {
  onSelectModule: (id: ModuleId) => void;
}

interface ModuleCard {
  id: ModuleId | null;
  title: string;
  description: string;
  icon: LucideIcon;
  eyebrow: string;
  theme: CardTheme;
  cta?: string;
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
        id: 'fundamentos',
        title: 'Fundamentos de Algoritmos y TDA',
        description: 'Qué es un algoritmo, qué es un Tipo de Dato Abstracto, y un explorador interactivo de Big-O.',
        icon: BookOpen,
        eyebrow: 'FN-01 · Teoría',
        theme: 'primary',
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
        eyebrow: 'DS-01 · Nodos y Punteros',
        theme: 'secondary',
      },
      {
        id: 'pilas',
        title: 'Pilas',
        description: 'Push, Pop, Peek — y de regalo, resuelve Torres de Hanói.',
        icon: Layers,
        eyebrow: 'DS-02 · LIFO',
        theme: 'primary',
      },
      {
        id: 'colas',
        title: 'Colas',
        description: 'Enqueue, Dequeue, Peek — y juega Papa Caliente.',
        icon: ListOrdered,
        eyebrow: 'DS-03 · FIFO',
        theme: 'secondary',
      },
    ],
  },
  {
    title: '4 · Tablas Hash',
    cards: [
      {
        id: 'tablas-hash',
        title: 'Tablas Hash',
        description: 'Inserta, busca y elimina claves — y observa cómo se resuelven las colisiones en vivo.',
        icon: Hash,
        eyebrow: 'DS-04 · Hashing',
        theme: 'tertiary',
      },
    ],
  },
  {
    title: '5-7 · Árboles y Grafos',
    cards: [
      {
        id: 'arboles',
        title: 'Árboles Binarios',
        description: 'Inserción en un BST y recorridos: inorder, preorder, postorder.',
        icon: GitBranch,
        eyebrow: 'DS-05 · BST',
        theme: 'primary',
      },
      {
        id: 'grafos',
        title: 'Grafos',
        description: 'Representación con lista de adyacencia y recorridos BFS/DFS.',
        icon: Share2,
        eyebrow: 'DS-06 · BFS / DFS',
        theme: 'secondary',
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
        eyebrow: 'REC-01 · Call Stack',
        theme: 'primary',
        cta: 'Depurar ahora',
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
        eyebrow: 'AL-01 · Próximamente',
        theme: 'tertiary',
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
        description: 'Una evaluación corta por cada tema — pon a prueba lo que acabas de simular.',
        icon: BrainCircuit,
        eyebrow: 'QZ-01 · Evaluación',
        theme: 'tertiary',
        cta: 'Evaluarme ahora',
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
            {category.cards.map((card) => (
              <TopicCard
                key={card.title}
                icon={card.icon}
                theme={card.theme}
                eyebrow={card.eyebrow}
                title={card.title}
                description={card.description}
                cta={card.cta}
                disabled={card.disabled}
                onClick={card.id ? () => onSelectModule(card.id as ModuleId) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
