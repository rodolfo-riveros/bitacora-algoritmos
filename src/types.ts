export type ModuleId =
  | 'inicio'
  | 'fundamentos'
  | 'pilas'
  | 'colas'
  | 'recursion'
  | 'listas-enlazadas'
  | 'tablas-hash'
  | 'arboles'
  | 'grafos'
  | 'complejidad'
  | 'desafios';

export type TowerId = 'A' | 'B' | 'C';

export interface HanoiMove {
  from: TowerId;
  to: TowerId;
  disk: number;
}

export interface CallStackFrame {
  id: string;
  name: string;
  pc: string;
  badge: string;
  isTop?: boolean;
  args?: Record<string, any>;
  retLine?: string;
  offsetMem?: string;
  status?: string;
}

export interface LogEntry {
  id: string;
  time: string;
  text: string;
  type: 'push' | 'pop' | 'error' | 'success' | 'info';
}

export type CodeLanguage = 'python' | 'javascript' | 'cpp' | 'java';

export interface QueueItem {
  id: string;
  value: string | number;
  timestamp: string;
}

export interface StackItem {
  id: string;
  value: string | number;
  timestamp: string;
}

export interface CodeLine {
  num: number;
  code: string;
  isComment?: boolean;
}
