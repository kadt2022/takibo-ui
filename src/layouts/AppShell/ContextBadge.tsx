import { Building2 } from 'lucide-react';

import { cn } from '@/shared/utilities/cn';

interface ContextBadgeProps {
  scope: 'ORGANIZATION' | 'SPACE';
  className?: string;
}

/**
 * Rend la frontière visible : le badge dit toujours dans quelle portée on agit.
 * Un token ORGANIZATION ne doit jamais laisser croire qu'on est situé dans un
 * space — ce badge est le garde-fou visuel de cette loi.
 */
export function ContextBadge({ scope, className }: ContextBadgeProps) {
  const label = scope === 'ORGANIZATION' ? 'Organisation' : 'Space';
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2.5 rounded-full border border-border bg-surface px-3 py-1.5',
        className,
      )}
    >
      <Building2 className="size-4 text-primary" aria-hidden="true" />
      <span className="flex flex-col leading-none">
        <span className="text-[10px] uppercase tracking-wider text-text-muted">
          Contexte actuel
        </span>
        <span className="mt-0.5 text-xs font-semibold text-text">{label}</span>
      </span>
    </div>
  );
}
