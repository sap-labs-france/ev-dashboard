import { Asset } from './Asset';
import { AssetsAuthorizations, CarCatalogsAuthorizations, CarsAuthorizations, DataResultAuthorizations, LogsAuthorizationActions, SitesAuthorizationActions, TagsAuthorizations, UsersAuthorizations } from './Authorization';
import { Car, CarCatalog } from './Car';
import { Company } from './Company';
import { Log } from './Log';
import PricingDefinition from './Pricing';
import { RegistrationToken } from './RegistrationToken';
import { Site } from './Site';
import { SiteArea } from './SiteArea';
import { Tag } from './Tag';
import { Transaction } from './Transaction';
import { User, UserStatus } from './User';

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

export interface OICPJobStatusesResponse extends ActionResponse {
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

export interface OICPPingResponse extends ActionResponse {
  statusCode: number;
  statusText: string;
  message: string;
}

export interface OCPIGenerateLocalTokenResponse extends ActionResponse {
  id: string;
  localToken: string;
}

export interface GetDiagnosticResponse extends ActionResponse {
  fileName: string;
}

export interface CheckBillingConnectionResponse extends ActionResponse {
  connectionIsValid: boolean;
}

export interface DataResult<T> extends DataResultAuthorizations {
  count: number;
  result: T[];
}

export interface RegistrationTokenDataResult extends DataResult<RegistrationToken> {
}

export interface CompanyDataResult extends DataResult<Company> {
}

export interface SiteDataResult extends DataResult<Site>, SitesAuthorizationActions {
}

export interface LogDataResult extends DataResult<Log>, LogsAuthorizationActions {
}

export interface CarDataResult extends DataResult<Car>, CarsAuthorizations {
}

export interface CarCatalogDataResult extends DataResult<CarCatalog>, CarCatalogsAuthorizations {
}

export interface UserDataResult extends DataResult<User>, UsersAuthorizations {
}

export interface SiteAreaDataResult extends DataResult<SiteArea> {
}

export interface TagDataResult extends DataResult<Tag>, TagsAuthorizations {
}

export interface PricingDefinitionDataResult extends DataResult<PricingDefinition> {
}

export interface AssetDataResult extends DataResult<Asset>, AssetsAuthorizations {
}

export interface CheckAssetConnectionResponse extends ActionResponse {
  connectionIsValid: boolean;
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
}

export interface Paging {
  limit: number;
  skip: number;
}

export interface VerifyEmailResponse extends ActionResponse {
  userStatus?: UserStatus;
}

export interface BillingOperationResult {
  succeeded: boolean;
  error?: Error;
  internalData?: unknown; // an object returned by the concrete implementation - e.g.: STRIPE
}
