import { KeyValue } from './GlobalType';
import { SiteArea } from './SiteArea';
import { Data } from './Table';
import { InactivityStatus } from './Transaction';

export interface ChargingStation extends Data {
  id: string;
  issuer: boolean;
  private: boolean;
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialnumber: string;
  chargeBoxSerialnumber: string;
  firmwareVersion: string;
  firmwareUpdateStatus?: FirmwareStatus;
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

export enum ChargingStationCurrentType {
  AC = 'AC',
  DC = 'DC',
  AC_DC = 'AC/DC',
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

export interface Connector extends Data {
  connectorId: number;
  currentConsumption: number;
  currentStateOfCharge?: number;
  totalInactivitySecs?: number;
  totalConsumption?: number;
  status: ConnStatus;
  errorCode?: string;
  info?: string;
  vendorErrorCode?: string;
  power: number;
  type: ConnectorType;
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

export enum ConnectorType {
  TYPE_2 = 'T2',
  COMBO_CCS = 'CCS',
  CHADEMO = 'C',
  TYPE_1 = 'T1',
  TYPE_1_CCS = 'T1CCS',
  DOMESTIC = 'D',
  UNKNOWN = 'U',
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
  MIN_LIMIT = 2,
}
