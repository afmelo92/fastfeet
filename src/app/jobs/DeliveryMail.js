import Mail from '../../lib/Mail';

class DeliveryMail {
  get key() {
    return 'DeliveryMail';
  }

  async handle({ data }) {
    const { product } = data;

    await Mail.sendMail({
      to: `${product.deliverer.name} <${product.deliverer.email}>`,
      subject: 'Entrega te esperando na Fastfeet!',
      template: 'delivery',
      context: {
        deliverer: product.deliverer.name,
        name: product.recipient.name,
        street: product.recipient.street,
        number: product.recipient.number,
        complement: product.recipient.complement,
        state: product.recipient.state,
        city: product.recipient.city,
        zip: product.recipient.zip,
        product: product.product,
      },
    });
  }
}

export default new DeliveryMail();
