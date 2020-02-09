import Recipient from '../models/Recipient';

import * as Yup from 'yup';

import * as Error from '../util/Error';
const CEPRegex = /^[0-9]{2}.[0-9]{3}-[0-9]{3}$/;

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      rua: Yup.string().required(),
      numero: Yup.string().required(),
      bairro: Yup.string().required(),
      cidade: Yup.string().required(),
      estado: Yup.string().required(),
      cep: Yup.string().matches(CEPRegex),
    });

    if (!(await schema.isValid(req.body))) {
      return Error.BadRequest(res, 'Dados inválidos.' );
    }

    const { name } = req.body;
    const recipientExists = await Recipient.findOne({ where: { name } });
    if (recipientExists) {
      return Error.BadRequest(res, 'Destinatário já está cadastrado.');
    }

    const { id } = await Recipient.create(req.body);
    return res.json({ id, name });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      name: Yup.string().required(),
      rua: Yup.string().required(),
      numero: Yup.string().required(),
      bairro: Yup.string().required(),
      cidade: Yup.string().required(),
      estado: Yup.string().required(),
      cep: Yup.string().matches(CEPRegex),
    });

    if (!(await schema.isValid(req.body))) {
      return Error.BadRequest(res, 'Dados inválidos.' );
    }

    const recipient = await Recipient.findByPk(req.body.id);
    if (!recipient) {
      return Error.BadRequest(res, 'Destinatário não está cadastrado.');
    }

    const { id, name } = await recipient.update(req.body);

    return res.json({ id, name });
  }
}

export default new RecipientController();
