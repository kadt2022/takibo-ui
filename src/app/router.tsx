import { Navigate, createBrowserRouter } from 'react-router-dom';

import { LoginPage } from '@/features/authentication/pages/LoginPage';
import { AuthenticationLayout } from '@/layouts/AuthenticationLayout/AuthenticationLayout';

/**
 * Routes de TAKIBO UI.
 * Sans session, toute entrée converge vers /login (AC-04). Les routes
 * protégées de la console arriveront avec les récits suivants.
 */
export const routes = [
  {
    element: <AuthenticationLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
];

export const router = createBrowserRouter(routes);
