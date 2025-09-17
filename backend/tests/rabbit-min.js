const amqp = require("amqplib");

(async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const ch = await conn.createChannel();
    await ch.assertQueue("fila.notificacao.entrada.Arthur", { durable: true });
    console.log("✅ Conectado e fila criada com sucesso!");
    await conn.close();
  } catch (err) {
    console.error("❌ Erro ao conectar:", err.message);
  }
})();
