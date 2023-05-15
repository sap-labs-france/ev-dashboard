import { Asset } from './Asset';
import {
  AssetsAuthorizations,
  BillingAccountsAuthorizations,
  BillingInvoicesAuthorizations,
  BillingPaymentMethodsAuthorizationActions,
  BillingTaxesAuthorizations,
  BillingTransfersAuthorizations,
  CarCatalogsAuthorizations,
  CarsAuthorizations,
  ChargingProfilesAuthorizations,
  ChargingStationTemplateAuthorizationActions,
  ChargingStationsAuthorizations,
  DataResultAuthorizations,
  LogsAuthorizationActions,
  OcpiEndpointsAuthorizationActions,
  ReservationsAuthorizationActions,
  SettingsAuthorizationActions,
  SiteUsersAuthorizations,
  SitesAuthorizationActions,
  StatisticsAuthorizations,
  TagsAuthorizations,
  TransactionsAuthorizations,
  UserSitesAuthorizations,
  UsersAuthorizations,
} from './Authorization';
import {
  BillingAccount,
  BillingInvoice,
  BillingPaymentMethod,
  BillingTax,
  BillingTransfer,
} from './Billing';
import { Car, CarCatalog } from './Car';
import { ChargingProfile } from './ChargingProfile';
import { ChargingStation } from './ChargingStation';
import { ChargingStationTemplate } from './ChargingStationTemplate';
import { Company } from './Company';
import { AssetInError, ChargingStationInError, TransactionInError } from './InError';
import { Log } from './Log';
import { OCPIEndpoint } from './ocpi/OCPIEndpoint';
import PricingDefinition from './Pricing';
import { RegistrationToken } from './RegistrationToken';
import { Reservation } from './Reservation';
import { Setting } from './Setting';
import { Site, UserSite } from './Site';
import { SiteArea } from './SiteArea';
import { StatisticData } from './Statistic';
import { Tag } from './Tag';
import { Transaction } from './Transaction';
import { SiteUser, User, UserStatus } from './User';

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

export interface RegistrationTokenDataResult extends DataResult<RegistrationToken> {}

export interface CompanyDataResult extends DataResult<Company> {}

export interface SiteDataResult extends DataResult<Site>, SitesAuthorizationActions {}

export interface LogDataResult extends DataResult<Log>, LogsAuthorizationActions {}

export interface CarDataResult extends DataResult<Car>, CarsAuthorizations {}

export interface CarCatalogDataResult extends DataResult<CarCatalog>, CarCatalogsAuthorizations {}

export interface UserDataResult extends DataResult<User>, UsersAuthorizations {}

export interface UserSiteDataResult extends DataResult<UserSite>, UserSitesAuthorizations {}

export interface SiteUserDataResult extends DataResult<SiteUser>, SiteUsersAuthorizations {}

export interface SiteAreaDataResult extends DataResult<SiteArea> {
  smartChargingSessionParametersActive: boolean;
}

export interface TagDataResult extends DataResult<Tag>, TagsAuthorizations {}

export interface PricingDefinitionDataResult extends DataResult<PricingDefinition> {}

export interface AssetDataResult extends DataResult<Asset>, AssetsAuthorizations {}

export interface AssetInErrorDataResult extends DataResult<AssetInError>, AssetsAuthorizations {}

export interface BillingAccountDataResult
  extends DataResult<BillingAccount>,
  BillingAccountsAuthorizations {}

export interface BillingInvoiceDataResult
  extends DataResult<BillingInvoice>,
  BillingInvoicesAuthorizations {}

export interface BillingTaxDataResult extends DataResult<BillingTax>, BillingTaxesAuthorizations {}

export interface BillingTransferDataResult
  extends DataResult<BillingTransfer>,
  BillingTransfersAuthorizations {}

export interface BillingPaymentMethodDataResult
  extends DataResult<BillingPaymentMethod>,
  BillingPaymentMethodsAuthorizationActions {}

export interface ChargingStationDataResult
  extends DataResult<ChargingStation>,
  ChargingStationsAuthorizations {}

export interface ChargingStationInErrorDataResult
  extends DataResult<ChargingStationInError>,
  ChargingStationsAuthorizations {}

export interface ChargingProfileDataResult
  extends DataResult<ChargingProfile>,
  ChargingProfilesAuthorizations {}

export interface CheckAssetConnectionResponse extends ActionResponse {
  connectionIsValid: boolean;
}

export interface TransactionDataResult extends DataResult<Transaction>, TransactionsAuthorizations {
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

export interface TransactionRefundDataResult
  extends DataResult<Transaction>,
  TransactionsAuthorizations {
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

export interface TransactionInErrorDataResult
  extends DataResult<TransactionInError>,
  TransactionsAuthorizations {}
export interface ChargingStationTemplateDataResult
  extends DataResult<ChargingStationTemplate>,
  ChargingStationTemplateAuthorizationActions {}

export interface SettingDataResult extends DataResult<Setting>, SettingsAuthorizationActions {}

export interface OcpiEndpointDataResult
  extends DataResult<OCPIEndpoint>,
  OcpiEndpointsAuthorizationActions {
  canCreate?: boolean;
}

export interface StatisticDataResult extends DataResult<StatisticData>, StatisticsAuthorizations {}

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

export interface ReservationDataResult
  extends DataResult<Reservation>,
  ReservationsAuthorizationActions {}
