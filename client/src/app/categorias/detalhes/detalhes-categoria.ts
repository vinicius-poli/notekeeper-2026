import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { CategoriaDto } from '../categorias.models';
import { CategoriasService } from '../categorias.service';

@Component({
  imports: [],
  selector: 'app-detalhes-categoria',
  templateUrl: './detalhes-categoria.html',
})
export class DetalhesCategoria {
  private readonly route = inject(ActivatedRoute);
  private readonly categoriasService = inject(CategoriasService);

  protected readonly categoria = signal<CategoriaDto | null>(null);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');

  constructor() {
    const categoriaId = this.route.snapshot.paramMap.get('categoriaId');

    if (!categoriaId) {
      this.mensagemErro.set('Identificador da categoria inválida.');
      this.carregando.set(false);
      return;
    }

    this.categoriasService.obterPorId(categoriaId).subscribe({
      next: (categoria) => {
        this.categoria.set(categoria);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.carregando.set(false);
      },
    });
  }

  private obterMensagemErro(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;

    return (
      problem?.detail ?? 'Não foi possível carregar o categoria. Tente novamente em instantes.'
    );
  }
}