const amqp = require("amqplib");

let connection = null;
let channel = null;
let connectingPromise = null;


function buildHintFromError(err) {
  switch (err?.code) {
    case "ENETUNREACH":
    case "EHOSTUNREACH":
      return "Cheque sua conexão com a internet/VPN e libere acesso às portas 5671 e 5672.";
    case "ECONNREFUSED":
      return "O host respondeu mas recusou a conexão. Confirme o protocolo (amqp/amqps), porta e se o serviço está ativo.";
    case "ECONNRESET":
      return "A conexão foi resetada. Tente novamente e valide configurações de TLS/Firewall.";
    case "ETIMEDOUT":
      return "A conexão expirou. Verifique latência de rede e portas liberadas.";
    case "ENOTFOUND":
      return "Hostname não encontrado. Revise a variável RABBITMQ_URL ou a configuração de DNS.";
    default:
      return undefined;
  }
}

  const extra = process.env.RABBITMQ_URL_FALLBACK?.trim();
  if (extra && !urls.includes(extra)) {
    urls.push(extra);
  }

  return urls;
  }
  async function establishChannel() {
  const urls = buildRabbitUrls();

  if (!urls.length) {
    throw new Error("RABBITMQ_URL não configurada");
  }

  let lastError;

  for (const url of urls) {
    console.log(`🔄 Tentando conectar ao RabbitMQ usando ${url} ...`);

    try {
      const conn = await amqp.connect(url);

      conn.on("close", () => {
        console.warn("⚠️ Conexão com RabbitMQ fechada. Tentando reconectar...");
        connection = null;
        channel = null;
        connectingPromise = null;
      });

      conn.on("error", (err) => {
        console.error("⚠️ Erro na conexão do RabbitMQ:");
        console.error("Mensagem:", err.message);
        console.error("Stack:", err.stack);
      });

      const ch = await conn.createChannel();
      await ch.assertQueue(process.env.QUEUE_NAME, { durable: true });

      connection = conn;
      channel = ch;
      console.log("✅ Conectado ao RabbitMQ");
      return channel;
    } catch (err) {
      console.error("❌ Erro ao conectar no RabbitMQ:");
      console.error("Mensagem:", err.message);
      console.error("Stack:", err.stack);
      lastError = err;
    }
  }

  throw lastError;
}

async function connectRabbit() {
  if (channel) {
    return channel;
  }

  if (!connectingPromise) {
    connectingPromise = establishChannel().catch((err) => {
      connectingPromise = null;
      throw err;
    });
  }

  return connectingPromise;
}

async function publishMessage(message) {
  const ch = await connectRabbit();
  await ch.sendToQueue(
    process.env.QUEUE_NAME,
    Buffer.from(JSON.stringify(message)),
    { persistent: true }
  );
  console.log("Mensagem publicada:", message);
}

module.exports = { connectRabbit, publishMessage };
