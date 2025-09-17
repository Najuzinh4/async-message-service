const amqp = require("amqplib");

let connection = null;
let channel = null;
let connectingPromise = null;


function buildRabbitUrls() {
  const urls = [];
  const primary = process.env.RABBITMQ_URL?.trim();

 if (primary) {
    urls.push(primary);

    if (primary.startsWith("amqps://")) {
      const fallback = "amqp://" + primary.slice("amqps://".length);
      if (!urls.includes(fallback)) {
        urls.push(fallback);
      }
    } else if (primary.startsWith("amqp://")) {
      const fallback = "amqps://" + primary.slice("amqp://".length);
      if (!urls.includes(fallback)) {
        urls.push(fallback);
      }
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
