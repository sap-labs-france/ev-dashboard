import {
  ChargePoint,
  ChargingRateUnitType,
  ChargingStationCapabilities,
  ConnectorType,
  CurrentType,
  Voltage,
} from './ChargingStation';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { TableData } from './Table';

export interface ChargingStationTemplate extends TableData, CreatedUpdatedProps {
  id: string;
  template: {
    hash?: string;
    hashTechnical?: string;
    hashCapabilities?: string;
    hashOcppStandard?: string;
    hashOcppVendor?: string;
    chargePointVendor: string;
    extraFilters: {
      chargePointModel: string;
      chargeBoxSerialNumber?: string;
    };
    technical: {
      masterSlave?: boolean;
      maximumPower: number;
      voltage: Voltage;
      powerLimitUnit: ChargingRateUnitType;
      chargePoints: ChargePoint[];
      connectors: ChargingStationTemplateConnector[];
    };
    capabilities: {
      supportedFirmwareVersions: string[];
      supportedOcppVersions: string[];
      capabilities: ChargingStationCapabilities;
    }[];
    ocppStandardParameters: {
      supportedFirmwareVersions: string[];
      supportedOcppVersions: string[];
      parameters: Record<string, string>;
    }[];
    ocppVendorParameters: {
      supportedFirmwareVersions: string[];
      supportedOcppVersions: string[];
      parameters: Record<string, string>;
    }[];
  };
}

export interface ChargingStationTemplateConnector {
  connectorId: number;
  type: ConnectorType;
  power?: number;
  amperage?: number;
  voltage?: Voltage;
  chargePointID?: number;
  currentType?: CurrentType;
  numberOfConnectedPhase?: number;
}

export enum ChargingStationTemplateButtonAction {
  VIEW_TEMPLATE = 'view_template',
  EDIT_TEMPLATE = 'edit_template',
  CREATE_TEMPLATE = 'create_template',
  DELETE_TEMPLATE = 'delete_template',
  EXPORT_TEMPLATE = 'export_template',
}
