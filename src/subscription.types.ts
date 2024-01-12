export interface SubscriptionBilling {
  frequency: SubscriptionBillingFrequencyEnum;
  billing_quantity: number;
  billed_every_X_days: number;
  value: number;
  start_date: Date;
  status: SubscriptionBillingStatusEnum;
  status_date: Date;
  cancellation_date: Date;
  next_cycle: Date;
  subscriber_ID: string;
}

export enum SubscriptionBillingStatusEnum {
  ACTIVE = 'Ativa',
  CANCELLED = 'Cancelada',
  TRIAL_CANCELLED = 'Trial cancelado',
  UPGRADE = 'Upgrade',
  LATE = 'Atrasada',
}

export enum SubscriptionBillingFrequencyEnum {
  YEARLY = 'Anual',
  MONTHLY = 'Mensal',
}
