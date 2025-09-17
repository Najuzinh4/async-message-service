import { Component } from '@angular/core';
import { NotificacaoComponent } from './notificacao/notificacao';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NotificacaoComponent],
  template: `
    <h1>Sistema de Notificações</h1>
    <app-notificacao></app-notificacao>
  `,
  styleUrl: './app.css'
})
export class App {}
