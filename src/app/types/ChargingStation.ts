import { KeyValue } from './GlobalType';
import { SiteArea } from './SiteArea';
import { Data } from './Table';
import { InactivityStatus } from './Transaction';

export interface ChargingStation extends Data {
  id: string;
  templateHash?: string;
  templateHashTechnical?: string;
  issuer: boolean;
  private: boolean;
  siteAreaID?: string;
  chargePointSerialNumber: string;
  chargePointModel: string;
  chargeBoxSerialNumber: string;
  chargePointVendor: string;
  iccid: string;
  imsi: string;
  meterType: string;
  firmwareVersion: string;
  firmwareUpdateStatus?: FirmwareStatus;
  meterSerialNumber: string;
  endpoint: string;
  ocppVersion: OCPPVersion;
  ocppProtocol: OCPPProtocol;
  cfApplicationIDAndInstanceIndex: string;
  lastHeartBeat: Date;
  deleted: boolean;
  inactive: boolean;
  lastReboot: Date;
  chargingStationURL: string;
  maximumPower: number;
  voltage: Voltage;
  excludeFromSmartCharging?: boolean;
  excludeFromPowerLimitation?: boolean;
  powerLimitUnit: PowerLimitUnits;
  coordinates: number[];
  chargePoints: ChargePoint[];
  connectors: Connector[];
  currentIPAddress?: string;
  siteArea?: SiteArea;
  capabilities?: ChargingStationCapabilities;
  ocppStandardParameters?: KeyValue[];
  ocppVendorParameters?: KeyValue[];
  ocpiData?: {
    evse?: {
      uid: string;
      evse_id: string;
    };
  };
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

export enum OCPPConfigurationStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  REBOOT_REQUIRED = 'RebootRequired',
  NOT_SUPPORTED = 'NotSupported',
}

export enum OCPPGeneralResponse {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export interface ChargingStationPowers {
  notSupported: boolean;
  minAmp: number;
  minWatt: number;
  maxAmp: number;
  maxWatt: number;
  currentAmp: number;
  currentWatt: number;
}

export interface OcppCommand {
  command: string;
  parameters: string[];
}

export enum PowerLimitUnits {
  WATT = 'W',
  AMPERE = 'A',
}

export interface OcppParameter extends Data {
  key: string;
  value: string;
  readonly: boolean;
}

export interface ConsumptionValue {
  date: Date;
  instantPower: number;
  cumulatedConsumption: number;
  amount: number;
  stateOfCharge: number;
  cumulatedAmount: number;
  currencyCode: string;
  limitWatts: number;
}

export interface ChargePoint {
  chargePointID: number;
  currentType: CurrentType;
  voltage: Voltage;
  amperage: number;
  numberOfConnectedPhase: number;
  cannotChargeInParallel: boolean;
  sharePowerToAllConnectors: boolean;
  excludeFromPowerLimitation: boolean;
  ocppParamForPowerLimitation: string;
  power: number;
  efficiency: number;
  connectorIDs: number[];
  ampCurrentLimit?: number;
}

export interface Connector extends Data {
  connectorId: number;
  currentConsumption: number;
  currentStateOfCharge?: number;
  totalInactivitySecs?: number;
  totalConsumption?: number;
  status: ChargePointStatus;
  errorCode?: string;
  info?: string;
  vendorErrorCode?: string;
  power: number;
  type: ConnectorType;
  voltage?: Voltage;
  amperage?: number;
  amperageLimit?: number;
  activeTransactionID?: number;
  activeTransactionDate?: Date;
  activeTagID?: string;
  statusLastChangedOn?: Date;
  inactivityStatus?: InactivityStatus;
  numberOfConnectedPhase?: number;
  currentType?: CurrentType;
  chargePointID?: number;
  hasDetails: boolean;
  isStopAuthorized: boolean;
  isStartAuthorized: boolean;
  isTransactionDisplayAuthorized: boolean;
}

export enum Voltage {
  VOLTAGE_230 = 230,
  VOLTAGE_110 = 110,
}

export enum ConnectorType {
  TYPE_2 = 'T2',
  COMBO_CCS = 'CCS',
  CHADEMO = 'C',
  TYPE_1 = 'T1',
  TYPE_1_CCS = 'T1CCS',
  DOMESTIC = 'D',
  UNKNOWN = 'U',
}

export enum CurrentType {
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
  START_TRANSACTION = 'start_transaction',
  STOP_TRANSACTION = 'stop_transaction',
  EDIT_CHARGING_STATION = 'edit_charging_station',
  DELETE_CHARGING_STATION = 'delete_charging_station',
  EXPORT_CHARGING_STATIONS = 'export_charging_stations',
  EXPORT_OCPP_PARAMS = 'export_ocpp_params',
  FORCE_AVAILABLE_STATUS = 'force_available_status',
  FORCE_UNAVAILABLE_STATUS = 'force_unavailable_status',
}

export enum ChargePointStatus {
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

export enum FirmwareStatus {
  DOWNLOADED = 'Downloaded',
  DOWNLOAD_FAILED = 'DownloadFailed',
  DOWNLOADING = 'Downloading',
  IDLE = 'Idle',
  INSTALLATION_FAILED = 'InstallationFailed',
  INSTALLING = 'Installing',
  INSTALLED = 'Installed',
}

export enum OCPPAvailabilityType {
  INOPERATIVE = 'Inoperative',
  OPERATIVE = 'Operative',
}

export enum StaticLimitAmps {
  MIN_LIMIT = 6,
}
