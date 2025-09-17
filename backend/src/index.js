require("dotenv").config();
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { publishMessage } = require("./rabbit");
const { startConsumer } = require("./consumer");

const statusMap = new Map();

const app = express();
app.use(express.json());

app.get("/api/notificacao/status/:id", (req, res) => {
  const id = req.params.id;
  const status = statusMap.get(id);
  if (!status) {
    return res.status(404).json({ error: "Mensagem não encontrada" });
  }
  return res.json({ mensagemId: id, status });
});

app.get("/", (req, res) => {
  res.send("✅ API de Notificações rodando! Use POST /api/notificar");
});

app.post("/api/notificar", async (req, res) => {
  const { conteudoMensagem } = req.body;

  if (!conteudoMensagem || conteudoMensagem.trim() === "") {
    return res.status(400).json({ error: "conteudoMensagem não pode ser vazio" });
  }

  const mensagemId = uuidv4();
  const payload = { mensagemId, conteudoMensagem };

  try {
    await publishMessage(payload);
    return res.status(202).json({
      mensagem: "Mensagem recebida para processamento",
      mensagemId,
    });
  } catch (err) {
    console.error("❌ Erro ao publicar mensagem:");
    console.error("Mensagem:", err.message);
    if (err.code) {
      console.error("Código:", err.code);
    }
    if (typeof err.errno !== "undefined" && err.errno !== err.code) {
      console.error("Errno:", err.errno);
    }
    console.error("Stack:", err.stack);
    const responseBody = {
      error: "Falha ao publicar mensagem na fila RabbitMQ",
      detalhe: err.message,
    };
    if (err.code) {
      responseBody.codigo = err.code;
    }
    if (typeof err.errno !== "undefined" && err.errno !== err.code) {
      responseBody.errno = err.errno;
    }
    const unreachableErrors = new Set(["ENETUNREACH", "EHOSTUNREACH"]);
    if (unreachableErrors.has(err.code)) {
      responseBody.dica =
        "Verifique sua conexão de rede/VPN ou libere as portas 5671 e 5672 para alcançar o RabbitMQ.";
    }
    const statusCode = unreachableErrors.has(err.code) ? 503 : 502;
    return res.status(statusCode).json(responseBody);
  }
});

//start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${process.env.PORT}`);
  startConsumer(statusMap).catch((err) => {
    console.error("❌ Erro ao iniciar consumidor:", err.message);
  });
});
