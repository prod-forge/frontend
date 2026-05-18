import type { ReactNode } from 'react';

export interface Props {
  readonly children?: ReactNode;
  readonly progress: number;
  readonly size?: Size;
}

interface Config {
  px: number;
  stroke: number;
}

type Size = 'lg' | 'md' | 'sm';

const CONFIGS: Record<Size, Config> = {
  lg: { px: 40, stroke: 3 },
  md: { px: 32, stroke: 2.5 },
  sm: { px: 24, stroke: 2 },
};

export const CircularProgress = ({ children, progress, size = 'md' }: Props): ReactNode => {
  const { px, stroke } = CONFIGS[size];
  const center = px / 2;
  const r = (px - stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, progress));
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ height: px, width: px }}>
      <svg aria-hidden fill="none" height={px} viewBox={`0 0 ${px} ${px}`} width={px}>
        <circle cx={center} cy={center} r={r} stroke="currentColor" strokeOpacity={0.25} strokeWidth={stroke} />
        <circle
          cx={center}
          cy={center}
          r={r}
          stroke="currentColor"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          strokeWidth={stroke}
          style={{ transition: 'stroke-dashoffset 40ms linear' }}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs leading-none">
        {children ?? Math.round(clamped)}
      </div>
    </div>
  );
};

CircularProgress.displayName = 'CircularProgress';
