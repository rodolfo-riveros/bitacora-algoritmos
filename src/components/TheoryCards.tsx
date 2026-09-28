import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface TheoryCard {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: ReactNode;
  footer?: ReactNode;
  accent?: 'primary' | 'secondary' | 'tertiary';
}

interface TheoryCardsProps {
  cards: TheoryCard[];
}

const ACCENT_STYLES: Record<NonNullable<TheoryCard['accent']>, { hover: string; icon: string; eyebrow: string; footer: string }> = {
  primary: {
    hover: 'hover:border-[#a078ff]/40',
    icon: 'text-[#d0bcff]',
    eyebrow: 'text-[#d0bcff]',
    footer: 'text-[#4cd7f6]',
  },
  secondary: {
    hover: 'hover:border-[#4cd7f6]/40',
    icon: 'text-[#4cd7f6]',
    eyebrow: 'text-[#4cd7f6]',
    footer: 'text-[#d0bcff]',
  },
  tertiary: {
    hover: 'hover:border-[#ffb95f]/40',
    icon: 'text-[#ffb95f]',
    eyebrow: 'text-[#ffb95f]',
    footer: 'text-[#ffb95f]',
  },
};

export const TheoryCards: React.FC<TheoryCardsProps> = ({ cards }) => {
  return (
    <section className="w-full py-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card, idx) => {
          const accent = ACCENT_STYLES[card.accent ?? 'primary'];
          const Icon = card.icon;

          return (
            <div
              key={idx}
              className={`bg-[#0a0e18] border border-[#262a35] rounded-xl p-4 shadow-md flex flex-col justify-between transition-all ${accent.hover}`}
            >
              <div className="flex flex-col gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#1c1f2a] flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${accent.icon}`} />
                </div>
                <span className={`font-mono text-[10px] uppercase tracking-wider font-semibold ${accent.eyebrow}`}>
                  {card.eyebrow}
                </span>
                <h2 className="text-base font-bold text-[#dfe2f1]">{card.title}</h2>
                <div className="text-xs text-[#cbc3d7] leading-relaxed">{card.body}</div>
              </div>
              {card.footer && (
                <div className={`mt-3 pt-2 border-t border-[#262a35] flex items-center gap-1 font-mono text-xs ${accent.footer}`}>
                  {card.footer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
