import Mail from '../../lib/Mail';

class WaringMail {
  get key() {
    return 'WarningMail';
  }

  async handle({ data }) {
    const { deliveryman, product, created_at } = data;
    await Mail.sendMail({
      to: `to: ${deliveryman.email} <${deliveryman.email}>`,
      subject: 'Nova entrega cadastrada',
      template: 'warning',
      context: {
        deliveryman: deliveryman.name,
        product,
        created_at,
      },
    });
  }
}

export default new WaringMail();
