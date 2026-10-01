---
tags: [bitacora-de-algoritmos, proyecto, educacion]
creado: 2026-09-28
actualizado: 2026-10-01
---

# Bitácora de Algoritmos — Notas de Desarrollo

> Nota: el proyecto se llamaba antes "StackLab"; se renombró a **Bitácora de Algoritmos** el 2026-09-30.

Plataforma educativa para enseñar algoritmos y estructuras de datos, construida con **React + TypeScript + Tailwind v4 (Vite)**. Sin backend, 100% cliente.

Repositorio: `C:\xampp\htdocs\simulador`

## Temario (7 unidades) — ¡completo!

1. Fundamentos de Algoritmos y Tipos de Datos Abstractos — ✅ hecho
2. Listas Enlazadas — ✅ hecho
3. Pilas y Colas — ✅ hecho (pantallas separadas)
4. Tablas Hash (Hashing) — ✅ hecho
5. Árboles Binarios — ✅ hecho
6. Recorridos de Árboles y Grafos Básicos — ✅ integrado dentro de los módulos de Árboles (5, recorridos inorder/preorder/postorder) y Grafos (7, BFS/DFS), no como módulo aparte
7. Grafos: Representación y Recorridos — ✅ hecho

Solo queda pendiente **Complejidad de Algoritmos / Ordenamientos**, que no era parte del temario original de 7 unidades pero quedó como extra sugerido.

## Idea pedagógica central

Cada módulo combina tres cosas, siempre visibles juntas:

1. **Simulador visual interactivo** — a la izquierda.
2. **Código Python real sincronizado**, con la línea activa resaltada y una frase en español arriba explicando qué está pasando *ahora mismo* (ej: `push(dato) → self.elementos.append("42")`) — a la derecha.
3. **Teoría / concepto** — abajo, en tarjetas cortas (qué es, complejidad Big-O, comparación con otras estructuras).

Diseño deliberadamente limpio: sin badges ni cajas decorativas de más — la idea es que se vea como material de clase, no como un panel de depurador.

## Estado actual (2026-09-30)

- [x] App reparada (faltaba `main.tsx`, dependencias y plugins de Vite/Tailwind).
- [x] Pantalla de Inicio con tarjetas por módulo, agrupadas por categoría y numeradas según el temario.
- [x] **Renombrado**: "StackLab" → **Bitácora de Algoritmos** (título, header, footer, `package.json`, `metadata.json`, `README.md`).
- [x] **Footer**: año dinámico (`new Date().getFullYear()`), ya no está hardcodeado a 2025; se quitaron los elementos decorativos muertos ("LIFO State: Ready", "Doc Recursiva").
- [x] **Pilas** y **Colas** — divididas en dos pantallas independientes (antes compartían una sola). Cada una: simulador con discos/fichas de colores + código Python real (`class Pila`, `class Cola`) sincronizado + un juego embebido abajo + teoría al final (repaso).
  - **Pilas** trae Torres de Hanói embebida debajo del simulador push/pop/peek (ya no es un módulo aparte).
  - **Colas** trae un juego nuevo, **Papa Caliente** (`HotPotatoGame.tsx`): rotar la cola N veces y el que queda al frente se elimina, hasta que queda un ganador.
  - Se quitó el botón "Exportar como HTML" (y los archivos que lo soportaban) a pedido del profesor.
  - Pop/Peek/Dequeue ya nunca se deshabilitan por estar vacío — siempre se ve el código de guardia ejecutarse (ver más abajo).
- [x] **Torres de Hanói** — código Python real (antes era pseudocódigo), Call Stack visual, más limpio; ahora vive dentro de la pantalla de Pilas, no como módulo propio.
- [x] **Listas Enlazadas** — insertar/eliminar/buscar/recorrer con micro-pasos, control Paso/Reproducir/Pausar/Velocidad.
- [x] **Tablas Hash** (nuevo, `HashTableView.tsx`) — `class TablaHash` con encadenamiento (chaining); ejemplo pre-cargado con una colisión real ("cat" y "act" caen en la misma cubeta) para que se vea de inmediato qué es una colisión.
- [x] **Recursión & Call Stack** — header simplificado.
- [x] Rediseño "limpio" aplicado a toda la interfaz (menos badges, más foco en el código, teoría siempre al final), verificado responsive en 375px (mobile) sin overflow horizontal.
- [x] **Consistencia de términos**: el nombre de ejemplo (seed) y el nombre que se autogenera al agregar sin escribir valor ahora usan la MISMA palabra en cada módulo — Pilas usa "Token_N" en ambos casos (antes el fallback decía "Elem_N"), Colas usa "Cliente_N" en ambos (antes decía "Turno_N").
- [x] **Desafíos (quiz) ampliado a los 8 temas**: 15 preguntas en total — Fundamentos (2), Pilas (1), Colas (1), Torres de Hanói (1), Recursión (2), Listas Enlazadas (2), Tablas Hash (2), Árboles Binarios (2), Grafos (2).
- [x] **Fundamentos de Algoritmos y TDA** (nuevo, `FundamentosView.tsx`) — características de un algoritmo, qué es un TDA (con Pila como ejemplo concreto), y un explorador interactivo de Big-O (slider de n, barras en escala log, código de ejemplo por clase de complejidad ligado a otros módulos: O(1)=push, O(n)=buscar en lista enlazada, O(2ⁿ)=Torres de Hanói).
- [x] **Árboles Binarios** (nuevo, `ArbolesView.tsx`) — BST inmutable renderizado en SVG, insertar/buscar/recorridos (inorder/preorder/postorder), semilla con 7 valores.
- [x] **Grafos** (nuevo, `GrafosView.tsx`) — grafo fijo de 6 nodos, BFS (usa arreglo como cola) y DFS (usa arreglo como pila) — el texto de log conecta explícitamente con Colas y Pilas.
- [ ] **Complejidad de Algoritmos / Ordenamientos** — pendiente (no es parte del temario de 7 unidades, quedó como extra). Se construirá como visualizador de Burbuja/Selección/Inserción con contador de comparaciones e intercambios (mismo patrón que Listas Enlazadas).

## Estado actual (2026-10-01)

- [x] **Tarjetas rediseñadas para que motiven, no solo informen** (nuevo componente `TopicCard.tsx`): fondo con degradado, ícono grande con glow, y un llamado a la acción visible ("Simular ahora →" / "Depurar ahora →" / "Evaluarme ahora →") en vez de solo una flechita. Usa el mismo vocabulario de 3 colores que `TheoryCards` (`primary`/`secondary`/`tertiary`) para que toda la app comparta el mismo sistema de temas. Aplicado tanto en Inicio como en Desafíos.
- [x] **Desafíos ahora es por tema, con tarjetas propias** (el profesor aclaró que no quería una sola lista larga de 15 preguntas, sino una tarjeta por tema y una evaluación independiente por cada una). Flujo: pantalla 1 = grid de 9 tarjetas (una por `QuizCategory`), cada una muestra cuántas preguntas tiene y, si ya se respondió, su puntaje (ej. "2/2"); al hacer clic entra a la evaluación de SOLO ese tema, con su propio puntaje, botón "Reiniciar" y botón "← Volver a los temas". El progreso de todos los temas se conserva en memoria mientras no se recargue la página (no hay backend ni localStorage).

## Decisiones importantes

- **El código Python de Pilas usa clases**, no funciones sueltas — a pedido explícito del profesor:
  ```python
  class Pila:
      def __init__(self):
          self.elementos = []

      def push(self, dato):
          self.elementos.append(dato)
          print(f"Apilaste: {dato}")

      def pop(self):
          if len(self.elementos) == 0:
              print("La pila está vacía, no hay nada que sacar")
              return None
          dato = self.elementos.pop()
          print(f"Desapilaste: {dato}")
          return dato
  ```
  Se agregó un método `peek()` en el mismo estilo (no estaba en el original) para que el botón "Peek" de la interfaz tenga a qué línea apuntar. La clase `Cola` se escribió igual, en espejo (`enqueue`/`dequeue`/`peek`), para mantener consistencia visual entre ambos paneles.

- **Patrón de "motor de pasos"**: cada operación (insertar, buscar, etc.) se escribe como una función pura que devuelve un arreglo de "micro-pasos" (línea de código + qué dibujar + qué texto de log). El componente solo recorre ese arreglo con Play/Pause/Step — esto es lo que hace que Pausar/Reanudar/Paso a paso funcione igual en todos los módulos. Ver `LinkedListView.tsx` como plantilla de referencia para el próximo módulo (Árboles).

- **Paleta de colores compartida** (`src/constants/palette.ts`) — los discos de Pilas, los nodos de Listas Enlazadas, etc. usan los mismos colores que Torres de Hanói, para que se sientan parte de la misma familia visual.

- **Un módulo = un juego embebido, teoría solo al final**: el profesor pidió explícitamente NO mezclar Pilas y Colas en la misma pantalla, y que cada estructura tenga su propio "juego" de refuerzo debajo del simulador (Hanói para Pilas, Papa Caliente para Colas), con la teoría siempre al final de la página (no repartida). Si se agregan más juegos/módulos, seguir este mismo patrón: un solo bloque de `TheoryCards` al final por página, nunca uno por sub-sección.

- **Pop/Peek/Dequeue nunca se deshabilitan por estar vacío**: antes esos botones se apagaban cuando la pila/cola estaba vacía, así que el alumno nunca veía ejecutarse el `if len(self.elementos) == 0` del código. Ahora el botón sigue activo (solo se bloquea mientras hay una animación en curso) para que SIEMPRE haya seguimiento en pantalla: línea resaltada, caption y mensaje, incluso en el caso vacío. `PythonCodePanel` ahora acepta `tone="error"` para pintar ese caso en rojo (línea + caption) y distinguirlo de una operación exitosa. Aplicar el mismo criterio a cualquier módulo nuevo: si el código tiene una rama de guardia/error, el botón que la dispara no debería deshabilitarse solo porque "no habría nada que hacer" — esa rama ES lo que hay que mostrar.

- **`TopicCard` es el componente a reutilizar** para cualquier "elige uno de varios" (ya lo usan Inicio y Desafíos) — no copiar/pegar el markup de una tarjeta a mano otra vez. Toma un `theme: 'primary'|'secondary'|'tertiary'`, no colores sueltos, para que cualquier pantalla nueva encaje visualmente sin tener que inventar un color nuevo.

## Notas técnicas rápidas

- `npm run dev` levanta todo en `http://localhost:3000`.
- Si el servidor ya estaba corriendo y se cambia `vite.config.ts` o `package.json`, hay que reiniciarlo (Vite no recarga cambios de plugins en caliente).
- Instrucciones completas para trabajar en el código: ver [[CLAUDE.md]] en la raíz del proyecto (esa es la que usa Claude Code, pensada para otro desarrollador/IA — esta nota es más para el registro de decisiones y contexto pedagógico).

## Próximos pasos sugeridos

- [ ] Construir módulo de Ordenamientos/Complejidad (Burbuja/Selección/Inserción con contador de comparaciones e intercambios).
- [ ] Revisar si Recursión & Call Stack necesita el mismo nivel de rediseño que los demás.
- [ ] Considerar si Árboles/Grafos también deberían tener un "juego" embebido, como Pilas (Hanói) y Colas (Papa Caliente) — no se pidió explícitamente, se dejaron sin juego para poder cubrir los 3 módulos nuevos en una sola sesión.
- [ ] Cuando haya repo de GitHub, hacer `git push` (por ahora solo hay commits locales — el primer commit se hizo el 2026-09-28; hay cambios nuevos desde entonces sin commitear, esperando que el profesor lo pida explícitamente).
