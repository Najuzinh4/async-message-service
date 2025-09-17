import { Component, ChangeDetectorRef } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
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

  constructor(
    private notificacaoService: NotificacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  enviar() {
    if (!this.conteudoMensagem.trim()) return;

    const conteudo = this.conteudoMensagem.trim();
    const mensagemId = uuidv4();

    // 1) Adiciona imediatamente na UI como AGUARDANDO
    this.notificacoes.push({ mensagemId, conteudo, status: 'AGUARDANDO_PROCESSAMENTO' });
    this.cdr.detectChanges();
    // 2) Inicia polling imediatamente
    this.iniciarPolling(mensagemId);
    // 3) Limpa o input
    this.conteudoMensagem = '';

    // 4) Faz o POST
    this.notificacaoService.enviarNotificacao(mensagemId, conteudo).subscribe({
      next: (res) => {
        const idConfirmado = res.mensagemId || mensagemId;
        if (idConfirmado !== mensagemId) {
          const notif = this.notificacoes.find((n) => n.mensagemId === mensagemId);
          if (notif) { notif.mensagemId = idConfirmado; this.cdr.detectChanges(); }
        }
      },
      error: (err) => {
        console.error(err);
        const notif = this.notificacoes.find((n) => n.mensagemId === mensagemId);
        if (notif) { notif.status = 'FALHA_PROCESSAMENTO'; this.cdr.detectChanges(); }
      },
    });
  }

  iniciarPolling(mensagemId: string) {
    const check = () => {
      this.notificacaoService.consultarStatus(mensagemId).subscribe({
        next: (res) => {
          const notif = this.notificacoes.find((n) => n.mensagemId === mensagemId);
          if (notif) { notif.status = res.status; this.cdr.detectChanges(); }
        },
        error: (err) => {
          // 404 enquanto ainda processa é normal; log para depuração
          if (err?.status && err.status !== 404) {
            console.warn('Erro ao consultar status', err);
          }
        },
      });
    };
    // dispara imediatamente e depois a cada 3s
    check();
    const interval = setInterval(() => {
      check();
      const notif = this.notificacoes.find((n) => n.mensagemId === mensagemId);
      if (notif && (notif.status === 'PROCESSADO_SUCESSO' || notif.status === 'FALHA_PROCESSAMENTO')) {
        clearInterval(interval);
      }
    }, 3000);
  }

  trackById(_index: number, item: { mensagemId: string }) {
    return item.mensagemId;
  }
}
