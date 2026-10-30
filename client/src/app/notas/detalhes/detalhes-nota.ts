import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiValidationProblemDetails } from '../../auth/auth.models';
import { NotaDto } from '../notas.models';
import { NotasService } from '../notas.service';

@Component({
  imports: [RouterLink],
  selector: 'app-detalhes-nota',
  templateUrl: './detalhes-nota.html',
})
export class DetalhesNota {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notasService = inject(NotasService);
  private readonly notaId: string | null;

  protected readonly nota = signal<NotaDto | null>(null);
  protected readonly carregando = signal(true);
  protected readonly mensagemErro = signal('');
  protected readonly confirmandoExclusao = signal(false);
  protected readonly excluindo = signal(false);

  constructor() {
    this.notaId = this.route.snapshot.paramMap.get('notaId');

    if (!this.notaId) {
      this.mensagemErro.set('Identificador da nota inválido.');
      this.carregando.set(false);
      return;
    }

    this.notasService.obterPorId(this.notaId).subscribe({
      next: (nota) => {
        this.nota.set(nota);
        this.carregando.set(false);
      },
      error: (resposta: HttpErrorResponse) => {
        this.mensagemErro.set(
          this.obterMensagemErro(
            resposta,
            'Não foi possível carregar a nota. Tente novamente em instantes.',
          ),
        );
        this.carregando.set(false);
      },
    });
  }

  protected formatarData(valor: string): string {
    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) return valor;

    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(data);
  }

  protected abrirConfirmacao(): void {
    this.mensagemErro.set('');
    this.confirmandoExclusao.set(true);
  }

  protected cancelarExclusao(): void {
    if (this.excluindo()) return;

    this.confirmandoExclusao.set(false);
  }

  protected confirmarExclusao(): void {
    if (!this.notaId || this.excluindo()) return;

    this.excluindo.set(true);
    this.mensagemErro.set('');

    this.notasService.excluir(this.notaId).subscribe({
      next: () => {
        this.excluindo.set(false);
        void this.router.navigateByUrl('/notas/listar');
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

  private obterMensagemErro(resposta: HttpErrorResponse, mensagemPadrao: string): string {
    const problem = resposta.error as ApiValidationProblemDetails | null;

    return problem?.detail ?? mensagemPadrao;
  }
}