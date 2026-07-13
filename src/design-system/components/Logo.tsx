import { cn } from '@/shared/utilities/cn';

interface LogoProps {
  /** Hauteur du logo en pixels. */
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/**
 * Logo TAKIBO fourni sous forme d'image de marque.
 * L'image contient deja le wordmark, donc withWordmark est conserve
 * seulement pour compatibilite avec les appels existants.
 */
export function Logo({ size = 40, className }: LogoProps) {
  const width = Math.round(size * 3.42);

  return (
    <span className={cn('inline-flex items-center', className)}>
      <img
        src="/takibo-logo.png"
        alt="TAKIBO"
        width={width}
        height={size}
        className="block shrink-0 object-cover object-center"
        style={{ width, height: size }}
      />
    </span>
  );
}
