import { CategoriaDto } from '../categorias/categorias.models';

export type StatusNota = 'Ativa' | 'Arquivada';

export interface NotaDto {
  readonly id: string;
  readonly titulo: string;
  readonly descricao: string | null;
  readonly status: StatusNota;
  readonly categorias: readonly CategoriaDto[];
  readonly criadoEm: string;
  readonly atualizadoEm: string;
}

export interface CriarNotaRequest {
  readonly titulo: string;
  readonly descricao: string | null;
  readonly categoriaIds: readonly string[];
}

export interface AtualizarNotaRequest {
  readonly titulo: string;
  readonly descricao: string | null;
  readonly status: StatusNota;
  readonly categoriaIds: readonly string[];
}