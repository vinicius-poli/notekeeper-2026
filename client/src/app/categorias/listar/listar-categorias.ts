import { Component, inject, signal } from '@angular/core';
import { CategoriasService } from '../categorias.service';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { RouterLink } from '@angular/router';
import { LucideBookOpen } from '@lucide/angular';
import { CategoriaDto } from '../categorias.models';

@Component({
  imports: [LucideBookOpen, RouterLink],
  selector: 'app-listar-categorias',
  templateUrl: './listar-categorias.html',
})
export class ListarCategorias {
  private readonly categoriasService = inject(CategoriasService);

  protected readonly categorias = signal<readonly CategoriaDto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');

  constructor() {
    this.carregarCategorias();
  }

  private carregarCategorias(): void {
    this.carregando.set(true);
    this.mensagemErro.set('');

    this.categoriasService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErro(resposta));
        this.carregando.set(false);
      },
    });
  }

  private obterMensagemErro(response: HttpErrorResponse): string {
    const problem = response.error as ApiValidationProblemDetails | null;

    return (
      problem?.detail ?? 'Não foi possível carregar as categorias. Tente novamente em instantes.'
    );
  }
}