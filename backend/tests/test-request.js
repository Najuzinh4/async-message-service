const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function test() {
  const res = await fetch("http://localhost:3000/api/notificar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conteudoMensagem: "teste123" }),
  });
  const data = await res.json();
  console.log(data);
}

test();
