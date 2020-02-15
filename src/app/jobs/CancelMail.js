import Mail from '../../lib/Mail';

class CancelMail {
  get key() {
    return 'CancelMail';
  }

  async handle({ data }) {
    const { deliveryman, product, referencia, problem } = data;
    await Mail.sendMail({
      to: `to: ${deliveryman.email} <${deliveryman.email}>`,
      subject: 'Entrega cancelada',
      template: 'canceled',
      context: {
        deliveryman: deliveryman.name,
        product,
        referencia,
        problem,
      },
    });
  }
}

export default new CancelMail();
