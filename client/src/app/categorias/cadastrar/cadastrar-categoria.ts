import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, maxLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { CriarCategoriaRequest } from '../categorias.models';
import { CategoriasService } from '../categorias.service';

export interface CategoriaFormModel {
  readonly titulo: string;
}

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-cadastrar-categoria',
  templateUrl: './cadastrar-categoria.html',
})
export class CadastrarCategoria {
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);

  protected readonly enviandoFormulario = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly modeloCategoria = signal<CategoriaFormModel>({
    titulo: '',
  });

  protected readonly formularioCategoria = form(this.modeloCategoria, (modelo) => {
    required(modelo.titulo, { message: 'Informe o título da categoria.' });
    maxLength(modelo.titulo, 100, { message: 'O título pode ter no máximo 100 caracteres.' });
  });

  protected cadastrarCategoria(event: SubmitEvent): void {
    event.preventDefault();

    const formulario = this.formularioCategoria();

    if (formulario.invalid()) {
      formulario.markAsTouched();
      return;
    }

    const modelo = this.modeloCategoria();

    const request: CriarCategoriaRequest = {
      titulo: modelo.titulo.trim(),
    };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');

    this.categoriasService.cadastrar(request).subscribe({
      next: () => {
        this.enviandoFormulario.set(false);

        void this.router.navigateByUrl('/categorias/listar');
      },
      error: (response: HttpErrorResponse) => {
        this.mensagemErro.set(this.obterMensagemErroApi(response));
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
      problem?.detail ?? 'Não foi possível cadastrar a categoria. Tente novamente em instantes.'
    );
  }
}