import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { CategoriaDto } from '../../categorias/categorias.models';
import { CategoriasService } from '../../categorias/categorias.service';
import { NotaFormModel } from '../cadastrar/cadastrar-nota';
import { AtualizarNotaRequest, StatusNota } from '../notas.models';
import { NotasService } from '../notas.service';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-editar-nota',
  templateUrl: './editar-nota.html',
})
export class EditarNota {
  private readonly notasService = inject(NotasService);
  private readonly categoriasService = inject(CategoriasService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notaId: string | null;

  protected readonly carregando = signal(true);
  protected readonly formularioVisivel = signal(false);
  protected readonly enviandoFormulario = signal(false);
  protected readonly carregandoCategorias = signal(true);
  protected readonly categoriasCarregadas = signal(false);
  protected readonly mensagemErro = signal('');
  protected readonly categorias = signal<readonly CategoriaDto[]>([]);
  protected readonly categoriaIdsSelecionadas = signal<readonly string[]>([]);
  protected readonly statusSelecionado = signal<StatusNota>('Ativa');

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
    this.notaId = this.route.snapshot.paramMap.get('notaId');
    this.carregarCategorias();

    if (!this.notaId) {
      this.mensagemErro.set('Identificador da nota inválido.');
      this.carregando.set(false);
      return;
    }

    this.notasService.obterPorId(this.notaId).subscribe({
      next: (nota) => {
        this.modeloNota.update(() => ({
          titulo: nota.titulo,
          descricao: nota.descricao ?? '',
        }));
        this.statusSelecionado.set(nota.status);
        this.categoriaIdsSelecionadas.set(nota.categorias.map((categoria) => categoria.id));
        this.formularioVisivel.set(true);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(
          this.obterMensagemErroApi(
            resposta,
            'Não foi possível carregar a nota. Tente novamente em instantes.',
          ),
        );
        this.carregando.set(false);
      },
    });
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

  protected definirStatus(status: StatusNota): void {
    this.statusSelecionado.set(status);
  }

  protected atualizarNota(event: SubmitEvent): void {
    event.preventDefault();

    if (!this.notaId) return;

    const formulario = this.formularioNota();

    if (formulario.invalid()) {
      formulario.markAsTouched();
      return;
    }

    const modelo = this.modeloNota();
    const descricao = modelo.descricao.trim();

    const request: AtualizarNotaRequest = {
      titulo: modelo.titulo.trim(),
      descricao: descricao.length > 0 ? descricao : null,
      status: this.statusSelecionado(),
      categoriaIds: this.categoriaIdsSelecionadas(),
    };

    this.enviandoFormulario.set(true);
    this.mensagemErro.set('');

    this.notasService.atualizar(this.notaId, request).subscribe({
      next: () => {
        this.enviandoFormulario.set(false);
        void this.router.navigateByUrl('/notas/listar');
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(
          this.obterMensagemErroApi(
            resposta,
            'Não foi possível atualizar a nota. Tente novamente em instantes.',
          ),
        );
        this.enviandoFormulario.set(false);
      },
    });
  }

  private carregarCategorias(): void {
    this.carregandoCategorias.set(true);

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