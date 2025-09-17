const amqp = require("amqplib");
// Fiz esses teste por que eu tava usando a url errada no .env kkk
// tava faltando o vhost no final da URL
(async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const ch = await conn.createChannel();
    console.log("Conectado com sucesso ao RabbitMQ!");
    await ch.close();
    await conn.close();
  } catch (err) {
    console.error("Falha ao conectar:", err.message);
  }
})();
