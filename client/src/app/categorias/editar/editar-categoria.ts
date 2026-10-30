import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { CriarCategoriaRequest } from '../categorias.models';
import { CategoriaFormModel } from '../cadastrar/cadastrar-categoria';
import { CategoriasService } from '../categorias.service';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-editar-categoria',
  templateUrl: './editar-categoria.html',
})
export class EditarCategoria {
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly categoriaId: string | null;

  protected readonly carregando = signal(true);
  protected readonly formularioVisivel = signal(false);
  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly modeloCategoria = signal<CategoriaFormModel>({
    titulo: '',
  });

  protected readonly formularioCategoria = form(this.modeloCategoria, (modelo) => {
    required(modelo.titulo, { message: 'Informe o título da categoria.' });
    maxLength(modelo.titulo, 100, { message: 'O título pode ter no máximo 100 caracteres.' });
  });

  constructor() {
    this.categoriaId = this.route.snapshot.paramMap.get('categoriaId');

    if (!this.categoriaId) {
      this.mensagemErro.set('Identificador da categoria inválida.');
      this.carregando.set(false);
      return;
    }

    this.categoriasService.obterPorId(this.categoriaId).subscribe({
      next: (categoria) => {
        this.modeloCategoria.update(() => ({
          titulo: categoria.titulo,
        }));
        this.formularioVisivel.set(true);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(resposta));
        this.carregando.set(false);
      },
    });
  }

  protected atualizarCategoria(event: SubmitEvent): void {
    event.preventDefault();

    if (!this.categoriaId) return;

    const formulario = this.formularioCategoria();

    if (formulario.invalid()) {
      formulario.markAsTouched();
      return;
    }

    const request: CriarCategoriaRequest = {
      titulo: this.modeloCategoria().titulo.trim(),
    };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');

    this.categoriasService.atualizar(this.categoriaId, request).subscribe({
      next: () => {
        this.enviandoFormulario.set(false);
        void this.router.navigateByUrl('/categorias/listar');
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(resposta));
        this.enviandoFormulario.set(false);
      },
    });
  }

  private obterMensagemErroApi(resposta: HttpErrorResponse): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;

    if (problem?.errors) {
      const mensagens = Object.values(problem.errors).flat();
      if (mensagens.length > 0) return mensagens.join('\n');
    }

    return (
      problem?.detail ?? 'Não foi possível atualizar a categoria. Tente novamente em instantes.'
    );
  }
}