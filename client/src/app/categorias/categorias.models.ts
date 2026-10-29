export interface CategoriaDto {
  readonly id: string;
  readonly titulo: string;
}

export interface CriarCategoriaRequest {
  readonly titulo: string;
}