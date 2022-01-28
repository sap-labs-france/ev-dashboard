import { Asset } from './Asset';
import { AuthorizationDefinitionFieldMetadata } from './Authorization';
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

export interface DataResult<T> {
  count: number;
  result: T[];
  projectFields?: string[];
  metadata?: Record<string, AuthorizationDefinitionFieldMetadata>;
}

export interface RegistrationTokenDataResult extends DataResult<RegistrationToken> {
  canCreate: boolean;
}

export interface CompanyDataResult extends DataResult<Company> {
  canCreate: boolean;
}

export interface SiteDataResult extends DataResult<Site> {
  canCreate: boolean;
}

export interface LogDataResult extends DataResult<Log> {
  canExport: boolean;
}

export interface CarDataResult extends DataResult<Car> {
  canCreate: boolean;
}

export interface CarCatalogDataResult extends DataResult<CarCatalog> {
  canSync: boolean;
}

export interface UserDataResult extends DataResult<User> {
  canCreate: boolean;
  canExport: boolean;
  canImport: boolean;
}

export interface SiteAreaDataResult extends DataResult<SiteArea> {
  canCreate: boolean;
}

export interface TagDataResult extends DataResult<Tag> {
  canCreate: boolean;
  canImport: boolean;
  canExport: boolean;
  canDelete: boolean;
  canUnassign: boolean;
  canAssign: boolean;
  canListUsers: boolean;
  canListSources: boolean;
}

export interface PricingDefinitionDataResult extends DataResult<PricingDefinition> {
  canCreate: boolean;
}

export interface CheckAssetConnectionResponse extends ActionResponse {
  connectionIsValid: boolean;
}

export interface AssetDataResult extends DataResult<Asset> {
  canCreate: boolean;
  canListSites: boolean;
  canListSiteAreas: boolean;
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
