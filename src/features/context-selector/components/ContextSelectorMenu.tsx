import { Info, RotateCcw, ShieldAlert } from 'lucide-react';
import type { RefObject } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';

import { OrganizationContextOption } from '@/features/context-selector/components/OrganizationContextOption';
import { SpaceContextOption } from '@/features/context-selector/components/SpaceContextOption';
import type { SpaceSelectionState } from '@/features/context-selector/model/context';
import type { AccessibleSpace } from '@/features/spaces/model/space';
import { Spinner } from '@/design-system/components/Spinner';
import { ApiForbiddenError } from '@/shared/api/http';

interface ContextSelectorMenuProps {
  orgCode: string;
  organizationActive: boolean;
  spaces: UseQueryResult<AccessibleSpace[]>;
  spaceSelection: SpaceSelectionState;
  onSelectOrganization: () => void;
  onSelectSpace: (spaceId: string) => void;
  menuRef: RefObject<HTMLDivElement | null>;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-2.5 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
      {children}
    </p>
  );
}

/**
 * Panneau du sélecteur de contexte. Les Spaces viennent exclusivement de
 * GET /api/v1/me/spaces ; chaque état du contrat a sa surface : chargement,
 * liste vide, frontière (403), erreur technique avec réessai.
 */
export function ContextSelectorMenu({
  orgCode,
  organizationActive,
  spaces,
  spaceSelection,
  onSelectOrganization,
  onSelectSpace,
  menuRef,
}: ContextSelectorMenuProps) {
  const forbidden = spaces.isError && spaces.error instanceof ApiForbiddenError;
  const items = spaces.data ?? [];

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Changer de contexte"
      tabIndex={-1}
      className="absolute left-0 right-0 top-full z-50 mt-2 min-w-64 rounded-lg border border-border bg-surface-elevated p-1.5 shadow-card"
    >
      <SectionLabel>Changer de contexte</SectionLabel>
      <OrganizationContextOption
        orgCode={orgCode}
        active={organizationActive}
        onSelect={onSelectOrganization}
      />

      <SectionLabel>Mes Spaces</SectionLabel>
      {spaces.isPending ? (
        <div className="flex items-center gap-2 px-2.5 py-2 text-xs text-text-muted">
          <Spinner className="size-3.5" />
          Chargement des Spaces…
        </div>
      ) : forbidden ? (
        <div className="flex items-start gap-2 px-2.5 py-2 text-xs text-text-muted">
          <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>Accès aux Spaces indisponible pour ce contexte.</span>
        </div>
      ) : spaces.isError ? (
        <div className="flex flex-col gap-1.5 px-2.5 py-2">
          <p className="text-xs text-text-muted">Impossible de charger vos Spaces.</p>
          <button
            type="button"
            onClick={() => void spaces.refetch()}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-text transition-colors duration-150 hover:border-primary/50 hover:bg-primary/5"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            Réessayer
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="px-2.5 py-2 text-xs text-text-muted">
          Votre compte n’a de profil dans aucun Space.
        </p>
      ) : (
        items.map((space) => (
          <SpaceContextOption key={space.spaceId} space={space} onSelect={onSelectSpace} />
        ))
      )}

      {spaceSelection.status === 'unsupported' && (
        <p className="mx-1 mt-1.5 flex items-start gap-2 rounded-md border border-border bg-background/40 px-2.5 py-2 text-xs text-text-muted">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>
            L’ouverture sécurisée du Space sera disponible avec l’établissement du contexte Space.
          </span>
        </p>
      )}
    </div>
  );
}
