import { Card } from '@/design-system/components/Card';
import { SpaceStatusPill } from '@/features/organization/components/SpaceStatusPill';
import { demoAccessibleSpaces } from '@/shared/demo/demo';

/**
 * « Mes Spaces accessibles » (récit UI 01 — présentation de démonstration).
 * Reflète le futur contrat de GET /api/v1/me/spaces (récit UI 03) : les espaces
 * d'appartenance du compte, avec leur statut et le drapeau `selectable`.
 * L'ouverture réelle d'un contexte de space arrive au récit UI 05 (IAM 33).
 */
export function MySpacesPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold text-text">Mes Spaces</h1>
        <p className="mt-1 text-sm text-text-muted">
          Les espaces auxquels votre compte appartient dans cette organisation.
        </p>
      </header>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                <th className="px-5 py-3 font-medium">Space</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Mon statut</th>
                <th className="px-5 py-3 text-right font-medium">Accès</th>
              </tr>
            </thead>
            <tbody>
              {demoAccessibleSpaces.map((space) => (
                <tr key={space.id} className="border-b border-border last:border-none">
                  <td className="px-5 py-3.5">
                    <span className="block font-medium text-text">{space.name}</span>
                    <span className="block text-xs text-text-muted">
                      {space.code}.{/* domaine de démonstration */}
                      {'acme.com'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <SpaceStatusPill status={space.status} />
                  </td>
                  <td className="px-5 py-3.5 text-text-muted">
                    {space.membershipStatus === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {space.selectable ? (
                      <button
                        type="button"
                        disabled
                        className="rounded-md border border-primary/40 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent"
                        title="L'ouverture d'un contexte de space arrive au récit UI 05 (IAM 33)."
                      >
                        Ouvrir
                      </button>
                    ) : (
                      <span className="text-xs text-text-muted">Indisponible</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-text-muted">
        L’ouverture d’un space établit un <strong className="text-text">contexte situé</strong>{' '}
        (jeton de space) — cette étape arrivera au récit UI 05, après l’échange ORG → SPACE (IAM
        33).
      </p>
    </div>
  );
}
