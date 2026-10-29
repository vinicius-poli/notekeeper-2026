import { afterNextRender, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { LucideArrowRight } from '@lucide/angular';
import { Router, RouterLink } from '@angular/router';
import { email, form, FormField, minLength, required } from '@angular/forms/signals';
import {
  ApiValidationProblemDetails,
  CadastroConcluidoNavigationState,
  LoginRequest,
  TokenDto,
} from '../auth.models';
import { AuthService } from '../auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Observer } from 'rxjs';

interface LoginFormModel {
  readonly email: string;
  readonly senha: string;
}

@Component({
  imports: [LucideArrowRight, FormField, RouterLink],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly modeloFormulario = signal<LoginFormModel>({ email: '', senha: '' });
  protected readonly formularioLogin = form(this.modeloFormulario, (modelo) => {
    required(modelo.email, { message: 'Informe seu email.' });
    email(modelo.email, { message: 'Informe um email válido.' });
    required(modelo.senha, { message: 'Informe sua senha.' });
    minLength(modelo.senha, 8, { message: 'A senha precisa ter pelo menos 8 caracteres.' });
  });

  protected readonly mensagemSucesso = signal('');
  protected readonly mensagemErro = signal('');
  protected readonly enviandoFormulario = signal(false);

  private readonly tituloPagina = viewChild<ElementRef<HTMLHeadingElement>>('tituloPagina');

  constructor() {
    afterNextRender(() => this.tituloPagina()?.nativeElement.focus());

    const estadoNavegacao = this.router.currentNavigation()?.extras.state as
      CadastroConcluidoNavigationState | undefined;

    if (estadoNavegacao?.emailCadastrado) {
      this.modeloFormulario.update((original) => ({
        email: estadoNavegacao?.emailCadastrado ?? '',
        senha: original.senha,
      }));

      this.mensagemSucesso.set(
        'Conta criada com sucesso. Entre com suas credenciais para continuar.',
      );
    }
  }

  protected enviarFormulario(event: SubmitEvent): void {
    event.preventDefault();

    if (this.formularioLogin().invalid()) {
      this.formularioLogin().markAsTouched();
      return;
    }

    const requisicao: LoginRequest = {
      email: this.modeloFormulario().email,
      senha: this.modeloFormulario().senha,
    };

    this.mensagemErro.set('');
    this.enviandoFormulario.set(true);

    const observer: Partial<Observer<TokenDto>> = {
      next: () => {
        this.enviandoFormulario.set(false);

        void this.router.navigateByUrl('/');
      },
      error: (response: HttpErrorResponse) => {
        const mensagem =
          response.status === 401
            ? 'Email ou senha incorretos. Configura suas credenciais e tente novamente.'
            : this.obterMensagemErroApi(response);

        this.mensagemErro.set(mensagem);
      },
    };

    this.authService.login(requisicao).subscribe(observer);
  }

  private obterMensagemErroApi(response: HttpErrorResponse): string {
    const problem = response.error as ApiValidationProblemDetails | null;

    return problem?.detail ?? 'Não foi possível conectar à API. Tente novamente em instantes';
  }
}