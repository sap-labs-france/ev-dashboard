import { AssetAuthorizationActions } from './Authorization';
import Consumption, { AbstractConsumption, AbstractCurrentConsumption } from './Consumption';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { KeyValue } from './GlobalType';
import { SiteArea } from './SiteArea';
import { TableData } from './Table';

export interface Asset
  extends TableData,
  CreatedUpdatedProps,
  AbstractCurrentConsumption,
  AssetAuthorizationActions {
  id: string;
  name: string;
  siteAreaID: string;
  siteArea: SiteArea;
  assetType: AssetType;
  staticValueWatt: number;
  fluctuationPercent: number;
  coordinates: number[];
  image: string;
  dynamicAsset: boolean;
  usesPushAPI: boolean;
  connectionID: string;
  meterID: string;
  consumption: AbstractConsumption;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
  connected: boolean;
  excludeFromSmartCharging?: boolean;
  variationThresholdPercent?: number;
  powerWattsLastSmartChargingRun?: number;
  issuer: boolean;
}

export interface AssetConsumption {
  assetID: string;
  values: Consumption[];
}

export enum AssetType {
  CONSUMPTION = 'CO',
  PRODUCTION = 'PR',
  CONSUMPTION_AND_PRODUCTION = 'CO-PR',
}

export const AssetTypes: KeyValue[] = [
  { key: AssetType.CONSUMPTION, value: 'assets.consume' },
  { key: AssetType.PRODUCTION, value: 'assets.produce' },
  { key: AssetType.CONSUMPTION_AND_PRODUCTION, value: 'assets.consume_and_produce' },
];

export enum AssetButtonAction {
  VIEW_ASSET = 'view_asset',
  EDIT_ASSET = 'edit_asset',
  CREATE_ASSET = 'create_asset',
  DELETE_ASSET = 'delete_asset',
  RETRIEVE_ASSET_CONSUMPTION = 'retrieve_asset_connection',
  CHECK_ASSET_CONNECTION = 'check_asset_connection',
}
