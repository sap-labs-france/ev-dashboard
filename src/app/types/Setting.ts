import CreatedUpdatedProps from './CreatedUpdatedProps';
import { Data } from './Table';
import TenantComponents from './TenantComponents';

export enum TechnicalSettings {
  USER = 'user',
  CRYPTO = 'crypto'
}
export interface Setting extends Data, CreatedUpdatedProps {
  identifier: TenantComponents | TechnicalSettings;
  sensitiveData?: string[];
  category?: 'business' | 'technical';
}
export interface SettingDB extends CreatedUpdatedProps, Setting {
  content: SettingDBContent;
}

export interface SettingDBContent {
  type: CryptoSettingsType
    | RoamingSettingsType
    | AnalyticsSettingsType
    | RefundSettingsType
    | PricingSettingsType
    | BillingSettingsType
    | SmartChargingSettingsType
    | AssetSettingsType
    | CarConnectorSettingsType
    | UserSettingsType;
  ocpi?: OcpiSetting;
  oicp?: OicpSetting;
  simple?: SimplePricingSetting;
  convergentCharging?: ConvergentChargingPricingSetting;
  stripe?: StripeBillingSetting;
  sac?: SacAnalyticsSetting;
  links?: SettingLink[];
  concur?: ConcurRefundSetting;
  sapSmartCharging?: SapSmartChargingSetting;
  asset?: AssetSetting;
  carConnector?: CarConnectorSetting;
  crypto?: CryptoSetting;
  user?: UserSetting;
}

export interface SettingLink extends Data {
  id: string; // 'number' is wrong! See table-data-source.enrichData() which does not digest 'id' field of type 'number'
  name: string;
  description: string;
  role: string;
  url: string;
}

export enum PricingSettingsType {
  SIMPLE = 'simple',
  CONVERGENT_CHARGING = 'convergentCharging',
}

export interface PricingSettings extends Setting {
  identifier: TenantComponents.PRICING;
  type: PricingSettingsType;
  simple: SimplePricingSetting;
  convergentCharging: ConvergentChargingPricingSetting;
}

export interface PricingSetting {}

export interface SimplePricingSetting extends PricingSetting {
  price: number;
  currency: string;
}

export interface ConvergentChargingPricingSetting extends PricingSetting {
  url: string;
  chargeableItemName: string;
  user: string;
  password: string;
}

export enum RoamingSettingsType {
  OCPI = 'ocpi',
  OICP = 'oicp',
}

export interface RoamingSettings extends Setting {
  identifier: TenantComponents.OCPI | TenantComponents.OICP;
  type: RoamingSettingsType;
  ocpi?: OcpiSetting;
  oicp?: OicpSetting;
}

export interface OcpiSetting {
  currency: string;
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
    };
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

export interface OicpSetting {
  currency: string;
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
    };
  };
  cpo: OicpIdentifier;
  emsp: OicpIdentifier;
}

export interface OicpIdentifier {
  countryCode: string;
  partyID: string;
  key?: string;
  cert?: string;
}

export enum AnalyticsSettingsType {
  SAC = 'sac',
}

export interface AnalyticsSettings extends Setting {
  identifier: TenantComponents.ANALYTICS;
  type: AnalyticsSettingsType;
  sac: SacAnalyticsSetting;
  links: SettingLink[];
}

export interface SacAnalyticsSetting {
  mainUrl: string;
  timezone: string;
}

export enum SmartChargingSettingsType {
  SAP_SMART_CHARGING = 'sapSmartCharging',
}

export interface SmartChargingSettings extends Setting {
  identifier: TenantComponents.SMART_CHARGING;
  type: SmartChargingSettingsType;
  sapSmartCharging?: SapSmartChargingSetting;
}

export interface SapSmartChargingSetting {
  optimizerUrl: string;
  user: string;
  password: string;
  stickyLimitation: boolean;
  limitBufferDC: number;
  limitBufferAC: number;
}

export enum RefundSettingsType {
  CONCUR = 'concur',
}

export interface RefundSettings extends Setting {
  identifier: TenantComponents.REFUND;
  type: RefundSettingsType;
  concur?: ConcurRefundSetting;
}

export interface ConcurRefundSetting {
  authenticationUrl: string;
  apiUrl: string;
  appUrl: string;
  clientId: string;
  clientSecret: string;
  paymentTypeId: string;
  expenseTypeCode: string;
  policyId: string;
  reportName: string;
}

export enum BillingSettingsType {
  STRIPE = 'stripe',
}

export interface BillingSettings extends Setting {
  identifier: TenantComponents.BILLING;
  type: BillingSettingsType;
  stripe: StripeBillingSetting;
}

export interface BillingSetting {
  lastSynchronizedOn?: Date;
}

export interface StripeBillingSetting extends BillingSetting {
  url: string;
  secretKey: string;
  publicKey: string;
  noCardAllowed: boolean;
  immediateBillingAllowed: boolean;
  periodicBillingAllowed: boolean;
  advanceBillingAllowed: boolean;
  currency: string;
  taxID: string;
}

export enum AssetSettingsType {
  ASSET = 'asset',
}

export interface AssetSettings extends Setting {
  identifier: TenantComponents.ASSET;
  type: AssetSettingsType;
  asset?: AssetSetting;
}

export interface AssetSetting {
  connections: AssetConnectionSetting[];
}

export interface AssetConnectionSetting extends Data {
  id: string;
  name: string;
  description: string;
  url: string;
  type: AssetConnectionType;
  schneiderConnection?: AssetSchneiderConnectionType;
  greencomConnection?: AssetGreencomConnectionType;
}

export enum AssetConnectionType {
  NONE = '',
  SCHNEIDER = 'schneider',
  GREENCOM = 'greencom',
}

export interface AssetUserPasswordConnectionType {
  user: string;
  password: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AssetSchneiderConnectionType extends AssetUserPasswordConnectionType {}

export interface AssetGreencomConnectionType {
  clientId: string;
  clientSecret: string;
}

export enum CarConnectorSettingsType {
  CAR_CONNECTOR = 'carConnector',
}

export interface CarConnectorSettings extends Setting {
  identifier: TenantComponents.CAR_CONNECTOR;
  type: CarConnectorSettingsType;
  carConnector?: CarConnectorSetting;
}

export interface CarConnectorSetting {
  connections: CarConnectorConnectionSetting[];
}

export interface CarConnectorConnectionSetting extends Data {
  id: string;
  name: string;
  description: string;
  type: CarConnectorConnectionType;
  mercedesConnection?: CarConnectorMercedesConnectionType;
}

export enum CarConnectorConnectionType {
  NONE = '',
  MERCEDES = 'mercedes',
}

export interface CarConnectorMercedesConnectionType {
  authenticationUrl: string;
  apiUrl: string;
  clientId: string;
  clientSecret: string;
}

export enum CryptoSettingsType {
  CRYPTO = 'crypto',
}

export interface CryptoSettings extends Setting {
  identifier: TechnicalSettings.CRYPTO;
  type: CryptoSettingsType;
  crypto?: CryptoSetting;
}
export interface CryptoKeyProperties {
  blockCypher: string;
  blockSize: number;
  operationMode: string;
}

export interface CryptoSetting {
  key: string;
  keyProperties: CryptoKeyProperties;
  formerKey?: string;
  formerKeyProperties?: CryptoKeyProperties;
  migrationToBeDone?: boolean;
}

export enum UserSettingsType {
  USER = 'user',
}

export interface UserSettings extends Setting {
  identifier: TechnicalSettings.USER;
  type: UserSettingsType;
  user?: UserSetting;
}

export interface UserSetting {
  autoActivateAccountAfterValidation: boolean;
}
