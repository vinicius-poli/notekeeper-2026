import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { URL_API } from '../auth/auth.tokens';
import { AtualizarNotaRequest, CriarNotaRequest, NotaDto } from './notas.models';

@Service()
export class NotasService {
  private readonly http = inject(HttpClient);
  private readonly urlApi = inject(URL_API);

  listar(categoriaIds?: readonly string[]): Observable<readonly NotaDto[]> {
    if (!categoriaIds?.length) {
      return this.http.get<readonly NotaDto[]>(`${this.urlApi}/notas`);
    }

    let params = new HttpParams();

    for (const categoriaId of categoriaIds) {
      params = params.append('categoriaIds', categoriaId);
    }

    return this.http.get<readonly NotaDto[]>(`${this.urlApi}/notas`, { params });
  }

  obterPorId(notaId: string): Observable<NotaDto> {
    return this.http.get<NotaDto>(`${this.urlApi}/notas/${notaId}`);
  }

  cadastrar(request: CriarNotaRequest): Observable<NotaDto> {
    return this.http.post<NotaDto>(`${this.urlApi}/notas`, request);
  }

  atualizar(notaId: string, request: AtualizarNotaRequest): Observable<NotaDto> {
    return this.http.put<NotaDto>(`${this.urlApi}/notas/${notaId}`, request);
  }

  excluir(notaId: string): Observable<void> {
    return this.http.delete<void>(`${this.urlApi}/notas/${notaId}`);
  }
}