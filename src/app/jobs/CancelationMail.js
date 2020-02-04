import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';
import Mail from '../../lib/Mail';

class CancelationrMail {
  get key() {
    return 'CancelationMail';
  }

  async handle({ data }) {
    const { product } = data;

    const formattedCancelDate = format(
      parseISO(product.canceled_at),
      "dd 'de ' MMMM 'de ' yyyy",
      { locale: pt }
    );

    if (product.start_date != null) {
      const formattedStartDate = format(
        parseISO(product.start_date),
        "dd 'de ' MMMM 'de ' yyyy",
        { locale: pt }
      );

      await Mail.sendMail({
        to: `${product.deliverer.name} <${product.deliverer.email}>`,
        subject: 'Cancelamento na Fastfeet!',
        template: 'cancelation',
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
          startDate: formattedStartDate,
          cancelDate: formattedCancelDate,
        },
      });
    }

    await Mail.sendMail({
      to: `${product.deliverer.name} <${product.deliverer.email}>`,
      subject: 'Cancelamento na Fastfeet!',
      template: 'cancelation',
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
        cancelDate: formattedCancelDate,
      },
    });
  }
}

export default new CancelationrMail();
