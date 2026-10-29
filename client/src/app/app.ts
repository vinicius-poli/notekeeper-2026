import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CategoriasShell } from './categorias/shell/categorias-shell';

@Component({
  imports: [RouterOutlet, CategoriasShell],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}