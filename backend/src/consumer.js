require("dotenv").config();
const { connectRabbit } = require("./rabbit");

async function startConsumer(statusMap) {
  const ch = await connectRabbit();

  await ch.consume(process.env.QUEUE_NAME, async (msg) => {
    if (msg !== null) {
      const payload = JSON.parse(msg.content.toString());
      const { mensagemId, conteudoMensagem } = payload;

      console.log("📥 Mensagem recebida:", payload);

      //vai simular o  processamento 1–2 segundos
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000)
      );

      //decide sucesso ou falha (20% chance falha)
      const numero = Math.floor(Math.random() * 10) + 1;
      const status =
        numero <= 2 ? "FALHA_PROCESSAMENTO" : "PROCESSADO_SUCESSO";

      //atualiza no Map do index.js
      statusMap.set(mensagemId, status);

      console.log(
        `⚙️ Mensagem ${mensagemId} processada com status: ${status}`
      );

      //´publica na fila de status
      const statusQueue = `fila.notificacao.status.Naju`;
      await ch.assertQueue(statusQueue, { durable: true });
      await ch.sendToQueue(
        statusQueue,
        Buffer.from(JSON.stringify({ mensagemId, status })),
        { persistent: true }
      );

      console.log(`📤 Status publicado em ${statusQueue}`);

      //vai confirma processamento da mensagem
      ch.ack(msg);
    }
  });

  console.log("👂 Consumidor aguardando mensagens...");
}

module.exports = { startConsumer };
