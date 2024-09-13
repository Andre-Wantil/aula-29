const express = require("express");
const fsp = require("fs/promises");
const path = require("path");

const caminhoArquivo = path.join(__dirname, "dados.txt");
const servidor = express();

servidor.use(express.json());

servidor.get("/dados", async (_req, res) => {
  try {
    // Lê o conteúdo do arquivo de forma assíncrona
    let dados = await fsp.readFile(caminhoArquivo, "utf8");
    // Processa o conteúdo lido
    dados = dados
      .split("\r")
      .join("")
      .split("\n\t\t")
      .join("")
      .split("\n\t")
      .join("")
      .split("\n")
      .filter((linha) => linha.trim() !== "");

    res.status(200).json({ conteudo: dados });
  } catch (error) {
    if (error.code === "ENOENT") {
      res.status(404).json({ error: "Não encontrou o arquivo" });
    }

    res.status(500).json({ error: "Algo de errado aconteceu", detalhes: error });
  }
});

servidor.put("/dados", async (req, res) => {
  try {
    const { conteudo } = req.body;
    let dadosExistente;
    let conteudoAlterado;

    try {
      dadosExistente = await fsp.readFile(caminhoArquivo, "utf8");
      conteudoAlterado = dadosExistente += `
${conteudo}`;
    } catch (error) {
      if (error.code === "ENOENT") {
        res.status(404).json({ error: "Não encontrou o arquivo" });
      } else if (res.status(400)) {
        res.status(400).json({ error: "Sintaxe incorreta" });
      }

      res.status(500).json({ error: "Algo de errado aconteceu", detalhes: error });
    }

    await fsp.writeFile(caminhoArquivo, conteudoAlterado);
    res.status(200).json({ message: "Arquivo alterado." });
  } catch (error) {
    if (error.code === "ENOENT") {
      res.status(404).json({ error: "Não encontrou o arquivo" });
    } else if (res.status(400)) {
      res.status(400).json({ error: "Sintaxe incorreta" });
    }

    res.status(500).json({ message: "Algo de errado aconteceu", detalhes: error });
  }
});

servidor.listen(3000, () => console.log("Servidor está rodando... 🔥"));
