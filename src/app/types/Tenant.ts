import { Address } from './Address';
import { TableData } from './Table';

export interface Tenant extends TableData {
  id: string;
  name: string;
  email: string;
  address: Address;
  subdomain: string;
  components?: TenantComponent;
  features?: TenantFeature;
  logo: string;
}

export interface TenantComponent {
  ocpi?: TenantComponentContent;
  oicp?: TenantComponentContent;
  organization?: TenantComponentContent;
  pricing?: TenantComponentContent;
  billing?: TenantComponentContent;
  billingPlatform?: TenantComponentContent;
  refund?: TenantComponentContent;
  statistics?: TenantComponentContent;
  analytics?: TenantComponentContent;
  smartCharging?: TenantComponentContent;
  asset?: TenantComponentContent;
  car?: TenantComponentContent;
  carConnector?: TenantComponentContent;
}

export interface TenantFeature {
  map?: boolean;
}

export interface TenantComponentContent {
  active: boolean;
  type: string;
}

export enum TenantButtonAction {
  EDIT_TENANT = 'edit_tenant',
  CREATE_TENANT = 'create_tenant',
  DELETE_TENANT = 'delete_tenant',
}

export enum TenantComponents {
  OCPI = 'ocpi',
  OICP = 'oicp',
  REFUND = 'refund',
  PRICING = 'pricing',
  ORGANIZATION = 'organization',
  STATISTICS = 'statistics',
  ANALYTICS = 'analytics',
  BILLING = 'billing',
  BILLING_PLATFORM = 'billingPlatform',
  ASSET = 'asset',
  SMART_CHARGING = 'smartCharging',
  CAR = 'car',
  CAR_CONNECTOR = 'carConnector',
  CHARGING_STATION_TEMPLATE = 'chargingStationTemplate',
}

export enum TenantFeatures {
  CHARGING_STATION_MAP = 'map',
}
