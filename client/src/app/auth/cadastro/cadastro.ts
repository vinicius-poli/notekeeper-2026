import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { email, form, FormField, minLength, pattern, required } from '@angular/forms/signals';
import { AuthService } from '../auth.service';
import {
  ApiValidationProblemDetails,
  CadastroConcluidoNavigationState,
  CadastroRequest,
  UsuarioDto,
} from '../auth.models';
import { Observer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

interface CadastroFormModel {
  readonly nome: string;
  readonly email: string;
  readonly senha: string;
}
@Component({
  imports: [LucideArrowRight, FormField, RouterLink],
  selector: 'app-cadastro',
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly tituloPagina = viewChild<ElementRef<HTMLHeadingElement>>('tituloPagina');

  protected readonly modeloFormulario = signal<CadastroFormModel>({
    nome: '',
    email: '',
    senha: '',
  });

  protected readonly formularioCadastro = form(this.modeloFormulario, (modelo) => {
    required(modelo.nome, { message: 'Informe seu nome.' });
    pattern(modelo.nome, /\S/, {
      message: 'O nome não pode conter apenas espaços.',
    });
    required(modelo.email, { message: 'Informe seu email.' });
    email(modelo.email, { message: 'Informe um email válido.' });
    required(modelo.senha, { message: 'Informe sua senha.' });
    minLength(modelo.senha, 8, { message: 'A senha precisa ter pelo menos 8 caracteres.' });
    pattern(modelo.senha, /(?=.*\d)(?=.*[^a-zA-Z0-9]).+/, {
      message: 'Inclua pelo menos um número e um caractere especial.',
    });
  });

  protected readonly mensagemErro = signal('');
  protected readonly enviandoFormulario = signal(false);

  constructor() {
    afterNextRender(() => this.tituloPagina()?.nativeElement.focus());
  }

  protected enviarFormulario(event: SubmitEvent) {
    event.preventDefault();

    if (this.formularioCadastro().invalid()) {
      this.formularioCadastro().markAsTouched();
      return;
    }

    const request: CadastroRequest = {
      nome: this.modeloFormulario().nome,
      email: this.modeloFormulario().email,
      senha: this.modeloFormulario().senha,
    };

    this.mensagemErro.set('');
    this.enviandoFormulario.set(true);

    this.mensagemErro.set('');
    this.enviandoFormulario.set(true);

    const observer: Partial<Observer<UsuarioDto>> = {
      next: (usuario) => {
        this.enviandoFormulario.set(false);

        const estadoNavegacao: CadastroConcluidoNavigationState = {
          emailCadastrado: usuario.email,
        };

        void this.router.navigateByUrl('/auth/login', { state: estadoNavegacao });
      },
      error: (response: HttpErrorResponse) => {
        this.enviandoFormulario.set(false);

        const mensagem =
          response.status === 409
            ? 'Este email já está cadastrado. Entre na sua conta ou use outro email.'
            : this.obterMensagemErroApi(response);

        this.mensagemErro.set(mensagem);
      },
    };

    this.authService.cadastrar(request).subscribe(observer);
  }

  private obterMensagemErroApi(response: HttpErrorResponse): string {
    const problem = response.error as ApiValidationProblemDetails | null;

    if (problem?.errors) {
      const mensagens = Object.values(problem.errors).flat();

      if (mensagens.length > 0) return mensagens.join('\n');
    }

    return problem?.detail ?? 'Não foi possível criar sua conta. Tente novamente em instantes';
  }
}
