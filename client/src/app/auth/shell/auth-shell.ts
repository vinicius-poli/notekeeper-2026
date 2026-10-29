import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LucideNotebookPen, LucideFileText } from '@lucide/angular';

// Este componente é um embrulho (wrapper) para aos componentes das rotas de autenticação
// através de projeção com NgContent (ng-content)
@Component({
  imports: [LucideFileText, LucideNotebookPen, RouterLink, RouterOutlet],
  selector: 'app-auth-shell',
  templateUrl: './auth-shell.html',
})
export class AuthShell {}