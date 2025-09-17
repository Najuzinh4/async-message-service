import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificacaoService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) {}

  enviarNotificacao(mensagemId: string, conteudoMensagem: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notificar`, { mensagemId, conteudoMensagem });
  }

  consultarStatus(mensagemId: string): Observable<any> {
    const ts = Date.now();
    return this.http.get(`${this.apiUrl}/notificacao/status/${mensagemId}?_=${ts}`);
  }
}
