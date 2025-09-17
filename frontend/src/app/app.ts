import { Component } from '@angular/core';
import { NotificacaoComponent } from './notificacao/notificacao';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NotificacaoComponent],
  template: `
    <header class="hero">
      <h1>Sistema de Notificações</h1>
      <p class="sub">Teste de Desenvolvedor Full-Stack - Sistema de Notificações
Assíncronas Simplificado</p>
      <p class="sub">Desenvolvedora Full- Stack: Ana Júlia Gaspar</p>
    </header>
    <main class="container">
      <app-notificacao></app-notificacao>
    </main>
  `,
  styleUrl: './app.css'
})
export class App {}
