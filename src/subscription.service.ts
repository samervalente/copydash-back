import { Injectable } from '@nestjs/common';
import {
  SubscriptionBilling,
  SubscriptionBillingFrequencyEnum,
  SubscriptionBillingStatusEnum,
} from './subscription.types';
import { months } from './utils/constants';
import { isWithinInterval } from 'date-fns';

@Injectable()
export class SubscriptionService {
  calculateMRR(data: SubscriptionBilling[]) {
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
        month: months[Number(key)],
        revenue: Number(monthlyRevenue[Number(key) + 1]).toFixed(2),
      };
    });

    return toDomaiMRR;
  }

  calculateChurnRate(
    data: SubscriptionBilling[],
    start_date: Date,
    end_date: Date,
  ) {
    const activeMembersQuantityByMonth = {};
    const cancelledMembersQuantityByMonth = {};

    data.forEach((subscription) => {
      const { status_date, cancellation_date } = subscription;

      if (
        (subscription.status === SubscriptionBillingStatusEnum.CANCELLED ||
          subscription.status ===
            SubscriptionBillingStatusEnum.TRIAL_CANCELLED) &&
        isWithinInterval(cancellation_date, {
          start: start_date,
          end: end_date,
        })
      ) {
        const cancellation_date_month = new Date(status_date).getMonth() + 1;
        cancelledMembersQuantityByMonth[cancellation_date_month] =
          (cancelledMembersQuantityByMonth[cancellation_date_month] || 0) + 1;
      }

      if (subscription.status === SubscriptionBillingStatusEnum.ACTIVE) {
        const status_date_month = new Date(status_date).getMonth() + 1;
        activeMembersQuantityByMonth[status_date_month] =
          (activeMembersQuantityByMonth[status_date_month] || 0) + 1;
      }
    });

    const toDomainChurnRate = Object.keys(activeMembersQuantityByMonth).map(
      (key) => {
        const rate =
          (Number(cancelledMembersQuantityByMonth[key]) /
            Number(activeMembersQuantityByMonth[key])) *
          100;

        return {
          month: months[Number(key) - 1],
          rate,
          exceedPercentage: rate > 100 ? Math.round(rate - 100) : 0,
        };
      },
    );
    const totalActive = Object.values(activeMembersQuantityByMonth).reduce(
      (acc: number, curr: number) => acc + curr,
      0,
    );

    const totalCancelled = Object.values(
      cancelledMembersQuantityByMonth,
    ).reduce((acc: number, curr: number) => acc + curr, 0);

    const totalSubscribers = data.length;

    return {
      rate: toDomainChurnRate,
      totalActive,
      totalCancelled,
      totalSubscribers,
    };
  }
}
