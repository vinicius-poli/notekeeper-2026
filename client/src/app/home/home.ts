import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideNotebookPen, LucideSparkles } from '@lucide/angular';

@Component({
  imports: [LucideNotebookPen, LucideSparkles, LucideArrowRight, RouterLink],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {}