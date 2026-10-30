import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  imports: [RouterLinkActive, RouterLink, RouterOutlet, Navbar],
  selector: 'app-notas-shell',
  templateUrl: './notas-shell.html',
})
export class NotasShell {}