import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { URL_API } from '../auth/auth.tokens';
import { CategoriaDto, CriarCategoriaRequest } from './categorias.models';

@Service()
export class CategoriasService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  listar(): Observable<readonly CategoriaDto[]> {
    return this.http.get<readonly CategoriaDto[]>(`${this.urlApi}/categorias`);
  }

  cadastrar(request: CriarCategoriaRequest): Observable<CategoriaDto> {
    return this.http.post<CategoriaDto>(`${this.urlApi}/categorias`, request);
  }

  obterPorId(categoriaId: string): Observable<CategoriaDto> {
    return this.http.get<CategoriaDto>(`${this.urlApi}/categorias/${categoriaId}`);
  }
}