import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificacaoService } from './notificacao-service';


interface Notificacao {
  mensagemId: string;
  conteudo: string;
  status: string;
}

@Component({
  selector: 'app-notificacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificacao.html',
  styleUrls: ['./notificacao.css'],
})

export class NotificacaoComponent {
  conteudoMensagem = '';
  notificacoes: Notificacao[] = [];

  constructor(private notificacaoService: NotificacaoService) {}

  enviar() {
    if (!this.conteudoMensagem.trim()) return;

    const conteudo = this.conteudoMensagem;

    this.notificacaoService.enviarNotificacao(conteudo).subscribe({
      next: (res) => {
        const mensagemId = res.mensagemId;
        this.notificacoes.push({
          mensagemId,
          conteudo,
          status: 'AGUARDANDO_PROCESSAMENTO',
        });
        this.iniciarPolling(mensagemId);
        this.conteudoMensagem = '';
      },
      error: (err) => console.error(err),
    });
  }

  iniciarPolling(mensagemId: string) {
    const interval = setInterval(() => {
      this.notificacaoService.consultarStatus(mensagemId).subscribe({
        next: (res) => {
          const notif = this.notificacoes.find((n) => n.mensagemId === mensagemId);
          if (notif) {
            notif.status = res.status;
          }
          if (
            res.status === 'PROCESSADO_SUCESSO' ||
            res.status === 'FALHA_PROCESSAMENTO'
          ) {
            clearInterval(interval);
          }
        },
        error: () => {
        },
      });
    }, 3000);
  }
}
