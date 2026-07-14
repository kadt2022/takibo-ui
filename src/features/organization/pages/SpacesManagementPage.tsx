import { Plus } from 'lucide-react';

import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { SpaceStatusPill } from '@/features/organization/components/SpaceStatusPill';
import { demoOrganizationSpaces } from '@/shared/demo/demo';

/**
 * « Gestion des Spaces » (récit UI 01 — présentation de démonstration).
 * Vue catalogue de l'organisation, réservée à l'autorité d'organisation.
 * Reflète le futur GET /api/v1/orgs/{orgId}/spaces (récit ultérieur) :
 * tous les spaces de l'org, indépendamment de l'appartenance du compte.
 */
export function SpacesManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text">Gestion des Spaces</h1>
          <p className="mt-1 text-sm text-text-muted">
            Tous les espaces de l’organisation — vue réservée à l’autorité d’organisation.
          </p>
        </div>
        <Button disabled title="La création réelle sera branchée dans un récit ultérieur.">
          <Plus className="size-4" aria-hidden="true" />
          Créer un Space
        </Button>
      </header>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-5 py-3 font-medium">Space</th>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 text-right font-medium">Utilisateurs</th>
              </tr>
            </thead>
            <tbody>
              {demoOrganizationSpaces.map((space) => (
                <tr key={space.id} className="border-b border-border last:border-none">
                  <td className="px-5 py-3.5 font-medium text-text">{space.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-text-muted">{space.code}</td>
                  <td className="px-5 py-3.5">
                    <SpaceStatusPill status={space.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-text-muted">
                    {space.users}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-text-muted">
        Données de démonstration. Le nombre d’utilisateurs par space et la création réelle seront
        branchés lorsque leurs surfaces backend seront disponibles.
      </p>
    </div>
  );
}
