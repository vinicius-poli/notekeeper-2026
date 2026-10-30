import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideFileText } from '@lucide/angular';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { CategoriaDto } from '../../categorias/categorias.models';
import { CategoriasService } from '../../categorias/categorias.service';
import { NotaDto } from '../notas.models';
import { NotasService } from '../notas.service';

@Component({
  imports: [LucideFileText, RouterLink],
  selector: 'app-listar-notas',
  templateUrl: './listar-notas.html',
})
export class ListarNotas {
  private readonly notasService = inject(NotasService);
  private readonly categoriasService = inject(CategoriasService);
  private requisicaoNotas = 0;

  protected readonly notas = signal<readonly NotaDto[]>([]);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');
  protected readonly categorias = signal<readonly CategoriaDto[]>([]);
  protected readonly carregandoCategorias = signal(true);
  protected readonly categoriasCarregadas = signal(false);
  protected readonly mensagemErroCategorias = signal('');
  protected readonly categoriaIdsSelecionadas = signal<readonly string[]>([]);
  protected readonly notaIdEmExclusao = signal<string | null>(null);
  protected readonly excluindo = signal(false);

  constructor() {
    this.carregarCategorias();
    this.carregarNotas();
  }

  protected categoriaSelecionada(categoriaId: string): boolean {
    return this.categoriaIdsSelecionadas().includes(categoriaId);
  }

  protected alternarCategoria(categoriaId: string, selecionada: boolean): void {
    if (this.excluindo()) return;

    this.categoriaIdsSelecionadas.update((ids) => {
      if (selecionada) {
        return ids.includes(categoriaId) ? ids : [...ids, categoriaId];
      }

      return ids.filter((id) => id !== categoriaId);
    });

    this.carregarNotas();
  }

  protected formatarData(valor: string): string {
    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) return valor;

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(data);
  }

  protected abrirConfirmacao(notaId: string): void {
    if (this.excluindo()) return;

    this.mensagemErro.set('');
    this.notaIdEmExclusao.set(notaId);
  }

  protected cancelarExclusao(): void {
    if (this.excluindo()) return;

    this.notaIdEmExclusao.set(null);
  }

  protected confirmarExclusao(): void {
    const notaId = this.notaIdEmExclusao();

    if (!notaId || this.excluindo()) return;

    this.excluindo.set(true);
    this.mensagemErro.set('');

    this.notasService.excluir(notaId).subscribe({
      next: () => {
        this.excluindo.set(false);
        this.notaIdEmExclusao.set(null);
        this.carregarNotas();
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(
          this.obterMensagemErro(
            resposta,
            'Não foi possível excluir a nota. Tente novamente em instantes.',
          ),
        );
        this.excluindo.set(false);
      },
    });
  }

  private carregarCategorias(): void {
    this.carregandoCategorias.set(true);
    this.mensagemErroCategorias.set('');

    this.categoriasService.listar().subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.categoriasCarregadas.set(true);
        this.carregandoCategorias.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErroCategorias.set(
          this.obterMensagemErro(
            resposta,
            'Não foi possível carregar as categorias. Tente novamente em instantes.',
          ),
        );
        this.carregandoCategorias.set(false);
      },
    });
  }

  private carregarNotas(): void {
    const requisicao = ++this.requisicaoNotas;
    const categoriaIds = this.categoriaIdsSelecionadas();

    if (!this.excluindo()) {
      this.notaIdEmExclusao.set(null);
    }

    this.carregando.set(true);
    this.mensagemErro.set('');

    this.notasService.listar(categoriaIds.length > 0 ? categoriaIds : undefined).subscribe({
      next: (notas) => {
        if (requisicao !== this.requisicaoNotas) return;

        this.notas.set(notas);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        if (requisicao !== this.requisicaoNotas) return;

        this.notas.set([]);
        this.mensagemErro.set(
          this.obterMensagemErro(
            resposta,
            'Não foi possível carregar as notas. Tente novamente em instantes.',
          ),
        );
        this.carregando.set(false);
      },
    });
  }

  private obterMensagemErro(resposta: HttpErrorResponse, mensagemPadrao: string): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;

    return problem?.detail ?? mensagemPadrao;
  }
}