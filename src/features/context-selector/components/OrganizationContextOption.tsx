import { Building2, Check } from 'lucide-react';

import { cn } from '@/shared/utilities/cn';

interface OrganizationContextOptionProps {
  orgCode: string;
  /** Le contexte Organisation est-il le contexte actif ? (toujours vrai en UI 06A) */
  active: boolean;
  onSelect: () => void;
}

/** L'option Organisation — toujours proposée, seule réellement active en UI 06A. */
export function OrganizationContextOption({
  orgCode,
  active,
  onSelect,
}: OrganizationContextOptionProps) {
  return (
    <button
      type="button"
      role="menuitem"
      aria-current={active ? 'true' : undefined}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm',
        'transition-colors duration-150 hover:bg-background/60',
        'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary',
        active ? 'text-text' : 'text-text-muted',
      )}
    >
      <Check
        className={cn('size-4 shrink-0 text-primary', !active && 'invisible')}
        aria-hidden="true"
      />
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/12 text-primary">
        <Building2 className="size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-medium">Organisation</span>
        <span className="block truncate text-xs text-text-muted">{orgCode}</span>
      </span>
    </button>
  );
}
