import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideNotebookPen, LucideSparkles } from '@lucide/angular';

import { AuthService } from '../auth/auth.service';

@Component({
  imports: [LucideNotebookPen, LucideSparkles, LucideArrowRight, RouterLink],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {
  protected readonly authService = inject(AuthService);
  protected readonly sessaoAutenticada = this.authService.sessao;
}