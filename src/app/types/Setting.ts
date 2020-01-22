import { Data } from './Table';

export enum ComponentType {
  OCPI = 'ocpi',
  ORGANIZATION = 'organization',
  PRICING = 'pricing',
  BILLING = 'billing',
  REFUND = 'refund',
  STATISTICS = 'statistics',
  ANALYTICS = 'analytics',
  SMART_CHARGING = 'smartCharging',
}

export interface Setting extends Data {
  id: string;
  identifier: ComponentType;
  sensitiveData: string[];
  content: any;
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
  identifier: ComponentType.PRICING;
  type: PricingSettingsType;
  simple: SimplePricingSetting;
  convergentCharging: ConvergentChargingPricingSetting;
}

export interface PricingSetting {
}

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
  GIREVE = 'gireve',
}

export interface RoamingSettings extends Setting {
  identifier: ComponentType.OCPI;
  type: RoamingSettingsType;
  ocpi: OcpiSetting;
}

export interface OcpiSetting {
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

export enum AnalyticsSettingsType {
  SAC = 'sac',
}

export interface AnalyticsSettings extends Setting {
  identifier: ComponentType.ANALYTICS;
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
  identifier: ComponentType.SMART_CHARGING;
  type: SmartChargingSettingsType;
  sapSmartCharging?: SapSmartChargingSetting;
}

export interface SapSmartChargingSetting {
  optimizerUrl: string;
  user: string;
  password: string;
}

export enum RefundSettingsType {
  CONCUR = 'concur',
}

export interface RefundSettings extends Setting {
  identifier: ComponentType.REFUND;
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
  identifier: ComponentType.BILLING;
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
