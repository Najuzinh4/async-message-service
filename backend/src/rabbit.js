const amqp = require("amqplib");

let channel = null;

async function connectRabbit() {
  if (channel) return channel;

  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue(process.env.QUEUE_NAME, { durable: true });
    console.log("Conectado ao RabbitMQ");
    return channel;
  } catch (err) {
  console.error("❌ Erro ao conectar no RabbitMQ:");
  console.error("Mensagem:", err.message);
  console.error("Stack:", err.stack);
  throw err;
}
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
