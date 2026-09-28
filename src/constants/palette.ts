export interface SwatchStyle {
  bg: string;
  text: string;
  border: string;
  shadow: string;
}

/**
 * Paleta compartida de "discos/nodos" — mismos colores que usa Torres de Hanói,
 * para que Pilas, Listas Enlazadas y futuros módulos se sientan visualmente
 * como parte de la misma familia (y no cajas grises de depurador).
 */
export const VISUAL_PALETTE: SwatchStyle[] = [
  { bg: 'bg-[#4cd7f6]', text: 'text-[#003640]', border: 'border-[#acedff]', shadow: 'shadow-[0_0_14px_rgba(76,215,246,0.5)]' },
  { bg: 'bg-[#a078ff]', text: 'text-[#340080]', border: 'border-[#d0bcff]', shadow: 'shadow-[0_0_14px_rgba(160,120,255,0.4)]' },
  { bg: 'bg-[#d0bcff]', text: 'text-[#3c0091]', border: 'border-[#e9ddff]', shadow: 'shadow-[0_0_14px_rgba(208,188,255,0.4)]' },
  { bg: 'bg-[#ffb95f]', text: 'text-[#472a00]', border: 'border-[#ffddb8]', shadow: 'shadow-[0_0_14px_rgba(255,185,95,0.4)]' },
  { bg: 'bg-[#ca8100]', text: 'text-[#fff8f0]', border: 'border-[#ffb95f]', shadow: 'shadow-[0_0_14px_rgba(202,129,0,0.4)]' },
  { bg: 'bg-[#03b5d3]', text: 'text-[#001f26]', border: 'border-[#4cd7f6]', shadow: 'shadow-[0_0_14px_rgba(3,181,211,0.5)]' },
];

export const getSwatch = (index: number): SwatchStyle => VISUAL_PALETTE[index % VISUAL_PALETTE.length];
