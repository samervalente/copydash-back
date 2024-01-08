import { Injectable } from '@nestjs/common';
import {
  SubscriptionBilling,
  SubscriptionBillingFrequencyEnum,
  SubscriptionBillingStatusEnum,
} from './subscription.types';
import dateFns from 'date-fns';

@Injectable()
export class SubscriptionService {
  calculateMRR(data: SubscriptionBilling[], billingYear = '2022') {
    const monthlyRevenue = {};
    data.forEach((subscriptionBilling: SubscriptionBilling) => {
      const { start_date, next_cycle, value } = subscriptionBilling;
      const startDate = new Date(start_date);
      const month = startDate.getMonth();

      if (
        subscriptionBilling.status !==
        SubscriptionBillingStatusEnum.TRIAL_CANCELLED
      ) {
        if (
          subscriptionBilling.frequency ===
          SubscriptionBillingFrequencyEnum.MONTHLY
        ) {
        }

        const revenue = value;

        const key = `${billingYear}-${month + 1}`;

        if (!monthlyRevenue[key]) {
          monthlyRevenue[key] = 0;
        }

        monthlyRevenue[key] += revenue;
      }
    });

    const revenueByMonth = Array.from({ length: 12 }, (_, index) => {
      const year = new Date().getFullYear();
      const month = index + 1;
      const key = `${year}-${month < 10 ? '0' + month : month}`;

      return {
        month: month,
        year: year,
        revenue: monthlyRevenue[key] || 0,
      };
    });
  }
}
