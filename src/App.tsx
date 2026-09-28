/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ModuleId } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './views/HomeView';
import { RecursiveCallstackView } from './views/RecursiveCallstackView';
import { PilasView } from './views/PilasView';
import { ColasView } from './views/ColasView';
import { LinkedListView } from './views/LinkedListView';
import { HashTableView } from './views/HashTableView';
import { ChallengesView } from './views/ChallengesView';

const MODULE_TITLES: Record<ModuleId, string> = {
  'inicio': 'Inicio',
  'fundamentos': 'Fundamentos de Algoritmos',
  'pilas': 'Pilas',
  'colas': 'Colas',
  'recursion': 'Recursión & Call Stack',
  'listas-enlazadas': 'Listas Enlazadas',
  'tablas-hash': 'Tablas Hash',
  'arboles': 'Árboles',
  'grafos': 'Grafos',
  'complejidad': 'Complejidad de Algoritmos',
  'desafios': 'Desafíos',
};

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('inicio');
  const [resetKey, setResetKey] = useState<number>(0);

  const handleResetAll = () => {
    setResetKey((prev) => prev + 1);
  };

  const handleGoHome = () => {
    setActiveModule('inicio');
  };

  return (
    <div className="bg-[#0f131d] text-[#dfe2f1] min-h-screen flex flex-col selection:bg-[#a078ff] selection:text-[#340080]">
      {/* Top Fixed Header */}
      <Header
        activeModule={activeModule}
        moduleTitle={MODULE_TITLES[activeModule]}
        onGoHome={handleGoHome}
        onResetAll={handleResetAll}
      />

      {/* Main View Area */}
      <main className="w-full pt-14 bg-[#0f131d] flex-1 flex flex-col pb-8">
        {activeModule === 'inicio' && <HomeView onSelectModule={setActiveModule} />}

        {activeModule === 'recursion' && (
          <RecursiveCallstackView key={`callstack-${resetKey}`} />
        )}

        {activeModule === 'pilas' && <PilasView key={`pilas-${resetKey}`} />}

        {activeModule === 'colas' && <ColasView key={`colas-${resetKey}`} />}

        {activeModule === 'listas-enlazadas' && (
          <LinkedListView key={`linked-list-${resetKey}`} />
        )}

        {activeModule === 'tablas-hash' && (
          <HashTableView key={`hash-${resetKey}`} />
        )}

        {activeModule === 'desafios' && (
          <ChallengesView key={`challenges-${resetKey}`} />
        )}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
