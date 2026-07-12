import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { Alert } from '@/design-system/components/Alert';
import { Button } from '@/design-system/components/Button';
import { FormField } from '@/design-system/components/FormField';
import { Input } from '@/design-system/components/Input';
import { PasswordInput } from '@/design-system/components/PasswordInput';
import { LoginError } from '@/features/authentication/api/login-api';
import { useLogin } from '@/features/authentication/hooks/use-login';
import { loginSchema } from '@/features/authentication/schemas/login-schema';
import type { LoginFormValues } from '@/features/authentication/schemas/login-schema';
import { fieldErrorId } from '@/shared/utilities/field-error-id';
import { useSession } from '@/shared/security/session-context';

type Notice = { kind: 'info' | 'danger'; text: string };

export function LoginForm() {
  const login = useLogin();
  const navigate = useNavigate();
  const { openSession } = useSession();
  const [notice, setNotice] = useState<Notice | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', orgCode: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    if (login.isPending) {
      return;
    }
    setNotice(null);
    try {
      const session = await login.mutateAsync(values);
      openSession({
        ...session,
        orgCode: values.orgCode,
        email: values.email,
      });
      void navigate('/org');
    } catch (error) {
      setNotice({
        kind: 'danger',
        text:
          error instanceof LoginError
            ? error.message
            : 'Connexion impossible pour le moment. Veuillez réessayer.',
      });
    }
  });

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="flex flex-col gap-1">
      {notice && (
        <Alert variant={notice.kind} className="mb-5">
          {notice.text}
        </Alert>
      )}

      <FormField fieldId="orgCode" label="Organisation" error={errors.orgCode?.message}>
        <Input
          id="orgCode"
          type="text"
          autoComplete="organization"
          placeholder="Exemple : takibo"
          aria-invalid={errors.orgCode ? true : undefined}
          aria-describedby={errors.orgCode ? fieldErrorId('orgCode') : undefined}
          {...register('orgCode')}
        />
      </FormField>

      <FormField fieldId="email" label="Adresse courriel" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="prenom.nom@organisation.com"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? fieldErrorId('email') : undefined}
          {...register('email')}
        />
      </FormField>

      <FormField
        fieldId="password"
        label="Mot de passe"
        error={errors.password?.message}
        labelAside={
          <button
            type="button"
            onClick={() =>
              setNotice({
                kind: 'info',
                text: 'La récupération du mot de passe sera disponible dans un prochain récit.',
              })
            }
            className="text-sm text-text-muted underline-offset-4 transition-colors duration-150 hover:text-primary hover:underline"
          >
            Mot de passe oublié ?
          </button>
        }
      >
        <PasswordInput
          id="password"
          placeholder="••••••••••••"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? fieldErrorId('password') : undefined}
          {...register('password')}
        />
      </FormField>

      <Button
        type="submit"
        isLoading={login.isPending}
        loadingLabel="Connexion en cours…"
        className="mt-2 w-full"
      >
        Se connecter
      </Button>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-text-muted">
        <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
        Connexion protégée. Vos identifiants ne sont jamais conservés par ce navigateur.
      </p>
    </form>
  );
}
