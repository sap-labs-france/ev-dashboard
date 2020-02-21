import { SortDirection } from '@angular/material/typings';
import { Data } from './Table';
import { Transaction } from './Transaction';

export interface ActionResponse {
  status: string;
  error: string;
  id?: string;
}

export interface ActionsResponse extends ActionResponse {
  inSuccess?: number;
  inError?: number;
}

export interface LoginResponse extends ActionResponse {
  token: string;
}

export interface OCPITriggerJobsResponse extends ActionResponse {
  tokens: OCPIJobStatusesResponse;
  locations: OCPIJobStatusesResponse;
  sessions: OCPIJobStatusesResponse;
  cdrs: OCPIJobStatusesResponse;
}

export interface OCPIJobStatusesResponse extends ActionResponse {
  success: number;
  failure: number;
  total: number;
  logs: string[];
  chargeBoxIDsInFailure: string[];
  chargeBoxIDsInSuccess: string[];
}

export interface OCPIPingResponse extends ActionResponse {
  statusCode: number;
  statusText: string;
  message: string;
}

export interface OCPIGenerateLocalTokenResponse extends ActionResponse {
  id: string;
  localToken: string;
}

export interface SynchronizeResponse {
  status: string;
  synchronized: number;
  error: number;
}

export interface GetDiagnosticResponse extends ActionResponse {
  fileName: string;
}

export interface ValidateBillingConnectionResponse extends ActionResponse {
  connectionIsValid: boolean;
}

export interface DataResult<T extends Data> {
  count: number;
  result: T[];
}

export interface TransactionDataResult {
  count: number;
  result: Transaction[];
  stats: {
    count: number;
    firstTimestamp?: Date;
    lastTimestamp?: Date;
    totalConsumptionWattHours: number;
    totalDurationSecs: number;
    totalInactivitySecs: number;
    totalPrice: number;
    currency: string;
  };
}

export interface TransactionRefundDataResult {
  count: number;
  result: Transaction[];
  stats: {
    count: number;
    totalConsumptionWattHours: number;
    countRefundTransactions: number;
    countPendingTransactions: number;
    countRefundedReports: number;
    totalPriceRefund: number;
    totalPricePending: number;
    currency: string;
  };
}

export interface Ordering {
  field: string;
  direction: SortDirection;
}

export interface Paging {
  limit: number;
  skip: number;
}
