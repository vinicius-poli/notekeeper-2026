import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { CategoriaDto } from '../../categorias/categorias.models';
import { CategoriasService } from '../../categorias/categorias.service';
import { CriarNotaRequest } from '../notas.models';
import { NotasService } from '../notas.service';

export interface NotaFormModel {
  readonly titulo: string;
  readonly descricao: string;
}

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-cadastrar-nota',
  templateUrl: './cadastrar-nota.html',
})
export class CadastrarNota {
  private readonly notasService = inject(NotasService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);

  protected readonly enviandoFormulario = signal(false);
  protected readonly carregandoCategorias = signal(true);
  protected readonly categoriasCarregadas = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly categorias = signal<readonly CategoriaDto[]>([]);
  protected readonly categoriaIdsSelecionadas = signal<readonly string[]>([]);

  protected readonly modeloNota = signal<NotaFormModel>({
    titulo: '',
    descricao: '',
  });

  protected readonly formularioNota = form(this.modeloNota, (modelo) => {
    required(modelo.titulo, { message: 'Informe o título da nota.' });
    minLength(modelo.titulo, 2, { message: 'O título deve ter pelo menos 2 caracteres.' });
    maxLength(modelo.titulo, 100, { message: 'O título pode ter no máximo 100 caracteres.' });
    maxLength(modelo.descricao, 300, {
      message: 'A descrição pode ter no máximo 300 caracteres.',
    });
  });

  constructor() {
    this.carregarCategorias();
  }

  protected categoriaSelecionada(categoriaId: string): boolean {
    return this.categoriaIdsSelecionadas().includes(categoriaId);
  }

  protected alternarCategoria(categoriaId: string, selecionada: boolean): void {
    this.categoriaIdsSelecionadas.update((ids) => {
      if (selecionada) {
        return ids.includes(categoriaId) ? ids : [...ids, categoriaId];
      }

      return ids.filter((id) => id !== categoriaId);
    });
  }

  protected cadastrarNota(event: SubmitEvent): void {
    event.preventDefault();

    const formulario = this.formularioNota();

    if (formulario.invalid()) {
      formulario.markAsTouched();
      return;
    }

    const modelo = this.modeloNota();
    const descricao = modelo.descricao.trim();

    const request: CriarNotaRequest = {
      titulo: modelo.titulo.trim(),
      descricao: descricao.length > 0 ? descricao : null,
      categoriaIds: this.categoriaIdsSelecionadas(),
    };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');

    this.notasService.cadastrar(request).subscribe({
      next: () => {
        this.enviandoFormulario.set(false);
        void this.router.navigateByUrl('/notas/listar');
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(
          this.obterMensagemErroApi(
            resposta,
            'Não foi possível cadastrar a nota. Tente novamente em instantes.',
          ),
        );
        this.enviandoFormulario.set(false);
      },
    });
  }

  private carregarCategorias(): void {
    this.carregandoCategorias.set(true);
    this.mensagemErro.set('');

    this.categoriasService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.categoriasCarregadas.set(true);
        this.carregandoCategorias.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(
          this.obterMensagemErroApi(
            resposta,
            'Não foi possível carregar as categorias. Tente novamente em instantes.',
          ),
        );
        this.carregandoCategorias.set(false);
      },
    });
  }

  private obterMensagemErroApi(resposta: HttpErrorResponse, mensagemPadrao: string): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;

    if (problem?.errors) {
      const mensagens = Object.values(problem.errors).flat();

      if (mensagens.length > 0) return mensagens.join('\n');
    }

    return problem?.detail ?? mensagemPadrao;
  }
}