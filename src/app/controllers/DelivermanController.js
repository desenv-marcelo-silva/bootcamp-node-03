class DelivermanController {
  async store(req, res) {
    return res.json({ ok: 'deliver-store' });
  }
}

export default new DelivermanController();
