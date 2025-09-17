require("dotenv").config();
const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { publishMessage } = require("./rabbit");

const app = express();
app.use(express.json());

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
    console.error("Stack:", err.stack);
    return res.status(500).json({ error: "Erro interno" });
  }
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${process.env.PORT}`);
});
