import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Alert } from '@/design-system/components/Alert';
import { Button } from '@/design-system/components/Button';
import { Card } from '@/design-system/components/Card';
import { FormField } from '@/design-system/components/FormField';
import { Input } from '@/design-system/components/Input';
import { PasswordInput } from '@/design-system/components/PasswordInput';
import { demoIdentity } from '@/shared/demo/demo';

/**
 * Écran de connexion — récit UI 01 : PRÉSENTATIONNEL uniquement.
 * Aucun appel backend : « Se connecter » ouvre simplement le shell sur le
 * contexte Organisation de démonstration. La vraie connexion (POST
 * /api/v1/auth/login, session, claims) arrive au récit UI 02.
 */
export function LoginScreen() {
  const navigate = useNavigate();

  const enterShell = (event: React.FormEvent) => {
    event.preventDefault();
    navigate('/app/dashboard');
  };

  return (
    <div className="w-full max-w-md">
      <Card className="px-6 py-8 sm:px-10 sm:py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-text">Bienvenue dans TAKIBO</h1>
          <p className="mt-2 text-sm text-text-muted">
            Accédez à votre espace d’administration sécurisé.
          </p>
        </header>

        <Alert variant="info" className="mb-6">
          Aperçu de démonstration — la connexion réelle sera branchée au récit UI 02. « Se connecter
          » ouvre le shell sur l’organisation de démonstration.
        </Alert>

        <form onSubmit={enterShell} className="flex flex-col gap-1" noValidate>
          <FormField fieldId="orgCode" label="Organisation">
            <Input
              id="orgCode"
              type="text"
              autoComplete="organization"
              defaultValue={demoIdentity.organization.code}
              placeholder="Exemple : takibo"
            />
          </FormField>
          <FormField fieldId="email" label="Adresse courriel">
            <Input
              id="email"
              type="email"
              autoComplete="email"
              defaultValue={demoIdentity.user.email}
              placeholder="prenom.nom@organisation.com"
            />
          </FormField>
          <FormField fieldId="password" label="Mot de passe">
            <PasswordInput id="password" defaultValue="demonstration" placeholder="••••••••••••" />
          </FormField>

          <Button type="submit" className="mt-2 w-full">
            Se connecter
          </Button>

          <p className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
            Connexion protégée. Vos identifiants ne sont jamais conservés par ce navigateur.
          </p>
        </form>
      </Card>
    </div>
  );
}
