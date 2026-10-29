import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { URL_API } from '../auth/auth.tokens';
import { CategoriaDto } from './categorias.models';

@Service()
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  listar(): Observable<readonly CategoriaDto[]> {
    return this.http.get<readonly CategoriaDto[]>(`${this.urlApi}/categorias`);
  }
}