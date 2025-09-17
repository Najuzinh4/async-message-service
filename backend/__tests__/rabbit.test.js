jest.mock('amqplib', () => ({
  connect: jest.fn(async () => ({
    on: jest.fn(),
    createChannel: jest.fn(async () => ({
      assertQueue: jest.fn(async () => {}),
      sendToQueue: jest.fn(() => true),
    })),
  })),
}));

const amqplib = require('amqplib');

describe('publishMessage', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.RABBITMQ_URL = 'amqp://test-host';
    process.env.QUEUE_NAME = 'fila.notificacao.entrada.test';
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test('publica mensagem na fila com payload correto', async () => {
    const { publishMessage } = require('../src/rabbit');

    const payload = { mensagemId: '123', conteudoMensagem: 'hello' };
    await publishMessage(payload);

    // Verifica conexão foi chamada com a URL
    expect(amqplib.connect).toHaveBeenCalledWith('amqp://test-host');

    // Recupera mocks internos
    const conn = await amqplib.connect.mock.results[0].value;
    const ch = await conn.createChannel.mock.results[0].value;

    // assertQueue com nome correto
    expect(ch.assertQueue).toHaveBeenCalledWith('fila.notificacao.entrada.test', { durable: true });

    // sendToQueue com Buffer do JSON e options { persistent: true }
    const sendArgs = ch.sendToQueue.mock.calls[0];
    expect(sendArgs[0]).toBe('fila.notificacao.entrada.test');
    expect(JSON.parse(sendArgs[1].toString())).toEqual(payload);
    expect(sendArgs[2]).toEqual({ persistent: true });
  });
});

