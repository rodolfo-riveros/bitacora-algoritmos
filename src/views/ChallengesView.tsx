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

  // ---------------------------------------------------------------------------
  // Fundamentos — ampliación (8 preguntas más, total 10)
  // ---------------------------------------------------------------------------
  {
    id: 16,
    category: 'Fundamentos',
    title: '¿Cuál es la complejidad de tiempo de push() en una Pila implementada con una lista de Python?',
    options: ['O(1) — Constante', 'O(n) — Lineal', 'O(log n) — Logarítmica', 'O(n²) — Cuadrática'],
    correctIndex: 0,
    explanation: 'push() solo agrega un elemento al final de la lista interna sin recorrer nada, por eso es O(1) — el mismo ejemplo que usa el explorador de Big-O de Fundamentos.',
  },
  {
    id: 17,
    category: 'Fundamentos',
    title: 'Ordena estas complejidades de MENOR a MAYOR crecimiento según n se hace grande.',
    options: [
      'O(1) < O(log n) < O(n) < O(n²)',
      'O(n²) < O(n) < O(log n) < O(1)',
      'O(log n) < O(1) < O(n) < O(n²)',
      'O(1) < O(n) < O(log n) < O(n²)',
    ],
    correctIndex: 0,
    explanation: 'El orden de crecimiento (de más lento a más rápido) es O(1), O(log n), O(n), O(n²) — así están ordenadas las tarjetas en el explorador interactivo de Big-O.',
  },
  {
    id: 18,
    category: 'Fundamentos',
    title: 'En el explorador de Big-O del simulador, ¿qué pasa cuando mueves el slider de n hacia un valor grande?',
    options: [
      'Las barras de complejidades con mayor exponente (como O(n²) u O(2ⁿ)) crecen mucho más rápido que las de O(1) o O(log n)',
      'Todas las barras crecen exactamente igual',
      'Las barras disminuyen de tamaño',
      'Solo cambia el color de las barras, no su tamaño',
    ],
    correctIndex: 0,
    explanation: 'El slider recalcula el número estimado de pasos para cada clase de complejidad con ese n; en escala logarítmica se ve claramente cómo O(n²) y O(2ⁿ) se disparan frente a las clases de menor crecimiento.',
  },
  {
    id: 19,
    category: 'Fundamentos',
    title: '¿Cuál de estas operaciones, disponible en otro módulo del simulador, es un ejemplo de complejidad O(2ⁿ) (exponencial)?',
    options: [
      'Resolver Torres de Hanói con n discos',
      'Hacer push() en una pila',
      'Buscar un nodo en una lista enlazada',
      'Acceder al índice 0 de un arreglo',
    ],
    correctIndex: 0,
    explanation: 'Torres de Hanói necesita 2ⁿ - 1 movimientos: el ejemplo clásico de crecimiento exponencial que usa el explorador de Big-O en Fundamentos.',
  },
  {
    id: 20,
    category: 'Fundamentos',
    title: '¿Cuál de estas SÍ forma parte del contrato de una Cola (TDA) usada en el simulador de Colas?',
    options: [
      'Solo puedes sacar elementos por el frente (Head) y agregar por el final (Tail)',
      'Puedes sacar cualquier elemento sin importar su posición',
      'Debe implementarse siempre con un arreglo de tamaño fijo',
      'No garantiza ningún orden de salida',
    ],
    correctIndex: 0,
    explanation: 'Un TDA define QUÉ operaciones existen y qué garantizan: la Cola garantiza FIFO, con entrada solo por el final y salida solo por el frente, sin importar cómo se implemente por dentro.',
  },
  {
    id: 21,
    category: 'Fundamentos',
    title: '¿Cuál de estas SÍ es una de las características que debe cumplir todo algoritmo?',
    options: [
      'Finitud: debe terminar en un número finito de pasos',
      'Debe estar escrito en Python',
      'Debe usar siempre recursión',
      'Debe tardar el mismo tiempo sin importar el tamaño de n',
    ],
    correctIndex: 0,
    explanation: 'Un algoritmo debe ser finito, tener pasos precisos y entradas/salidas bien definidas — pero NO necesita tiempo constante, ni un lenguaje o técnica (recursión) en particular.',
  },
  {
    id: 22,
    category: 'Fundamentos',
    title: 'Entre O(n) y O(n log n), ¿cuál crece más rápido a medida que n aumenta?',
    options: ['O(n log n)', 'O(n)', 'Crecen exactamente igual', 'Depende del lenguaje de programación'],
    correctIndex: 0,
    explanation: 'O(n log n) agrega un factor logarítmico extra sobre O(n): para n grande siempre termina creciendo más rápido, aunque ambas sean clases "eficientes".',
  },
  {
    id: 23,
    category: 'Fundamentos',
    title: '¿Qué estructura del simulador tiene complejidad O(n) para BUSCAR un valor, porque hay que recorrerla nodo por nodo?',
    options: [
      'Lista enlazada (buscar(valor))',
      'Pila (peek())',
      'Cola (peek())',
      'Tabla hash sin ninguna colisión',
    ],
    correctIndex: 0,
    explanation: 'En una lista enlazada no hay acceso directo por índice: buscar un valor exige recorrer desde head comparando nodo por nodo, por eso es O(n) — el mismo contador de comparaciones que ves en ese módulo.',
  },

  // ---------------------------------------------------------------------------
  // Pilas (LIFO) — ampliación (9 preguntas más, total 10)
  // ---------------------------------------------------------------------------
  {
    id: 24,
    category: 'Pilas (LIFO)',
    title: 'Al cargar el módulo de Pilas, el simulador se precarga con Token_1, Token_2 y Token_3 apilados en ese orden. ¿Qué elemento queda en la CIMA?',
    options: ['Token_3', 'Token_1', 'Token_2', 'Ninguno, empieza vacía'],
    correctIndex: 0,
    explanation: 'Los tres se apilan en orden (Token_1 primero, Token_3 al final), así que Token_3 queda arriba de todo — el mismo que anuncia el log inicial del simulador.',
  },
  {
    id: 25,
    category: 'Pilas (LIFO)',
    title: 'Partiendo de la pila inicial del simulador (Token_1, Token_2, Token_3) presionas "Pop" tres veces seguidas. ¿En qué orden salen los elementos?',
    options: [
      'Token_3, luego Token_2, luego Token_1',
      'Token_1, luego Token_2, luego Token_3',
      'Token_2, luego Token_3, luego Token_1',
      'Salen los tres a la vez',
    ],
    correctIndex: 0,
    explanation: 'LIFO: el último en entrar es el primero en salir, así que el orden de salida es exactamente el inverso al de entrada.',
  },
  {
    id: 26,
    category: 'Pilas (LIFO)',
    title: 'Si vacías la pila del simulador y presionas "Pop" otra vez, ¿qué sucede según el código de la clase Pila?',
    options: [
      'Se resalta `if len(self.elementos) == 0:` y se imprime "La pila está vacía, no hay nada que sacar", retornando None',
      'El botón está deshabilitado y no pasa nada',
      'Lanza una excepción que detiene el programa',
      'Saca el elemento más antiguo en su lugar',
    ],
    correctIndex: 0,
    explanation: 'El botón de Pop nunca se deshabilita por estar vacía: así el estudiante siempre ve ejecutarse la rama de guardia del código, resaltada en rojo con `tone="error"`.',
  },
  {
    id: 27,
    category: 'Pilas (LIFO)',
    title: '¿Cuál es la complejidad temporal de push(), pop() y peek() en la Pila del simulador?',
    options: ['O(1) las tres', 'O(n) las tres', 'O(1) push y pop, O(n) peek', 'O(log n) las tres'],
    correctIndex: 0,
    explanation: 'Las tres solo acceden o modifican el final de la lista interna (self.elementos), sin recorrer nada, por eso son O(1).',
  },
  {
    id: 28,
    category: 'Pilas (LIFO)',
    title: 'El simulador de Pilas tiene una capacidad visual máxima de 6 discos. Si ya hay 6 y presionas "Push", ¿qué mensaje muestra?',
    options: [
      '¡Stack Overflow! Capacidad máxima (6) alcanzada',
      'La pila se expande automáticamente a 7',
      'No pasa nada, el click se ignora en silencio',
      'Reemplaza el disco de la cima por el nuevo',
    ],
    correctIndex: 0,
    explanation: 'El simulador bloquea el push() y muestra el mensaje de error "¡Stack Overflow!" cuando se alcanza el límite visual de 6 elementos.',
  },
  {
    id: 29,
    category: 'Pilas (LIFO)',
    title: '¿Qué operación te permite ver el valor de la cima SIN eliminarlo?',
    options: ['peek()', 'pop()', 'push()', 'clear()'],
    correctIndex: 0,
    explanation: 'peek() solo lee self.elementos[-1] y lo retorna, sin modificar la pila.',
  },
  {
    id: 30,
    category: 'Pilas (LIFO)',
    title: 'En Torres de Hanói (embebido debajo del simulador de Pilas), cada movimiento de disco equivale exactamente a:',
    options: [
      'Un pop() de la torre origen seguido de un push() en la torre destino',
      'Solo un push()',
      'Solo un pop()',
      'Un peek() seguido de un push()',
    ],
    correctIndex: 0,
    explanation: 'Mover un disco siempre es sacarlo de su torre actual (pop) y colocarlo en la torre destino (push) — el mismo principio LIFO aplicado a las torres.',
  },
  {
    id: 31,
    category: 'Pilas (LIFO)',
    title: 'Partiendo de una pila vacía, ejecutas: push("A"), push("B"), peek(), push("C"), pop(). ¿Qué valor queda en la cima?',
    options: ['B', 'C', 'A', 'La pila queda vacía'],
    correctIndex: 0,
    explanation: 'Traza: push(A)->[A], push(B)->[A,B], peek() no cambia nada, push(C)->[A,B,C], pop()->retorna C, queda [A,B]. La cima es B.',
  },
  {
    id: 32,
    category: 'Pilas (LIFO)',
    title: '¿Por qué el botón "Pop" en el simulador NUNCA se deshabilita, ni siquiera cuando la pila está vacía?',
    options: [
      'Para que el estudiante pueda ver ejecutarse la rama de guardia (if vacía) en el código, no solo el caso exitoso',
      'Por un error de programación que no se corrigió',
      'Porque pop() nunca puede fallar',
      'Porque la pila siempre tiene al menos un elemento',
    ],
    correctIndex: 0,
    explanation: 'Deshabilitar el botón escondería el código más importante de ver: el caso de guardia. Solo se bloquea mientras hay una animación en curso (isBusy).',
  },

  // ---------------------------------------------------------------------------
  // Colas (FIFO) — ampliación (9 preguntas más, total 10)
  // ---------------------------------------------------------------------------
  {
    id: 33,
    category: 'Colas (FIFO)',
    title: 'Al cargar el módulo de Colas, el simulador se precarga con Cliente_A, Cliente_B y Cliente_C en ese orden. ¿Quién está en el FRENTE (Head)?',
    options: ['Cliente_A', 'Cliente_B', 'Cliente_C', 'Ninguno, empieza vacía'],
    correctIndex: 0,
    explanation: 'El primero en entrar (Cliente_A) queda al frente, listo para salir primero — así lo anuncia el log inicial del simulador.',
  },
  {
    id: 34,
    category: 'Colas (FIFO)',
    title: 'Partiendo de la cola inicial del simulador [Cliente_A, Cliente_B, Cliente_C], ejecutas enqueue(Cliente_D), luego dequeue(), luego dequeue(). ¿Quién queda al frente?',
    options: ['Cliente_C', 'Cliente_A', 'Cliente_D', 'Cliente_B'],
    correctIndex: 0,
    explanation: 'Traza: [A,B,C] -> enqueue(D) -> [A,B,C,D] -> dequeue() saca A -> [B,C,D] -> dequeue() saca B -> [C,D]. El frente es Cliente_C.',
  },
  {
    id: 35,
    category: 'Colas (FIFO)',
    title: 'Si vacías la cola del simulador y presionas "Dequeue" otra vez, ¿qué sucede según el código de la clase Cola?',
    options: [
      'Se resalta `if len(self.elementos) == 0:` y se imprime "La cola está vacía, no hay nada que atender", retornando None',
      'El botón está deshabilitado y no pasa nada',
      'Se elimina el último elemento agregado en su lugar',
      'Lanza un error fatal que detiene la app',
    ],
    correctIndex: 0,
    explanation: 'Igual que en Pilas, el botón de Dequeue nunca se deshabilita por estar vacía, para que siempre se vea ejecutarse la rama de guardia del código.',
  },
  {
    id: 36,
    category: 'Colas (FIFO)',
    title: '¿Cuál es la diferencia clave entre dequeue() de una Cola y pop() de una Pila?',
    options: [
      'dequeue() saca del FRENTE (FIFO), pop() saca de la CIMA (LIFO)',
      'Son exactamente la misma operación con otro nombre',
      'dequeue() solo funciona con valores numéricos',
      'pop() siempre es más lento que dequeue()',
    ],
    correctIndex: 0,
    explanation: 'Ambas quitan un elemento, pero de extremos distintos: la Cola siempre saca el más antiguo (frente), la Pila siempre saca el más reciente (cima).',
  },
  {
    id: 37,
    category: 'Colas (FIFO)',
    title: 'La cola del simulador tiene capacidad visual máxima de 6 elementos. Si ya hay 6 y presionas "Enqueue", ¿qué mensaje aparece?',
    options: [
      '¡Queue Overflow! Capacidad límite (6) alcanzada',
      'El elemento más antiguo se elimina automáticamente para hacer espacio',
      'No pasa nada, el click se ignora',
      'La cola se duplica de tamaño',
    ],
    correctIndex: 0,
    explanation: 'El simulador bloquea el enqueue() y muestra el mensaje de error "¡Queue Overflow!" al alcanzar el límite visual de 6 elementos.',
  },
  {
    id: 38,
    category: 'Colas (FIFO)',
    title: 'En el juego Papa Caliente (embebido debajo del simulador de Colas), cada "pase" de la papa equivale a:',
    options: [
      'Un dequeue() seguido de un enqueue() del mismo jugador, rotando la cola',
      'Solo un dequeue()',
      'Solo un enqueue()',
      'Un peek() que no cambia nada',
    ],
    correctIndex: 0,
    explanation: 'Rotar la cola es sacar al jugador del frente y volver a encolarlo al final — la cola da toda la vuelta sin perder a nadie.',
  },
  {
    id: 39,
    category: 'Colas (FIFO)',
    title: 'En Papa Caliente, cuando se acaban los pases y hay que eliminar a un jugador, ¿qué operación se ejecuta sobre él?',
    options: [
      'Un dequeue() puro, sin volver a encolarlo',
      'Un push() al inicio de la cola',
      'Un peek() que lo marca como eliminado sin sacarlo',
      'Se reinicia toda la cola de jugadores',
    ],
    correctIndex: 0,
    explanation: 'A diferencia de un pase normal (dequeue + enqueue), eliminar es solo un dequeue(): el jugador sale y no vuelve a entrar.',
  },
  {
    id: 40,
    category: 'Colas (FIFO)',
    title: '¿Qué operación te permite ver quién está al frente de la cola sin sacarlo?',
    options: ['peek()', 'dequeue()', 'enqueue()', 'pop()'],
    correctIndex: 0,
    explanation: 'peek() solo lee self.elementos[0] y lo retorna, sin modificar la cola.',
  },
  {
    id: 41,
    category: 'Colas (FIFO)',
    title: 'Partiendo de una cola vacía, ejecutas: enqueue("X"), enqueue("Y"), dequeue(), enqueue("Z"). ¿Quién está al frente ahora?',
    options: ['Y', 'X', 'Z', 'La cola está vacía'],
    correctIndex: 0,
    explanation: 'Traza: enqueue(X)->[X], enqueue(Y)->[X,Y], dequeue() saca X->[Y], enqueue(Z)->[Y,Z]. El frente es Y.',
  },

  // ---------------------------------------------------------------------------
  // Torres de Hanói — ampliación (9 preguntas más, total 10)
  // ---------------------------------------------------------------------------
  {
    id: 42,
    category: 'Torres de Hanói',
    title: '¿Cuántos movimientos mínimos se necesitan para resolver Torres de Hanói con 3 discos (la configuración por defecto del simulador)?',
    options: ['7 movimientos', '3 movimientos', '8 movimientos', '15 movimientos'],
    correctIndex: 0,
    explanation: 'Con la fórmula 2ⁿ - 1: para n = 3, 2³ - 1 = 8 - 1 = 7 movimientos.',
  },
  {
    id: 43,
    category: 'Torres de Hanói',
    title: '¿Cuántos movimientos mínimos se necesitan con 6 discos (el máximo seleccionable en el simulador)?',
    options: ['63 movimientos', '36 movimientos', '64 movimientos', '32 movimientos'],
    correctIndex: 0,
    explanation: 'Para n = 6: 2⁶ - 1 = 64 - 1 = 63 movimientos.',
  },
  {
    id: 44,
    category: 'Torres de Hanói',
    title: 'En el simulador, usando el algoritmo clásico hanoi(n, origen=A, destino=C, auxiliar=B), ¿a qué torre terminan TODOS los discos?',
    options: ['Stack_C', 'Stack_A', 'Stack_B', 'Cualquiera de las tres, es indistinto'],
    correctIndex: 0,
    explanation: 'El objetivo del algoritmo es mover toda la torre de origen (A) al destino (C), usando B como auxiliar temporal.',
  },
  {
    id: 45,
    category: 'Torres de Hanói',
    title: 'Según la regla LIFO de Hanói, ¿qué disco de una torre puedes mover primero?',
    options: [
      'Solo el disco que está en la cima (el más pequeño visible de esa torre)',
      'Cualquier disco, sin importar su posición',
      'Siempre el disco más grande de esa torre',
      'El disco que está en el medio',
    ],
    correctIndex: 0,
    explanation: 'Igual que con cualquier pila, solo se puede acceder a la cima: el disco más pequeño visible de la torre, nunca uno de en medio o de abajo.',
  },
  {
    id: 46,
    category: 'Torres de Hanói',
    title: '¿Cuál de estas reglas de Torres de Hanói es INCORRECTA (no está permitida)?',
    options: [
      'Puedes colocar un disco grande encima de uno más pequeño',
      'Solo puedes mover un disco a la vez',
      'Solo puedes mover el disco que está en la cima de una torre',
      'Debes usar las 3 torres para resolver el rompecabezas con más de 1 disco',
    ],
    correctIndex: 0,
    explanation: 'Esa es la única regla que el juego prohíbe: un disco más grande nunca puede quedar sobre uno más pequeño. Las otras tres SÍ son reglas válidas del juego.',
  },
  {
    id: 47,
    category: 'Torres de Hanói',
    title: 'El algoritmo recursivo se define como hanoi(n, origen, destino, auxiliar). ¿Cuál es su CASO BASE?',
    options: [
      'n == 1: se mueve el disco directamente de origen a destino',
      'n == 0: no se hace absolutamente nada',
      'Cuando n es un número par',
      'Nunca tiene caso base, es una recursión infinita',
    ],
    correctIndex: 0,
    explanation: 'Con n == 1 solo hay un disco que mover: se saca de origen (pop) y se coloca en destino (push), y la función retorna sin más llamadas recursivas.',
  },
  {
    id: 48,
    category: 'Torres de Hanói',
    title: 'Entre las dos llamadas recursivas hanoi(n-1, origen, auxiliar, destino) y hanoi(n-1, auxiliar, destino, origen), ¿qué se hace en medio?',
    options: [
      'Se mueve (pop + push) el disco más grande restante de origen a destino',
      'Se reinicia toda la pila a su estado original',
      'No se hace nada más entre esas dos llamadas',
      'Se mueve el disco más grande de auxiliar a origen',
    ],
    correctIndex: 0,
    explanation: 'Después de liberar la torre origen moviendo n-1 discos al auxiliar, se mueve el disco más grande que queda (el de origen) directamente al destino, antes de traer los n-1 discos restantes.',
  },
  {
    id: 49,
    category: 'Torres de Hanói',
    title: 'En el simulador, ¿qué contador aumenta cada vez que mueves un disco, ya sea en modo manual o automático?',
    options: [
      'El contador de movimientos (moves)',
      'El número de discos seleccionado (numDisks)',
      'El tamaño de la torre auxiliar',
      'Ningún contador, el simulador no lleva la cuenta',
    ],
    correctIndex: 0,
    explanation: 'Cada movimiento válido (push+pop entre torres) incrementa el contador de movimientos, que se compara contra el mínimo teórico (2ⁿ - 1).',
  },
  {
    id: 50,
    category: 'Torres de Hanói',
    title: 'En modo manual, intentas colocar un disco grande encima de uno más chico en otra torre. ¿Qué hace el simulador?',
    options: [
      'Bloquea el movimiento porque viola la regla LIFO/Hanói',
      'Permite el movimiento sin ningún problema',
      'Elimina el disco que intentaste mover',
      'Reinicia todo el juego automáticamente',
    ],
    correctIndex: 0,
    explanation: 'executeMove valida cada movimiento manual contra las reglas de Hanói antes de aplicarlo; si lo viola, simplemente lo rechaza.',
  },

  // ---------------------------------------------------------------------------
  // Recursión & Call Stack — ampliación (8 preguntas más, total 10)
  // ---------------------------------------------------------------------------
  {
    id: 51,
    category: 'Recursión & Call Stack',
    title: 'En el depurador de Call Stack del simulador, ¿qué representa cada "marco" (frame) que se apila?',
    options: [
      'Una llamada activa a la función hanoi() que todavía no ha terminado de ejecutarse',
      'Un disco físico de una torre',
      'Un elemento de una cola',
      'Una variable global del programa',
    ],
    correctIndex: 0,
    explanation: 'Cada vez que hanoi() se llama a sí misma, se apila un nuevo marco con sus propios parámetros (n, origen, destino, auxiliar), que representa esa llamada en curso.',
  },
  {
    id: 52,
    category: 'Recursión & Call Stack',
    title: 'Según la leyenda del depurador (Activo / Finalizado / Pendiente), ¿cuándo se desapila (pop) un marco del Call Stack?',
    options: [
      'Cuando esa llamada a la función termina de ejecutarse y retorna',
      'Cuando la llamada empieza a ejecutarse',
      'Nunca se desapila, los marcos se acumulan todos',
      'Cuando cambias de lenguaje (Python/JavaScript) en el selector',
    ],
    correctIndex: 0,
    explanation: 'Un marco permanece apilado mientras su llamada sigue "en pausa" esperando el resultado de sus llamadas recursivas internas; se desapila justo cuando retorna.',
  },
  {
    id: 53,
    category: 'Recursión & Call Stack',
    title: '¿Qué relación tiene Torres de Hanói con el concepto de Pila (Stack), más allá de usar el Call Stack?',
    options: [
      'Cada movimiento de disco es un pop() de la torre origen seguido de un push() en la torre destino — el mismo principio LIFO aplicado dos veces',
      'No tienen ninguna relación entre sí',
      'Hanói usa una Cola (FIFO), no una Pila',
      'Solo se relacionan por casualidad en el nombre',
    ],
    correctIndex: 0,
    explanation: 'El principio LIFO aparece dos veces en Hanói: en las torres de discos y en el Call Stack de la recursión que las resuelve.',
  },
  {
    id: 54,
    category: 'Recursión & Call Stack',
    title: 'El simulador muestra hanoi() en Python y en JavaScript. ¿Qué tienen en común ambas versiones?',
    options: [
      'La misma estructura: un caso base (n == 1) y dos llamadas recursivas con los roles de las torres intercambiados',
      'JavaScript no necesita caso base para funcionar',
      'Python usa un bucle for en vez de recursión',
      'Son completamente distintas en su lógica interna',
    ],
    correctIndex: 0,
    explanation: 'Cambia la sintaxis (def vs function, print vs console.log), pero el algoritmo —caso base más dos llamadas recursivas— es idéntico en ambos lenguajes.',
  },
  {
    id: 55,
    category: 'Recursión & Call Stack',
    title: '¿Qué pasaría si hanoi(n, origen, destino, auxiliar) NUNCA llegara a su caso base (n == 1)?',
    options: [
      'El Call Stack crecería indefinidamente hasta un desbordamiento de pila (Stack Overflow / RecursionError)',
      'El programa terminaría instantáneamente sin error',
      'Se ejecutaría en tiempo O(1)',
      'JavaScript lo optimizaría automáticamente sin lanzar ningún error',
    ],
    correctIndex: 0,
    explanation: 'Sin caso base, cada llamada sigue apilando un nuevo marco sin que ninguno retorne nunca, hasta agotar la memoria asignada al Call Stack.',
  },
  {
    id: 56,
    category: 'Recursión & Call Stack',
    title: 'En la llamada hanoi(3, A, C, B), ¿cuál es la PRIMERA llamada recursiva que se apila en el Call Stack?',
    options: [
      'hanoi(2, A, B, C) — mover 2 discos de A a B usando C como auxiliar',
      'hanoi(2, A, C, B)',
      'hanoi(1, A, C, B)',
      'hanoi(3, C, A, B)',
    ],
    correctIndex: 0,
    explanation: 'Según el código, la primera llamada recursiva es hanoi(n-1, origen, auxiliar, destino): con n=3, origen=A, destino=C, auxiliar=B, eso es hanoi(2, A, B, C).',
  },
  {
    id: 57,
    category: 'Recursión & Call Stack',
    title: '¿Cuántos marcos (frames), como máximo, puede haber simultáneamente en el Call Stack al resolver Hanói con n discos?',
    options: [
      'n (la profundidad máxima de la recursión)',
      '2ⁿ - 1 (el total de movimientos)',
      'n²',
      'Siempre exactamente 1',
    ],
    correctIndex: 0,
    explanation: 'Aunque el número total de movimientos es exponencial (2ⁿ - 1), la memoria del Call Stack es solo O(n) porque los marcos se desapilan conforme cada llamada retorna.',
  },
  {
    id: 58,
    category: 'Recursión & Call Stack',
    title: '¿Qué significa que un marco del Call Stack esté en estado "Pendiente" en el depurador?',
    options: [
      'Todavía no se ha ejecutado esa llamada a la función',
      'Ya terminó de ejecutarse y fue desapilada',
      'Está ejecutándose en este momento',
      'Tiene un error que detuvo el programa',
    ],
    correctIndex: 0,
    explanation: 'Los tres estados representan el ciclo de vida de una llamada: Pendiente (aún no se invoca), Activo (ejecutándose ahora mismo) y Finalizado (ya retornó).',
  },

  // ---------------------------------------------------------------------------
  // Listas Enlazadas — ampliación (8 preguntas más, total 10)
  // ---------------------------------------------------------------------------
  {
    id: 59,
    category: 'Listas Enlazadas',
    title: 'Al cargar el simulador de Listas Enlazadas, la lista precargada es 10 → 25 → 7 → NULL. ¿Qué valor está en HEAD?',
    options: ['10', '25', '7', 'NULL'],
    correctIndex: 0,
    explanation: 'HEAD siempre apunta al primer nodo de la lista; en la semilla del simulador, ese es el nodo con valor 10.',
  },
  {
    id: 60,
    category: 'Listas Enlazadas',
    title: 'Partiendo de la lista inicial (10 → 25 → 7 → NULL), insertas 99 al INICIO. ¿Cómo queda la lista?',
    options: [
      '99 → 10 → 25 → 7 → NULL',
      '10 → 25 → 7 → 99 → NULL',
      '10 → 99 → 25 → 7 → NULL',
      '99 → 7 → 25 → 10 → NULL',
    ],
    correctIndex: 0,
    explanation: 'insertar_al_inicio crea el nodo nuevo, lo enlaza al antiguo head (99.next = 10) y mueve head al nodo nuevo: 99 pasa a ser el primero.',
  },
  {
    id: 61,
    category: 'Listas Enlazadas',
    title: 'Según el código del simulador, ¿cuáles son los dos pasos exactos de insertar_al_inicio(valor)?',
    options: [
      'nuevo.next = self.head, y luego self.head = nuevo',
      'self.head = nuevo, y luego nuevo.next = self.head',
      'Se recorre toda la lista buscando el último nodo',
      'Se compara el valor con cada nodo existente antes de insertar',
    ],
    correctIndex: 0,
    explanation: 'Primero el nuevo nodo apunta hacia el antiguo head (para no perder el resto de la lista) y recién después head se reasigna al nuevo nodo — el orden importa.',
  },
  {
    id: 62,
    category: 'Listas Enlazadas',
    title: '¿Por qué insertar al FINAL de una lista enlazada simple es O(n) y no O(1)?',
    options: [
      'Porque hay que recorrer con .next desde head hasta llegar al último nodo antes de enlazar el nuevo',
      'Porque Python prohíbe insertar al final',
      'Porque siempre hay que reordenar toda la lista por valor',
      'No es O(n): insertar al final también es O(1)',
    ],
    correctIndex: 0,
    explanation: 'Sin un puntero tail guardado aparte, la única forma de encontrar el último nodo es recorrer la lista completa desde head, por eso es O(n).',
  },
  {
    id: 63,
    category: 'Listas Enlazadas',
    title: 'En la lista inicial del simulador (10 → 25 → 7 → NULL), ¿cuántas comparaciones hace buscar(7) hasta encontrarlo?',
    options: ['3 comparaciones (10, 25, 7)', '1 comparación', '7 comparaciones', '0, porque hay acceso directo por índice'],
    correctIndex: 0,
    explanation: 'buscar() recorre nodo por nodo desde head comparando valor == buscado; para encontrar 7 (el tercer nodo) hace 3 comparaciones.',
  },
  {
    id: 64,
    category: 'Listas Enlazadas',
    title: 'Si ejecutas eliminar_por_valor(10) sobre la lista inicial (10 → 25 → 7 → NULL), ¿qué nodo queda como nuevo HEAD?',
    options: ['25', '7', '10 (no cambia)', 'La lista queda vacía'],
    correctIndex: 0,
    explanation: 'El código detecta que self.head.valor == 10 y reasigna self.head = self.head.next, así que 25 pasa a ser el nuevo head.',
  },
  {
    id: 65,
    category: 'Listas Enlazadas',
    title: '¿Qué dibuja el simulador para representar el final de la lista enlazada?',
    options: [
      'Una tarjeta con la etiqueta NULL',
      'Un nodo vacío sin ninguna etiqueta',
      'Vuelve a apuntar al head, como una lista circular',
      'No dibuja nada después del último nodo',
    ],
    correctIndex: 0,
    explanation: 'La tarjeta NULL hace visible que el último nodo no apunta a ningún otro — el mismo concepto que self.head = None al inicio.',
  },
  {
    id: 66,
    category: 'Listas Enlazadas',
    title: '¿Cuál de estas operaciones de Lista Enlazada tiene complejidad O(1), igual que push() en una pila?',
    options: [
      'insertar_al_inicio(valor)',
      'buscar(valor)',
      'insertar_al_final(valor), sin un puntero tail guardado',
      'recorrer() toda la lista',
    ],
    correctIndex: 0,
    explanation: 'Insertar al inicio nunca recorre la lista: solo crea el nodo, lo enlaza al head actual y reasigna head — tres pasos de tiempo constante.',
  },

  // ---------------------------------------------------------------------------
  // Tablas Hash — ampliación (8 preguntas más, total 10)
  // ---------------------------------------------------------------------------
  {
    id: 67,
    category: 'Tablas Hash',
    title: "La tabla del simulador tiene tamaño 7 y hash(clave) = suma de códigos ASCII % 7. La clave 'cat' suma 99+97+116 = 312. ¿En qué cubeta cae?",
    options: ['Cubeta 4 (312 % 7 = 4)', 'Cubeta 0', 'Cubeta 6', 'Cubeta 2'],
    correctIndex: 0,
    explanation: '312 dividido entre 7 da 44 con residuo 4, así que 312 % 7 = 4.',
  },
  {
    id: 68,
    category: 'Tablas Hash',
    title: '¿Qué par de claves precargadas en el simulador colisionan en la misma cubeta, y por qué?',
    options: [
      "'cat' y 'act', porque son anagramas y la suma de sus códigos ASCII es idéntica",
      "'cat' y 'dog', porque empiezan con la misma letra",
      'Ninguna colisiona en la configuración inicial',
      "'act' y 'dog', por tener la misma longitud",
    ],
    correctIndex: 0,
    explanation: "'cat' y 'act' tienen las mismas letras en distinto orden; como la suma de códigos ASCII no depende del orden, ambas producen el mismo índice (colisión).",
  },
  {
    id: 69,
    category: 'Tablas Hash',
    title: "La clave 'dog' suma 100+111+103 = 314. ¿En qué cubeta queda precargada?",
    options: ['Cubeta 6 (314 % 7 = 6)', "Cubeta 4, la misma que 'cat'", 'Cubeta 0', 'Cubeta 7 (fuera de rango)'],
    correctIndex: 0,
    explanation: '314 dividido entre 7 da 44 con residuo 6, así que 314 % 7 = 6 — una cubeta distinta a la de "cat"/"act".',
  },
  {
    id: 70,
    category: 'Tablas Hash',
    title: 'Según insertar(clave, valor) en el simulador, si la clave YA existe en su cubeta, ¿qué hace el método?',
    options: [
      'Recorre la cubeta, encuentra la clave y SOBRESCRIBE su valor en el mismo lugar',
      'Agrega un duplicado al final de la cubeta',
      'Lanza un error y detiene la inserción',
      'Elimina la clave anterior sin agregar la nueva',
    ],
    correctIndex: 0,
    explanation: 'El código recorre la cubeta comparando k == clave; si la encuentra, reemplaza el par (clave, valor) en esa posición y retorna, sin duplicar.',
  },
  {
    id: 71,
    category: 'Tablas Hash',
    title: "Al buscar('act'), el simulador revisa la cubeta 4, que contiene tanto 'cat' como 'act'. ¿Cómo distingue cuál es cuál?",
    options: [
      'Compara clave por clave dentro de la lista de la cubeta hasta encontrar una coincidencia EXACTA (k == clave)',
      'Usa el valor, no la clave, para decidir',
      'Asume que la primera de la lista siempre es la correcta',
      'No puede distinguirlas: siempre da error',
    ],
    correctIndex: 0,
    explanation: 'buscar() recorre la cubeta comparando cada k contra la clave buscada; aunque compartan cubeta, solo una coincide exactamente con "act".',
  },
  {
    id: 72,
    category: 'Tablas Hash',
    title: '¿Qué estrategia de resolución de colisiones usa la Tabla Hash del simulador?',
    options: [
      'Encadenamiento (chaining): cada cubeta guarda una lista de pares clave-valor',
      'Direccionamiento abierto (open addressing)',
      'Doble hashing',
      'No resuelve colisiones: siempre sobrescribe',
    ],
    correctIndex: 0,
    explanation: 'self.cubetas = [[] for _ in range(tamano)]: cada cubeta es una lista que puede guardar varios pares si colisionan, en vez de buscar otra posición libre.',
  },
  {
    id: 73,
    category: 'Tablas Hash',
    title: 'En el peor caso, si TODAS las claves colisionaran en la misma cubeta, ¿cuál sería la complejidad de buscar(clave)?',
    options: [
      'O(n), porque degenera en recorrer una lista completa',
      'O(1), sin importar cuántas colisiones haya',
      'O(log n)',
      'O(n²)',
    ],
    correctIndex: 0,
    explanation: 'Con encadenamiento, si todo cae en una sola cubeta, buscar una clave equivale a recorrer esa lista entera comparando una por una — el mismo costo que una lista enlazada.',
  },
  {
    id: 74,
    category: 'Tablas Hash',
    title: "¿Por qué 'cat' y 'act' producen el mismo valor con la función hash del simulador, aunque son palabras distintas?",
    options: [
      'Porque tienen exactamente las mismas letras, solo en distinto orden — la suma de códigos ASCII no depende del orden',
      'Porque la tabla hash las trata como la misma variable de Python',
      'Es un error del simulador que debería corregirse',
      'Porque ambas tienen 3 letras, sin importar cuáles',
    ],
    correctIndex: 0,
    explanation: 'sum(ord(c) for c in clave) suma los códigos de cada letra sin importar su posición, así que dos anagramas siempre producen la misma suma.',
  },

  // ---------------------------------------------------------------------------
  // Árboles Binarios — ampliación (8 preguntas más, total 10)
  // ---------------------------------------------------------------------------
  {
    id: 75,
    category: 'Árboles Binarios',
    title: 'El simulador precarga un BST insertando, en este orden: 8, 3, 10, 1, 6, 14, 4. ¿Qué valor queda como RAÍZ?',
    options: ['8', '3', '1', '14'],
    correctIndex: 0,
    explanation: 'El primer valor insertado en un BST vacío siempre se convierte en la raíz; los siguientes se acomodan a su izquierda o derecha según sean menores o mayores.',
  },
  {
    id: 76,
    category: 'Árboles Binarios',
    title: 'En el árbol precargado (8, 3, 10, 1, 6, 14, 4), ¿dónde queda ubicado el valor 4?',
    options: [
      'Como hijo izquierdo de 6',
      'Como hijo derecho de 6',
      'Como hijo izquierdo de 3',
      'Como la raíz del árbol',
    ],
    correctIndex: 0,
    explanation: 'Traza: 4 < 8 → va a la izquierda (3); 4 ≥ 3 → va a la derecha (6); 4 < 6 → va a la izquierda de 6, que estaba libre.',
  },
  {
    id: 77,
    category: 'Árboles Binarios',
    title: '¿Cuál es el recorrido PREORDER (raíz, izquierda, derecha) del árbol precargado del simulador?',
    options: [
      '8, 3, 1, 6, 4, 10, 14',
      '1, 3, 4, 6, 8, 10, 14',
      '1, 4, 6, 3, 14, 10, 8',
      '14, 10, 8, 6, 4, 3, 1',
    ],
    correctIndex: 0,
    explanation: 'Preorder visita primero la raíz (8), luego todo el subárbol izquierdo (3, 1, 6, 4) y por último el derecho (10, 14).',
  },
  {
    id: 78,
    category: 'Árboles Binarios',
    title: '¿Cuál es el recorrido POSTORDER (izquierda, derecha, raíz) del árbol precargado del simulador?',
    options: [
      '1, 4, 6, 3, 14, 10, 8',
      '8, 3, 1, 6, 4, 10, 14',
      '1, 3, 4, 6, 8, 10, 14',
      '8, 10, 14, 3, 6, 4, 1',
    ],
    correctIndex: 0,
    explanation: 'Postorder visita ambos subárboles antes que la raíz: primero el izquierdo completo (1, 4, 6, 3), luego el derecho (14, 10), y la raíz (8) al final.',
  },
  {
    id: 79,
    category: 'Árboles Binarios',
    title: 'Buscas el valor 4 en el árbol precargado (8, 3, 10, 1, 6, 14, 4) empezando desde la raíz. ¿Qué camino de nodos visita el algoritmo?',
    options: ['8 → 3 → 6 → 4', '8 → 10 → 14', '8 → 3 → 1', '8 → 6 → 4'],
    correctIndex: 0,
    explanation: 'En 8: 4<8, va a la izquierda (3). En 3: 4≥3, va a la derecha (6). En 6: 4<6, va a la izquierda (4). Lo encuentra.',
  },
  {
    id: 80,
    category: 'Árboles Binarios',
    title: 'Si insertas el valor 7 en el árbol precargado (8, 3, 10, 1, 6, 14, 4), ¿dónde queda ubicado?',
    options: [
      'Como hijo derecho de 6',
      'Como hijo izquierdo de 6',
      'Como hijo izquierdo de 8',
      'Como hijo derecho de 10',
    ],
    correctIndex: 0,
    explanation: 'Traza: 7 < 8 → izquierda (3); 7 ≥ 3 → derecha (6); 7 ≥ 6 → derecha de 6, que estaba libre (6 solo tenía hijo izquierdo, el 4).',
  },
  {
    id: 81,
    category: 'Árboles Binarios',
    title: '¿Por qué en un BST el recorrido INORDER siempre da los valores de menor a mayor?',
    options: [
      'Porque visita primero todo el subárbol izquierdo (valores menores), luego la raíz, luego el subárbol derecho (valores mayores)',
      'Es una coincidencia, no una regla general',
      'Porque los valores se ordenan antes de insertarse en el árbol',
      'Porque siempre empieza por el valor más grande',
    ],
    correctIndex: 0,
    explanation: 'La propiedad de orden del BST (izquierda < nodo ≤ derecha) combinada con el orden Inorder garantiza una salida ascendente.',
  },
  {
    id: 82,
    category: 'Árboles Binarios',
    title: 'En el árbol precargado del simulador, ¿cuál es su ALTURA (profundidad máxima, contando la raíz como profundidad 0)?',
    options: ['3 (camino 8 → 3 → 6 → 4)', '1', '7, una por cada nodo', '2'],
    correctIndex: 0,
    explanation: 'El nodo más profundo es el 4, a 3 niveles de la raíz (8 → 3 → 6 → 4), así que la altura del árbol es 3.',
  },

  // ---------------------------------------------------------------------------
  // Grafos — ampliación (8 preguntas más, total 10)
  // ---------------------------------------------------------------------------
  {
    id: 83,
    category: 'Grafos',
    title: 'Con el grafo fijo del simulador (aristas A-B, A-C, B-D, C-D, C-E, D-F, E-F), empezando BFS desde A, ¿cuál es el orden de visita?',
    options: [
      'A, B, C, D, E, F',
      'A, C, E, F, D, B',
      'A, B, D, C, E, F',
      'A, C, B, D, E, F',
    ],
    correctIndex: 0,
    explanation: 'BFS visita A, agrega sus vecinos B y C a la cola, los visita en ese orden, y así sucesivamente nivel por nivel: A, B, C, D, E, F.',
  },
  {
    id: 84,
    category: 'Grafos',
    title: 'Con el mismo grafo, empezando DFS desde A, ¿cuál es el orden de visita que produce el simulador?',
    options: [
      'A, C, E, F, D, B',
      'A, B, C, D, E, F',
      'A, B, D, F, E, C',
      'A, C, D, B, E, F',
    ],
    correctIndex: 0,
    explanation: 'DFS apila los vecinos de A (B y C) y saca primero el último agregado (C), profundizando por esa rama antes de retroceder: A, C, E, F, D, B.',
  },
  {
    id: 85,
    category: 'Grafos',
    title: "¿Cuántos vecinos directos tiene el nodo C en el grafo del simulador (lista de adyacencia C: ['A', 'D', 'E'])?",
    options: ['3 (A, D y E)', '2', '4', '1'],
    correctIndex: 0,
    explanation: 'La lista de adyacencia de C tiene exactamente tres elementos: A, D y E.',
  },
  {
    id: 86,
    category: 'Grafos',
    title: 'BFS recorre el grafo usando una estructura de datos que ya conoces de otro módulo. ¿Cuál es?',
    options: [
      'Una Cola (FIFO): los vecinos se agregan al final y se visitan en el orden en que entraron',
      'Una Pila (LIFO)',
      'Una Tabla Hash',
      'Un Árbol Binario',
    ],
    correctIndex: 0,
    explanation: 'El código de BFS usa cola.pop(0) para sacar del frente, igual que dequeue() en el simulador de Colas.',
  },
  {
    id: 87,
    category: 'Grafos',
    title: 'DFS recorre el grafo usando una estructura de datos equivalente a otro módulo. ¿Cuál es?',
    options: [
      'Una Pila (LIFO), o recursión que usa el Call Stack',
      'Una Cola (FIFO)',
      'Una Tabla Hash',
      'Un heap de prioridad',
    ],
    correctIndex: 0,
    explanation: 'El código de DFS usa pila.pop() para sacar el último agregado, igual que pop() en el simulador de Pilas.',
  },
  {
    id: 88,
    category: 'Grafos',
    title: "En el grafo del simulador, ¿de qué nodos es vecino directo F (lista de adyacencia F: ['D', 'E'])?",
    options: ['D y E', 'A y B', 'De todos los nodos del grafo', 'Solo de C'],
    correctIndex: 0,
    explanation: 'La lista de adyacencia de F solo contiene D y E.',
  },
  {
    id: 89,
    category: 'Grafos',
    title: '¿Por qué BFS visita primero A, luego TODOS sus vecinos directos (B y C), antes de pasar a los vecinos de B o C?',
    options: [
      'Porque BFS explora nivel por nivel: agota la cola del nivel actual antes de agregar el siguiente',
      'Porque B y C van antes alfabéticamente que D',
      'El orden es aleatorio en cada ejecución',
      'Porque DFS y BFS producen siempre el mismo resultado',
    ],
    correctIndex: 0,
    explanation: 'Al usar una cola FIFO, todos los vecinos de un nivel se agregan y visitan antes que los del siguiente nivel, lo que produce la exploración "en anillos" característica de BFS.',
  },
  {
    id: 90,
    category: 'Grafos',
    title: '¿Cómo está representado el grafo fijo del simulador en el código Python mostrado?',
    options: [
      "Como un diccionario de listas de adyacencia: grafo = {'A': ['B', 'C'], ...}",
      'Como una matriz de adyacencia de N x N',
      'Como una lista enlazada de nodos',
      'Como una tabla hash sin estructura de vecinos',
    ],
    correctIndex: 0,
    explanation: 'GRAPH_CODE muestra exactamente esa estructura: cada letra de nodo es una clave cuyo valor es la lista de sus vecinos directos.',
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
