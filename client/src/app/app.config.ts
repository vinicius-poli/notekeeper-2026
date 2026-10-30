import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { isAnonymousGuard, isAuthenticatedGuard } from './auth/auth.guards';
import { CHAVE_ARMAZENAMENTO, URL_API } from './auth/auth.tokens';
import { authInterceptor } from './auth/auth.interceptor';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((c) => c.Home),
  },
  {
    path: 'auth',
    canActivate: [isAnonymousGuard],
    loadComponent: () => import('./auth/shell/auth-shell').then((c) => c.AuthShell),
    children: [
      {
        path: 'cadastro',
        loadComponent: () => import('./auth/cadastro/cadastro').then((c) => c.Cadastro),
      },
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then((c) => c.Login),
      },
    ],
  },
  {
    path: 'categorias',
    canActivate: [isAuthenticatedGuard],
    loadComponent: () =>
      import('./categorias/shell/categorias-shell').then((c) => c.CategoriasShell),
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      {
        path: 'listar',
        loadComponent: () =>
          import('./categorias/listar/listar-categorias').then((c) => c.ListarCategorias),
      },
      {
        path: 'detalhes/:categoriaId',
        loadComponent: () =>
          import('./categorias/detalhes/detalhes-categoria').then((c) => c.DetalhesCategoria),
      },
      {
        path: 'cadastrar',
        loadComponent: () =>
          import('./categorias/cadastrar/cadastrar-categoria').then((c) => c.CadastrarCategoria),
      },
      {
        path: 'editar/:categoriaId',
        loadComponent: () =>
          import('./categorias/editar/editar-categoria').then((c) => c.EditarCategoria),
      }
    ],
  },
  {
    path: 'notas',
    canActivate: [isAuthenticatedGuard],
    loadComponent: () => import('./notas/shell/notas-shell').then((c) => c.NotasShell),
    children: [
      { path: '', redirectTo: 'listar', pathMatch: 'full' },
      {
        path: 'listar',
        loadComponent: () => import('./notas/listar/listar-notas').then((c) => c.ListarNotas),
      },
      {
        path: 'detalhes/:notaId',
        loadComponent: () => import('./notas/detalhes/detalhes-nota').then((c) => c.DetalhesNota),
      },
      {
        path: 'editar/:notaId',
        loadComponent: () => import('./notas/editar/editar-nota').then((c) => c.EditarNota),
      },
      {
        path: 'cadastrar',
        loadComponent: () =>
          import('./notas/cadastrar/cadastrar-nota').then((c) => c.CadastrarNota),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: URL_API,
      useValue: environment.urlApi,
    },
    {
      provide: CHAVE_ARMAZENAMENTO,
      useValue: 'notekeeper.sessao',
    },
  ],
};