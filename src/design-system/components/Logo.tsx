import { cn } from '@/shared/utilities/cn';

interface LogoProps {
  /** Taille du sigle en pixels. */
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/**
 * Sigle TAKIBO : un foyer (braise) au centre de frontières concentriques
 * ouvertes — l'identité souveraine, entourée de frontières réelles mais
 * traversables par des accès situés.
 */
export function Logo({ size = 40, withWordmark = false, className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M 24 5 A 19 19 0 1 0 43 24"
          stroke="var(--tk-color-border)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 24 12 A 12 12 0 1 1 12 24"
          stroke="var(--tk-color-text-muted)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="24" cy="24" r="6" fill="var(--tk-color-primary)" />
      </svg>
      {withWordmark && (
        <span className="text-xl font-bold tracking-[0.35em] text-text">TAKIBO</span>
      )}
    </span>
  );
}
