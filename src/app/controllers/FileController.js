class FileController {
  async store(req, res) {
      return res.json({ok: 'FileController'});
  }
}

export default new FileController();