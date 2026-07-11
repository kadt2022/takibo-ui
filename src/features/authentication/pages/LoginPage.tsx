import { Card } from '@/design-system/components/Card';
import { LoginForm } from '@/features/authentication/components/LoginForm';

export function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <Card className="px-6 py-8 sm:px-10 sm:py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-text">Bienvenue dans TAKIBO</h1>
          <p className="mt-2 text-sm text-text-muted">
            Accédez à votre espace d’administration sécurisé.
          </p>
        </header>
        <LoginForm />
      </Card>
    </div>
  );
}
