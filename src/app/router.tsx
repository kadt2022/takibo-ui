import { Navigate, createBrowserRouter } from 'react-router-dom';

import { LoginPage } from '@/features/authentication/pages/LoginPage';
import { OrganizationConsolePage } from '@/features/organization/pages/OrganizationConsolePage';
import { AuthenticationLayout } from '@/layouts/AuthenticationLayout/AuthenticationLayout';

/**
 * Routes de TAKIBO UI (récit UI 01.6).
 * Sans session, toute entrée converge vers /login (AC-04). Après connexion :
 * /org — la Console Organisation. La console de space arrivera avec IAM 33.
 */
export const routes = [
  {
    element: <AuthenticationLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  { path: '/org', element: <OrganizationConsolePage /> },
  { path: '*', element: <Navigate to="/login" replace /> },
];

export const router = createBrowserRouter(routes);
