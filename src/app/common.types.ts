import { SortDirection } from '@angular/material/typings';
import { ComponentType } from './services/component.service';
import { ErrorMessage } from './shared/dialogs/error-code-details/error-code-details-dialog.component';

export declare type FilterType = 'dropdown' | 'dialog-table' | 'date' | '';
export declare type ActionType = 'button' | 'dropdown-button' | 'slide' | '';

export declare type DialogType = 'YES_NO' | 'OK_CANCEL' | 'OK' | 'YES_NO_CANCEL' | 'DIRTY_CHANGE' | 'INVALID_CHANGE';
export declare type ButtonType = 'OK' | 'CANCEL' | 'YES' | 'NO' | 'SAVE_AND_CLOSE' | 'DO_NOT_SAVE_AND_CLOSE';

export enum MobileType {
  IOS = 'iOS',
  ANDROID = 'Android',
}

export interface KeyValue {
  key: string;
  value: string;
  objectRef?: any;
}

export interface TableFilterDef {
  id: string;
  httpId: string;
  type: FilterType;
  name: string;
  label?: string;
  currentValue?: any;
  defaultValue?: any;
  class?: string;
  items?: KeyValue[];
  dialogComponent?: any;
  dialogComponentData?: any;
  reset?: () => void;
  multiple?: boolean;
  cleared?: boolean;
}

export interface DropdownItem {
  id: string;
  name: string;
  icon?: string;
  class?: string;
  disabled?: boolean;
  tooltip: string;
}

export enum ButtonColor {
  PRIMARY = 'primary',
  ACCENT = 'accent',
  WARN = 'warn',
}

export interface TableActionDef {
  id: string;
  type: ActionType;
  currentValue?: any;
  name: string;
  icon?: string;
  color?: ButtonColor;
  disabled?: boolean;
  isDropdownMenu?: boolean;
  dropdownItems?: DropdownItem[];
  tooltip: string;
}

export interface Data {
  id: string|number;
  isSelected: boolean;
  isSelectable: boolean;
  isExpanded: boolean;
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

export interface RouteInfo {
  id: string;
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
  admin?: boolean;
  superAdmin?: boolean;
}

export interface ChildrenItems {
  path: string;
  title: string;
  ab: string;
  type?: string;
}

export interface DropdownLink {
  title: string;
  iconClass?: string;
  routerLink?: string;
}

export enum NavItemType {
  Sidebar = 1, // Only ever shown on sidebar
  NavbarLeft = 2, // Left-aligned icon-only link on navbar in desktop mode, shown above sidebar items on collapsed sidebar in mobile mode
  NavbarRight = 3, // Right-aligned link on navbar in desktop mode, shown above sidebar items on collapsed sidebar in mobile mode
}

export interface NavItem {
  type: NavItemType;
  title: string;
  routerLink?: string;
  iconClass?: string;
  numNotifications?: number;
  dropdownItems?: Array<DropdownLink | 'separator'>;
}

export interface ActionResponse {
  status: string;
  error: string;
}

export interface ActionsResponse extends ActionResponse {
  inSuccess: number;
  inError: number;
}

export interface LoginResponse extends ActionResponse {
  token: string;
}

export interface OCPIEVSEStatusesResponse extends ActionResponse {
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

export interface EndUserLicenseAgreement {
  text: string;
}

export interface GetDiagnosticResponse extends ActionResponse {
  fileName: string;
}

export interface ValidateBillingConnectionResponse extends ActionResponse {
  connectionIsValid: boolean;
}

export interface ChargerConfiguration {
  chargeBoxID: string;
  timestamp: Date;
  configuration: [
    {
      value: string;
      readonly: boolean;
      key: string;
    }];
}

export interface ConsumptionValue {
  date: Date;
  value: number;
  cumulated: number;
  amount: number;
  price: number;
  stateOfCharge: number;
  unroundedAmount: number;
  cumulatedAmount: number;
  currencyCode: string;
  pricingSource: string;
}

export interface Connector extends Data {
  connectorId: number;
  currentConsumption: number;
  currentStateOfCharge?: number;
  totalInactivitySecs?: number;
  totalConsumption?: number;
  status: string;
  errorCode?: string;
  info?: string;
  vendorErrorCode?: string;
  power: number;
  type: string;
  voltage?: number;
  amperage?: number;
  activeTransactionID: number;
  activeTransactionDate: Date;
  activeTagID: string;
  statusLastChangedOn?: Date;
  inactivityStatusLevel: InactivityStatusLevel;
  hasDetails: boolean;
  isStopAuthorized: boolean;
  isStartAuthorized: boolean;
  isTransactionDisplayAuthorized: boolean;
}

export type InactivityStatusLevel =
 'info' |
 'warning' |
 'danger'
;

export interface Charger extends Data {
  id: string;
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialnumber: string;
  chargeBoxSerialnumber: string;
  firmwareVersion: string;
  iccid: string;
  imsi: string;
  lastReboot: Date;
  meterType: string;
  meterSerialnumber: string;
  endpoint: string;
  ocppVersion: string;
  lastHeartBeat: Date;
  lastHeartBeatChanged: boolean;
  inactive: boolean;
  chargingStationURL: string;
  numberOfConnectedPhase: number;
  connectors: Connector[];
  siteArea: SiteArea;
  cannotChargeInParallel: boolean;
  maximumPower: number;
  powerLimitUnit: string;
  coordinates: number[];
  currentIPAddress: string;
}

export interface ChargerInError extends Charger {
  errorCode: string;
  errorMessage: ErrorMessage;
  uniqueId: string;
}

export interface Address {
  address1: string;
  address2: string;
  postalCode: string;
  city: string;
  department: string;
  region: string;
  country: string;
  coordinates: number[];
}

export interface Company extends Data {
  id: string;
  name: string;
  address: Address;
  logo: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface Image {
  id: string;
  image: string;
}

export interface Images {
  id: string;
  images: string[];
}

export interface Log extends Data {
  id: string;
  level: string;
  source: string;
  host?: string;
  process?: string;
  module: string;
  method: string;
  timestamp: Date;
  action: string;
  type: string;
  message: string;
  user: string;
  actionOnUser: string;
  detailedMessages: string[];
}

export interface Tenant extends Data {
  id: string;
  name: string;
  email: string;
  subdomain: string;
  components?: any;
}

export interface Setting extends Data {
  id: string;
  identifier: string;
  sensitiveData: string[];
  content: any;
}

export interface RegistrationToken extends Data {
  id: string;
  description?: string;
  createdOn: Date;
  expirationDate: Date;
  revocationDate?: Date;
  siteAreaID: string;
  ocpp15Url: string;
  ocpp16Url: string;
}

export interface OcpiEndpoint extends Data {
  id: string;
  name: string;
  role: string;
  baseUrl: string;
  countryCode: string;
  partyId: string;
  version?: string;
  status?: string;
  localToken: string;
  token: string;
  backgroundPatchJob: boolean;
  lastPatchJobOn: Date;
  lastPatchJobResult?: any;
}

export interface OcpiEndpointDetail extends Data {
  id: string;
  ocpiendpoint: OcpiEndpoint;
  status: string;
  backgroundPatchJob: boolean;
  lastPatchJobOn: Date;
  successNbr: number;
  failureNbr: number;
  totalNbr: number;
}

export interface Logo {
  id: string;
  logo: string;
}

export interface Ordering {
  field: string;
  direction: SortDirection;
}

export interface Paging {
  limit: number;
  skip: number;
}

export interface Pricing {
  id: string;
  timestamp: Date;
  priceKWH: number;
  priceUnit: string;
}

export interface SiteArea extends Data {
  id: string;
  name: string;
  image: string;
  address: Address;
  maximumPower: number;
  accessControl: boolean;
  siteID: string;
  site: Site;
  chargeBoxes: Charger[];
}

export interface Site extends Data {
  id: string;
  name: string;
  companyID: string;
  company: Company;
  autoUserSiteAssignment: boolean;
  siteAreas: SiteArea[];
  address: Address;
  image: string;
  images: object[];
  gps: string;
  consumptionData: object;
  occupationData: object;
  userIDs: string[];
  users: User[];
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface SubjectInfo {
  action: string;
  data: {
    id: string;
    type: string;
  };
}

export interface StatisticData {
  month: number;
  [key: string]: number;
}

export interface IntegrationConnection extends Data {
  connectorId: string;
  createdAt: Date;
  validUntil: Date;
}

export interface UserConnection {
  connectorId: string;
  settingId: string;
  userId: string;
  data: {
    [key: string]: string;
  };
}

export interface CurrentMetrics {
  name: string;
  id: string;
  companyID: string;
  company: Company;
  currentConsumption: number;
  totalConsumption: number;
  currentTotalInactivitySecs: number;
  maximumPower: number;
  maximumNumberOfChargingPoint: number;
  occupiedChargingPoint: number;
  address: Address[];
  image: any;
  trends: any;
  dataConsumptionChart: any;
  dataDeliveredChart: any;
}

export interface TableDef {
  class?: string;
  rowSelection?: {
    enabled: boolean;
    multiple?: boolean;
  };
  footer?: {
    enabled: boolean;
  };
  search?: {
    enabled: boolean;
  };
  design?: {
    flat: boolean;
  };
  rowDetails?: {
    enabled: boolean;
    detailsField?: string;
    angularComponent?: any;
    showDetailsField?: string;
  };
  rowFieldNameIdentifier?: string;
  isSimpleTable?: boolean;
  hasDynamicRowAction?: boolean;
}

export interface TableColumnDef {
  id: string;
  name: string;
  footerName?: string;
  type?: string;
  headerClass?: string;
  class?: string;
  formatter?: (value: any, row?: any) => string | null;
  sortable?: boolean;
  sorted?: boolean;
  direction?: SortDirection;
  isAngularComponent?: boolean;
  angularComponent?: any;
  defaultValue?: any;
}

export interface TableSearch {
  search: string;
}

export interface Transaction extends Data {
  id: number;
  timestamp: Date;
  chargeBox: Charger;
  chargeBoxID: string;
  siteAreaID: string;
  connectorId: number;
  meterStart: number;
  currentConsumption: number;
  currentTotalConsumption: number;
  currentTotalInactivitySecs: number;
  currentInactivityStatusLevel: InactivityStatusLevel;
  currentTotalDurationSecs: number;
  stateOfCharge: number;
  currentStateOfCharge: number;
  isLoading: boolean;
  siteID: string;
  user: User;
  tagID: string;
  status: string;
  price: number;
  priceUnit: string;
  refundData: {
    reportId: string;
    refundId: string;
    refundedAt: Date;
    status: string;
  };
  stop: {
    user: User;
    tagID: string;
    timestamp: Date;
    meterStop: number;
    totalConsumption: number;
    stateOfCharge: number;
    totalInactivitySecs: number;
    totalDurationSecs: number;
    price: number;
    priceUnit: string;
    inactivityStatusLevel: InactivityStatusLevel;
  };
  dateTimestring: string;
  values: ConsumptionValue[];
}

export interface Report extends Data {
  id: string;
  user: User;
}

export interface User extends Data {
  id: string;
  name: string;
  firstName: string;
  fullName: string;
  tagIDs: string[];
  plateID: string;
  email: string;
  phone: Date;
  mobile: string;
  notificationsActive: boolean;
  notifications: {
    sendSessionStarted?: boolean;
    sendOptimalChargeReached?: boolean;
    sendEndOfCharge?: boolean;
    sendEndOfSession?: boolean;
    sendUserAccountStatusChanged?: boolean;
    sendUnknownUserBadged?: boolean;
    sendChargingStationStatusError?: boolean;
    sendChargingStationRegistered?: boolean;
    sendOcpiPatchStatusError?: boolean;
    sendSmtpAuthError?: boolean;
  };
  address: Address;
  iNumber: string;
  costCenter: boolean;
  status: string;
  image: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
  role: string;
  locale: string;
  language: string;
  numberOfSites: number;
  activeComponents?: string[];
  scopes: string[];
  companies: string[];
  sites: string[];
  sitesAdmin: string[];
  sitesOwner: string[];
  userHashID: number;
  tenantHashID: number;
}

export interface UserToken {
  id?: string;
  role?: string;
  name?: string;
  firstName?: string;
  locale?: string;
  language?: string;
  currency?: string;
  tagIDs?: string[];
  tenantID: string;
  tenantName?: string;
  userHashID?: string;
  tenantHashID?: string;
  scopes?: readonly string[];
  companies?: string[];
  sites?: string[];
  sitesAdmin?: string[];
  activeComponents?: string[];
  sitesOwner?: string[];
}

export interface UserSite extends Data {
  user: User;
  siteID: string;
  siteAdmin: boolean;
  siteOwner: boolean;
}

export interface SiteUser extends Data {
  site: Site;
  userID: string;
  siteAdmin: boolean;
  siteOwner: boolean;
}

export interface VehicleManufacturer {
  id: string;
  logo: string;
  name: string;
  vehicles: Vehicle[];
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface Vehicle {
  id: string;
  images: string[];
  numberOfImages: number;
  manufacturer: string;
  model: string;
  batteryKW: number;
  autonomyKmWLTP: number;
  autonomyKmReal: number;
  horsePower: number;
  torqueNm: number;
  performance0To100kmh: number;
  weightKg: number;
  lengthMeter: number;
  widthMeter: number;
  heightMeter: number;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface ScheduleSlot {
  start: Date;
  end: Date;
  limit: number;
}

export interface ConnectorSchedule {
  connectorId: number;
  slots: ScheduleSlot[];
}

export enum PricingSettingsType {
  SIMPLE = 'simple',
  CONVERGENT_CHARGING = 'convergentCharging',
}

export interface PricingSettings {
  id?: string;
  identifier: ComponentType.PRICING;
  sensitiveData: string[];
  type: PricingSettingsType;
  simple: {
    price: number;
    currency: string;
  };
  convergentCharging: {
    url: string;
    chargeableItemName: string;
    user: string;
    password: string;
  };
}

export enum BillingSettingsType {
  STRIPE = 'stripe',
}

export interface BillingSettings {
  id?: string;
  identifier: ComponentType.BILLING;
  sensitiveData: string[];
  type: BillingSettingsType;
  stripe: {
    url: string;
    secretKey: string;
    publicKey: string;
    noCardAllowed?: boolean;
    immediateBillingAllowed: boolean;
    periodicBillingAllowed: boolean;
    advanceBillingAllowed?: boolean;
    lastSynchronizedOn?: Date;
  };
}

export enum OcpiSettingsType {
  GIREVE = 'gireve',
}

export interface OcpiCommon {
  businessDetails: {
    name: string;
    website: string;
    logo: {
      url: string;
      thumbnail: string;
      category: string;
      type: string;
      width: string;
      height: string;
    }
  };
  cpo: {
    countryCode: string;
    partyID: string;
  };
  emsp: {
    countryCode: string;
    partyID: string;
  };
}

export interface OcpiSettings {
  id?: string;
  identifier: ComponentType.OCPI;
  sensitiveData: string[];
  type: OcpiSettingsType;
  ocpi: OcpiCommon;
}

export enum AnalyticsSettingsType {
  SAC = 'sac',
}

export interface AnalyticsLink extends Data {
  id: string; // 'number' is wrong! See table-data-source.enrichData() which does not digest 'id' field of type 'number'
  name: string;
  description: string;
  role: string;
  url: string;
}

export interface AnalyticsSettings {
  id?: string;
  identifier: ComponentType.ANALYTICS;
  sensitiveData: string[];
  type: AnalyticsSettingsType;
  sac: {
    mainUrl: string;
    timezone: string;
  };
  links: AnalyticsLink[];
}

export enum RefundSettingsType {
  CONCUR = 'concur',
}

export interface RefundSettings {
  id?: string;
  identifier: ComponentType.REFUND;
  type: RefundSettingsType;
  sensitiveData: string[];
  concur?: {
    authenticationUrl: string;
    apiUrl: string;
    clientId: string;
    clientSecret: string;
    paymentTypeId: string;
    expenseTypeCode: string;
    policyId: string;
    reportName: string;
  };
}
