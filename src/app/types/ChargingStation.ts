import { KeyValue } from './GlobalType';
import { SiteArea } from './SiteArea';
import { Data } from './Table';
import { InactivityStatus } from './Transaction';

export interface ChargingStation extends Data {
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
  ocppVersion: OCPPVersion;
  ocppProtocol: OCPPProtocol;
  lastHeartBeat: Date;
  inactive: boolean;
  chargingStationURL: string;
  connectors: Connector[];
  siteArea: SiteArea;
  cannotChargeInParallel: boolean;
  maximumPower: number;
  powerLimitUnit: PowerLimitUnits;
  coordinates: number[];
  currentIPAddress: string;
  capabilities?: ChargingStationCapabilities;
  ocppAdvancedCommands?: OcppAdvancedCommands[];
  ocppStandardParameters?: KeyValue[];
  ocppVendorParameters?: KeyValue[];
  currentType: ChargingStationCurrentType;
}

export enum OCPPProtocol {
  SOAP = 'soap',
  JSON = 'json',
}

export enum OCPPVersion {
  VERSION_12 = '1.2',
  VERSION_15 = '1.5',
  VERSION_16 = '1.6',
  VERSION_20 = '2.0',
}

export enum OCPPResponse {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',

}

export enum ChargingStationCurrentType {
  AC = 'AC',
  DC = 'DC',
  AC_DC = 'AC/DC',
}

export interface ChargingStationPowers {
  notSupported: boolean;
  minAmp: number;
  maxAmp: number;
  currentAmp: number;
}

export interface OcppCommand {
  command: string;
  parameters: string[];
}

export interface OcppAdvancedCommands {
  command: string | OcppCommand;
}

export enum PowerLimitUnits {
  WATT = 'W',
  AMPERE = 'A',
}

export interface ChargingStationConfiguration {
  id: string;
  timestamp: Date;
  configuration: KeyValue[];
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
  voltage: number;
  amperage: number;
  amperageLimit: number;
  activeTransactionID: number;
  activeTransactionDate: Date;
  activeTagID: string;
  statusLastChangedOn?: Date;
  inactivityStatus: InactivityStatus;
  hasDetails: boolean;
  isStopAuthorized: boolean;
  isStartAuthorized: boolean;
  isTransactionDisplayAuthorized: boolean;
  numberOfConnectedPhase?: number;
  currentType?: ConnectorCurrentType;
}

export enum ConnectorCurrentType {
  AC = 'AC',
  DC = 'DC',
}

export interface ChargingStationCapabilities {
  supportStaticLimitationForChargingStation?: boolean;
  supportStaticLimitationPerConnector?: boolean;
  supportChargingProfiles?: boolean;
  supportTxDefaultProfile?: boolean;
}

export enum ChargingStationButtonAction {
  REBOOT = 'reboot',
  SOFT_RESET = 'soft_reset',
  CLEAR_CACHE = 'clear_cache',
  SMART_CHARGING = 'smart_charging',
  EDIT_CHARGERS = 'edit_chargers',
  DISPLAY_CHARGERS = 'display_chargers',
  EXPORT_OCPP_PARAMS = 'export_ocpp_params',
  FORCE_AVAILABLE_STATUS = 'force_available_status',
  FORCE_UNAVAILABLE_STATUS = 'force_unavailable_status',
}

export enum ConnStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  CHARGING = 'Charging',
  FAULTED = 'Faulted',
  RESERVED = 'Reserved',
  FINISHING = 'Finishing',
  PREPARING = 'Preparing',
  SUSPENDED_EVSE = 'SuspendedEVSE',
  SUSPENDED_EV = 'SuspendedEV',
  UNAVAILABLE = 'Unavailable',
}

export enum OCPPAvailabilityType {
  INOPERATIVE = 'Inoperative',
  OPERATIVE = 'Operative'
}
