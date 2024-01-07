export const mapRowToDomain = (data) => {
  const value =
    typeof data['valor'] === 'string'
      ? parseFloat(data['valor'].replace(',', '.'))
      : data['valor'];

  return {
    frequency: data['periodicidade'],
    billing_quantity: parseInt(data['quantidade cobranças']),
    billed_every_X_days: parseInt(data['cobrada a cada X dias']),
    value: !isNaN(value) ? value : data['valor'],
    start_date: new Date(data['data início']),
    status: data['status'],
    status_date: new Date(data['data status']),
    cancellation_date: data['data cancelamento']
      ? new Date(data['data cancelamento'])
      : null,
    next_cycle: new Date(data['próximo ciclo']),
    subscriber_ID: data['ID assinante'],
  };
};
