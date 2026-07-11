import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email('Veuillez saisir une adresse courriel valide.'),
  password: z.string().min(1, 'Veuillez saisir votre mot de passe.'),
  orgCode: z.string().trim().min(1, "Veuillez saisir le code de l'organisation."),
  spaceCode: z.string().trim().min(1, 'Veuillez saisir le code du space.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
