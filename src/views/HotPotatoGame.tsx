import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, StepForward, Gauge, Plus, RotateCcw, Trophy, X } from 'lucide-react';
import { LogEntry } from '../types';
import { OperationLogPanel } from '../components/OperationLogPanel';
import { getSwatch } from '../constants/palette';

interface Player {
  id: string;
  value: string;
  status?: 'holder' | 'eliminated' | null;
}

interface RoundStep {
  queue: Player[];
  logText: string;
  logType: LogEntry['type'];
}

const genId = () => `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const DEFAULT_NAMES = ['Ana', 'Beto', 'Carla', 'Diego', 'Elena'];

function buildRoundSteps(players: Player[], passes: number): RoundStep[] {
  let queue = players.map((p) => ({ id: p.id, value: p.value, status: null as Player['status'] }));
  const steps: RoundStep[] = [];

  steps.push({
    queue: queue.map((p, i) => (i === 0 ? { ...p, status: 'holder' } : p)),
    logText: `🥔 Empieza la ronda: "${queue[0].value}" tiene la papa. Se harán ${passes} pases.`,
    logType: 'info',
  });

  for (let i = 0; i < passes; i++) {
    const passer = queue[0];
    queue = [...queue.slice(1), { ...passer, status: null }];
    const holder = queue[0];
    queue = queue.map((p, idx) => (idx === 0 ? { ...p, status: 'holder' } : { ...p, status: null }));
    steps.push({
      queue: [...queue],
      logText: `Pase ${i + 1}/${passes}: "${passer.value}" → "${holder.value}"`,
      logType: 'push',
    });
  }

  const eliminated = queue[0];
  steps.push({
    queue: queue.map((p) => (p.id === eliminated.id ? { ...p, status: 'eliminated' } : p)),
    logText: `⏰ ¡Se acabaron los pases! "${eliminated.value}" tenía la papa y queda eliminado.`,
    logType: 'error',
  });

  const survivors = queue.filter((p) => p.id !== eliminated.id).map((p) => ({ ...p, status: null }));
  steps.push({
    queue: survivors,
    logText:
      survivors.length === 1
        ? `🏆 ¡"${survivors[0].value}" es el último en pie — gana el juego!`
        : `Quedan ${survivors.length} jugadores en la cola.`,
    logType: survivors.length === 1 ? 'success' : 'info',
  });

  return steps;
}

export const HotPotatoGame: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>(DEFAULT_NAMES.map((v) => ({ id: genId(), value: v })));
  const [nameInput, setNameInput] = useState('');
  const [round, setRound] = useState(0);
  const [displayQueue, setDisplayQueue] = useState<Player[]>(players);
  const [currentPasses, setCurrentPasses] = useState<number | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMs, setSpeedMs] = useState(650);
  const speedMsRef = useRef(speedMs);
  useEffect(() => {
    speedMsRef.current = speedMs;
  }, [speedMs]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'hp-0', time: '00:00', text: 'Agrega jugadores (mínimo 3) y presiona Iniciar Juego.', type: 'info' },
  ]);

  const stepsRef = useRef<RoundStep[]>([]);
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

  const applyStep = (step: RoundStep) => {
    setDisplayQueue(step.queue);
    addLog(step.logText, step.logType);
  };

  const finishRun = () => {
    setIsRunning(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const lastQueue = stepsRef.current[stepsRef.current.length - 1]?.queue ?? [];
    if (lastQueue.length === 1) {
      setWinner(lastQueue[0]);
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

  const runRound = (steps: RoundStep[]) => {
    stepsRef.current = steps;
    stepIndexRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);
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

  const handleAddPlayer = () => {
    const name = nameInput.trim();
    if (!name || round > 0) return;
    setPlayers((prev) => [...prev, { id: genId(), value: name }]);
    setNameInput('');
  };

  const handleRemovePlayer = (id: string) => {
    if (round > 0) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleStartGame = () => {
    if (players.length < 3 || isRunning) return;
    setRound(1);
    setWinner(null);
    setDisplayQueue(players);
    const passes = Math.floor(Math.random() * (players.length - 1)) + 2;
    setCurrentPasses(passes);
    runRound(buildRoundSteps(players, passes));
  };

  const handleNextRound = () => {
    if (isRunning || displayQueue.length < 2) return;
    setRound((r) => r + 1);
    const passes = Math.floor(Math.random() * Math.max(displayQueue.length - 1, 1)) + 1;
    setCurrentPasses(passes);
    runRound(buildRoundSteps(displayQueue, passes));
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setRound(0);
    setWinner(null);
    setCurrentPasses(null);
    setDisplayQueue(players);
    addLog('Juego reiniciado.', 'info');
  };

  const canEdit = round === 0;

  return (
    <div className="flex flex-col w-full text-[#dfe2f1]">
      <section className="w-full px-4 lg:px-6 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight text-[#dfe2f1]">🥔 Papa Caliente</h1>
        <p className="text-xs text-[#958ea0] mt-0.5">
          Cada pase es un <code className="text-[#4cd7f6]">dequeue()</code> seguido de un{' '}
          <code className="text-[#4cd7f6]">enqueue()</code> — quien queda al frente cuando se acaban los pases,
          queda eliminado.
        </p>
      </section>

      {canEdit && (
        <section className="w-full px-4 lg:px-6 pb-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Nombre del jugador"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            className="w-44 bg-[#171b26] border border-[#262a35] rounded-lg px-3 py-1.5 text-xs text-[#dfe2f1] placeholder-[#6b6678] focus:outline-none focus:border-[#4cd7f6] transition-all"
          />
          <button
            onClick={handleAddPlayer}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#03b5d3] text-[#001f26] text-xs font-semibold hover:bg-[#4cd7f6] transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
          <button
            onClick={handleStartGame}
            disabled={players.length < 3}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d0bcff] text-[#3c0091] text-xs font-semibold hover:bg-[#e9ddff] transition-all disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
            title={players.length < 3 ? 'Necesitas al menos 3 jugadores' : undefined}
          >
            <Play className="w-3.5 h-3.5" /> Iniciar Juego ({players.length})
          </button>
        </section>
      )}

      {!canEdit && (
        <section className="w-full px-4 lg:px-6 pb-3 flex flex-wrap items-center gap-3 text-xs">
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

          {!isRunning && !winner && displayQueue.length > 1 && (
            <button
              onClick={handleNextRound}
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a078ff] text-[#340080] font-semibold hover:bg-[#d0bcff] transition-all"
            >
              <Play className="w-4 h-4" /> Siguiente Ronda
            </button>
          )}

          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[#958ea0] hover:text-[#ffb4ab] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Juego
          </button>

          <div className="flex items-center gap-1 ml-auto text-[#958ea0]">
            <Gauge className="w-3.5 h-3.5" />
            {[
              { label: '1x', val: 900 },
              { label: '2x', val: 500 },
              { label: '4x', val: 200 },
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
      )}

      {/* Player chips (setup) or queue visual (playing) */}
      <div className="w-full px-4 lg:px-6 pb-3">
        <div className="bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 min-h-[160px] flex flex-col justify-center relative overflow-hidden">
          {winner && (
            <div className="absolute inset-0 bg-[#0a0e18]/95 flex flex-col items-center justify-center gap-2 z-20">
              <Trophy className="w-8 h-8 text-[#ffb95f]" />
              <span className="text-lg font-bold text-[#dfe2f1]">¡"{winner.value}" gana! 🎉</span>
              <button
                onClick={handleReset}
                type="button"
                className="mt-2 flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#d0bcff] text-[#3c0091] text-xs font-semibold hover:bg-[#e9ddff] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Jugar de nuevo
              </button>
            </div>
          )}

          {canEdit ? (
            <div className="flex flex-wrap items-center gap-2 justify-center">
              {players.length === 0 && <span className="text-xs text-[#6b6678]">Agrega al menos 3 jugadores.</span>}
              {players.map((p, idx) => {
                const swatch = getSwatch(idx);
                return (
                  <span
                    key={p.id}
                    className={`flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-semibold border ${swatch.bg} ${swatch.text} ${swatch.border}`}
                  >
                    {p.value}
                    <button
                      onClick={() => handleRemovePlayer(p.id)}
                      type="button"
                      className="w-4 h-4 rounded-full bg-black/10 hover:bg-black/25 flex items-center justify-center"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <>
              <div className="w-full flex items-center justify-between pb-2 text-[10px] text-[#958ea0]">
                <span>Ronda {round}</span>
                {currentPasses !== null && <span>Pases esta ronda: {currentPasses}</span>}
              </div>
              <div className="w-full flex items-center gap-2.5 overflow-x-auto py-3">
                {displayQueue.map((p, idx) => {
                  const swatch = getSwatch(idx);
                  const isHolder = p.status === 'holder';
                  const isEliminated = p.status === 'eliminated';
                  return (
                    <div
                      key={p.id}
                      className={`h-16 min-w-[100px] rounded-lg p-2 flex flex-col items-center justify-center gap-1 text-xs border transition-all shrink-0 ${swatch.bg} ${swatch.text} ${swatch.border} ${swatch.shadow} ${
                        isHolder ? 'ring-2 ring-[#ffb95f] scale-105' : ''
                      } ${isEliminated ? 'opacity-40 animate-queue-dequeue' : ''}`}
                    >
                      {isHolder && <span className="text-base leading-none">🥔</span>}
                      <span className="font-bold truncate text-center">{p.value}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-full px-4 lg:px-6">
        <OperationLogPanel title="Registro de Rondas" logs={logs} onClear={() => setLogs([])} />
      </div>
    </div>
  );
};
