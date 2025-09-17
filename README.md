# Async Message Service

Sistema de notificações assíncronas em arquitetura simples, desenvolvido como desafio técnico Fullstack (Angular + Node.js + RabbitMQ).

## Stack
- Backend: Node.js + Express
- Mensageria: RabbitMQ (CloudAMQP)
- Frontend: Angular (standalone components)
- Comunicação: REST API + polling de status

## Estrutura do Projeto
```
async-message-service/
  backend/   # API Node.js + publicador e consumidor RabbitMQ
  frontend/  # Aplicação Angular
```

## Requisitos
- Node.js 20+ (recomendado LTS)
- Conta no RabbitMQ/CloudAMQP (com vhost)

## Backend

### 1) Configurar variáveis de ambiente
Crie o arquivo `backend/.env`:

```env
PORT=3000
# Importante: inclua o vhost no final da URL (ex.: /bjnuffmq)
RABBITMQ_URL=amqps://USUARIO:SENHA@HOST/VHOST
QUEUE_NAME=fila.notificacao.entrada.seuusuario
```

Notas:
- Em CloudAMQP, o vhost geralmente é igual ao usuário. Exemplo real: `amqps://bjnuffmq:SEU_TOKEN@jaragua-01.lmq.cloudamqp.com/bjnuffmq`.
- É possível definir `RABBITMQ_URL_FALLBACK` (opcional). O backend tenta conectar em `amqps://` e também em fallback `amqp://` automaticamente.

### 2) Instalar dependências e rodar
```
cd backend
npm install
node src/index.js
```

O consumidor (`consumer.js`) é iniciado junto com o servidor e atualiza em memória o status das mensagens processadas.

### 3) Endpoints
- POST `/api/notificar`
  - Body JSON: `{ "conteudoMensagem": "minha mensagem" }`
  - Resposta: `202 Accepted` com `{ mensagemId }`

- GET `/api/notificacao/status/:id`
  - Resposta: `{ mensagemId, status }` ou `404` se não encontrado.
  - Status possíveis: `PROCESSADO_SUCESSO` | `FALHA_PROCESSAMENTO` (enquanto processa, o ID ainda não aparece no mapa).

### 4) Testar rapidamente
- Em um terminal, deixe o backend rodando: `node src/index.js`
- Em outro terminal:
  - `node tests/test-request.js` faz um POST de exemplo.
  - `node tests/rabbit-check.js` verifica conexão AMQP (útil para checar URL com vhost).
  - `node tests/rabbit-min.js` cria/assegura a fila de entrada.

### 5) Tratamento de Erros e Dicas
O backend retorna `502`/`503` com detalhes quando falha publicar no RabbitMQ e loga dicas por código de erro:
- `ENETUNREACH`/`EHOSTUNREACH`: verifique rede/VPN e portas 5671/5672.
- `ECONNREFUSED`: verifique protocolo (amqp/amqps), host/porta e serviço.
- `ENOTFOUND`: revise o hostname/URL (e o vhost!).
- `ETIMEDOUT`/`ECONNRESET`: checar latência/TLS/firewall.

## Frontend

### 1) Instalar e rodar com proxy
```
cd frontend
npm install
npm run start:proxy
```

O proxy está configurado em `frontend/proxy.conf.json` para redirecionar `/api` para `http://localhost:3000`.

### 2) Fluxo de uso
1. O usuário digita a mensagem e envia (POST `/api/notificar`).
2. O backend publica na fila definida por `QUEUE_NAME`.
3. O consumidor simula o processamento (1–2s) e atualiza o status em memória; também publica em `fila.notificacao.status.*` (informativo).
4. O frontend realiza polling (GET `/api/notificacao/status/:id`) e exibe o resultado.

## Dicas de Troubleshooting
- Se a resposta for `{ error: 'Erro interno' }` ou `Falha ao publicar mensagem...`, confira os logs do backend e o `RABBITMQ_URL` (inclua o vhost!).
- Para CloudAMQP, teste a URL com `node backend/tests/rabbit-check.js`.
- Em ambientes corporativos, garanta acesso às portas 5671 (TLS) e 5672 (sem TLS).

## Licença
CONFIDENCIAL: Demonstração de coding.

