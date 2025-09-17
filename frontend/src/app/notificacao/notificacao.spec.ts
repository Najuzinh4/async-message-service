import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificacaoComponent } from './notificacao';

describe('NotificacaoComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NotificacaoComponent],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve adicionar notificação com status AGUARDANDO_PROCESSAMENTO e enviar POST', () => {
    const fixture = TestBed.createComponent(NotificacaoComponent);
    const component = fixture.componentInstance;

    component.conteudoMensagem = 'mensagem teste';
    component.enviar();

    // Item deve ser inserido imediatamente
    expect(component.notificacoes.length).toBe(1);
    expect(component.notificacoes[0].status).toBe('AGUARDANDO_PROCESSAMENTO');

    // Haverá um GET imediato de status e um POST; capturamos ambos
    const requests = httpMock.match(() => true);
    const postReq = requests.find(r => r.request.method === 'POST');
    const getReq = requests.find(r => r.request.method === 'GET');

    expect(postReq).toBeTruthy();
    expect(getReq).toBeTruthy();

    // Verifica POST body
    const body = postReq!.request.body as any;
    expect(body.conteudoMensagem).toBe('mensagem teste');
    expect(body.mensagemId).toBeTruthy();
    // UUID v4 simples (formato)
    expect(body.mensagemId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);

    // Simula backend aceitando
    postReq!.flush({ mensagemId: body.mensagemId });

    // Simula status imediato como sucesso
    getReq!.flush({ mensagemId: body.mensagemId, status: 'PROCESSADO_SUCESSO' });

    expect(component.notificacoes[0].status).toBe('PROCESSADO_SUCESSO');
  });
});

