import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
//import { LucideFileText } from '@lucide/angular';

@Component({
  imports: [RouterLink],
  selector: 'app-navbar',
  // styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  protected readonly authService = inject(AuthService);
  protected readonly sessaoAutenticada = this.authService.sessao;
}