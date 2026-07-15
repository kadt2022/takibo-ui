import { Navigate, createBrowserRouter } from 'react-router-dom';

import { NotFound } from '@/design-system/components/NotFound';
import { LoginScreen } from '@/features/authentication/pages/LoginScreen';
import { OrgDashboardPage } from '@/features/organization/pages/OrgDashboardPage';
import { OrgSettingsPage } from '@/features/organization/pages/OrgSettingsPage';
import { MySpacesPage } from '@/features/organization/pages/MySpacesPage';
import { SpacesManagementPage } from '@/features/organization/pages/SpacesManagementPage';
import { AppShell } from '@/layouts/AppShell/AppShell';
import { AuthenticationLayout } from '@/layouts/AuthenticationLayout/AuthenticationLayout';

/**
 * Routes de TAKIBO UI (récit UI 01 — socle graphique).
 * L'entrée est /login (présentationnel) ; le shell vit sous /app, en contexte
 * ORGANISATION. Le contexte SPACE (/app/spaces/:spaceCode/*) arrivera au récit
 * UI 05, après l'échange de token (IAM 33). Aucune console PLATEFORME ici.
 */
export const routes = [
  {
    element: <AuthenticationLayout />,
    children: [{ path: '/login', element: <LoginScreen /> }],
  },
  {
    path: '/app',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: 'dashboard', element: <OrgDashboardPage /> },
      { path: 'my-spaces', element: <MySpacesPage /> },
      { path: 'spaces', element: <SpacesManagementPage /> },
      { path: 'settings', element: <OrgSettingsPage /> },
    ],
  },
  { path: '/', element: <Navigate to="/login" replace /> },
  { path: '*', element: <NotFound /> },
];

export const router = createBrowserRouter(routes);
