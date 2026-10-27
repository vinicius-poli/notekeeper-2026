import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideNotebookPen, LucideFileText } from '@lucide/angular';

// Este componente é um embrulho (wrapper) para aos componentes das rotas de autenticação
// através de projeção com NgContent (ng-content)
@Component({
  imports: [LucideFileText, LucideNotebookPen, RouterLink],
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.html',
})
export class AuthShell {}