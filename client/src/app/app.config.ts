import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { CHAVE_ARMAZENAMENTO, URL_API } from './auth/auth.tokens';
import { authInterceptor } from './auth/auth.interceptor';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home').then((c) => c.Home),
  },
  {
    path: 'auth',
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