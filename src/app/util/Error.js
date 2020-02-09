function BadRequest(res, mensagem) {
  return res.status(400).json({ error: mensagem });
}

function Unauthorized(res, mensagem) {
  return res.status(401).json({ error: mensagem });
}

export { BadRequest, Unauthorized };
