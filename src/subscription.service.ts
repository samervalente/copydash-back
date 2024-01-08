import { Injectable } from '@nestjs/common';
import {
  SubscriptionBilling,
  SubscriptionBillingFrequencyEnum,
  SubscriptionBillingStatusEnum,
} from './subscription.types';
import { years } from './utils/years';

@Injectable()
export class SubscriptionService {
  calculateMRR(data: SubscriptionBilling[], billingYear = '2022') {
    const monthlyRevenue = {};
    data.forEach((subscriptionBilling: SubscriptionBilling) => {
      const {
        start_date,
        next_cycle,
        value: billingValue,
        status,
        frequency,
      } = subscriptionBilling;
      const startDate = new Date(start_date);
      const month = startDate.getMonth() + 1;
      const next_cycle_month = new Date(next_cycle).getMonth() + 1;

      if (status !== SubscriptionBillingStatusEnum.TRIAL_CANCELLED) {
        if (frequency === SubscriptionBillingFrequencyEnum.MONTHLY) {
          for (
            let billingMonth = month;
            billingMonth <= next_cycle_month;
            billingMonth++
          ) {
            if (monthlyRevenue[billingMonth]) {
              monthlyRevenue[billingMonth] += billingValue;
            } else {
              monthlyRevenue[billingMonth] = billingValue;
            }
          }
        }

        if (frequency === SubscriptionBillingFrequencyEnum.YEARLY) {
          if (monthlyRevenue[month]) {
            monthlyRevenue[month] += billingValue;
          } else {
            monthlyRevenue[month] = billingValue;
          }
        }
      }
    });

    const toDomaiMRR = Object.keys(monthlyRevenue).map((key) => {
      return {
        month: years[Number(key) - 1],
        revenue: Number(monthlyRevenue[Number(key)].toFixed(2)),
      };
    });

    return { billingYear, currency: 'BRL', symbol: 'R$', mrr: toDomaiMRR };
  }
}
