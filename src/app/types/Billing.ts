import { Data } from './Table';

export interface BillingTax extends Data {
  description: string;
  displayName: string;
  percentage: number;
}

