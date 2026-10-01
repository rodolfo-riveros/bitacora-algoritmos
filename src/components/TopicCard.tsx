import React, { ReactNode } from 'react';
import { ArrowRight, Lock, LucideIcon } from 'lucide-react';

export type CardTheme = 'primary' | 'secondary' | 'tertiary';

interface ThemeStyle {
  cardBg: string;
  border: string;
  shadow: string;
  glowDot: string;
  iconBg: string;
  iconText: string;
  cta: string;
}

const THEME_STYLES: Record<CardTheme, ThemeStyle> = {
  primary: {
    cardBg: 'bg-gradient-to-br from-[#1c1730] to-[#0a0e18]',
    border: 'border-[#2a2440] hover:border-[#a078ff]/60',
    shadow: 'hover:shadow-[0_0_28px_rgba(160,120,255,0.22)]',
    glowDot: 'bg-[#a078ff]',
    iconBg: 'bg-gradient-to-br from-[#a078ff] to-[#d0bcff]',
    iconText: 'text-[#3c0091]',
    cta: 'text-[#d0bcff]',
  },
  secondary: {
    cardBg: 'bg-gradient-to-br from-[#0f2228] to-[#0a0e18]',
    border: 'border-[#1c3339] hover:border-[#4cd7f6]/60',
    shadow: 'hover:shadow-[0_0_28px_rgba(76,215,246,0.22)]',
    glowDot: 'bg-[#4cd7f6]',
    iconBg: 'bg-gradient-to-br from-[#03b5d3] to-[#4cd7f6]',
    iconText: 'text-[#003640]',
    cta: 'text-[#4cd7f6]',
  },
  tertiary: {
    cardBg: 'bg-gradient-to-br from-[#26190a] to-[#0a0e18]',
    border: 'border-[#3a2a15] hover:border-[#ffb95f]/60',
    shadow: 'hover:shadow-[0_0_28px_rgba(255,185,95,0.22)]',
    glowDot: 'bg-[#ffb95f]',
    iconBg: 'bg-gradient-to-br from-[#ca8100] to-[#ffb95f]',
    iconText: 'text-[#472a00]',
    cta: 'text-[#ffb95f]',
  },
};

interface TopicCardProps {
  icon: LucideIcon;
  theme: CardTheme;
  eyebrow?: string;
  title: string;
  description: string;
  cta?: string;
  disabled?: boolean;
  disabledLabel?: string;
  /** Rendered in the top-right corner when not disabled (e.g. a score badge). */
  trailing?: ReactNode;
  onClick?: () => void;
}

/** A bold, inviting card for a module/topic — used on Inicio and in Desafíos' topic picker. */
export const TopicCard: React.FC<TopicCardProps> = ({
  icon: Icon,
  theme,
  eyebrow,
  title,
  description,
  cta = 'Simular ahora',
  disabled,
  disabledLabel = 'Próximamente',
  trailing,
  onClick,
}) => {
  const style = THEME_STYLES[theme];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative text-left rounded-xl p-4 flex flex-col gap-3 border transition-all duration-200 overflow-hidden ${
        disabled
          ? 'bg-[#0a0e18] border-[#262a35] opacity-60 cursor-not-allowed'
          : `${style.cardBg} ${style.border} ${style.shadow} hover:-translate-y-1 cursor-pointer`
      }`}
    >
      {!disabled && (
        <div
          className={`absolute -top-8 -right-8 w-28 h-28 rounded-full blur-3xl opacity-20 ${style.glowDot} pointer-events-none`}
        />
      )}

      <div className="relative flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md ${
            disabled ? 'bg-[#1c1f2a] text-[#6b6678]' : `${style.iconBg} ${style.iconText}`
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        {disabled ? <Lock className="w-4 h-4 text-[#6b6678] mt-1" /> : trailing}
      </div>

      <div className="relative flex flex-col gap-1">
        {eyebrow && (
          <span
            className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
              disabled ? 'text-[#6b6678]' : 'text-[#958ea0]'
            }`}
          >
            {disabled ? disabledLabel : eyebrow}
          </span>
        )}
        <h3 className="text-base font-bold text-[#dfe2f1]">{title}</h3>
        <p className="text-xs text-[#cbc3d7] leading-relaxed">{description}</p>
      </div>

      {!disabled && (
        <div className={`relative mt-auto pt-1 flex items-center gap-1 text-xs font-semibold ${style.cta}`}>
          {cta}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      )}
    </button>
  );
};
