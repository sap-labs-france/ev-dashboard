import { Data } from './Table';

export interface BillingTax extends Data {
  description: string;
  displayName: string;
  percentage: number;
}

export interface BillingUserData extends Data {
  hasSynchroError: boolean;
}

export enum BillingConnectionErrorType {
  NO_SECRET_KEY = 'no_secret_key',
  NO_PUBLIC_KEY = 'no_public_key',
  INVALID_SECRET_KEY = 'invalid_secret_key',
  INVALID_PUBLIC_KEY = 'invalid_public_key',
}
