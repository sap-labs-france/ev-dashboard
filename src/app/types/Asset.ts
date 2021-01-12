import Consumption, { AbstractConsumption } from './Consumption';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { KeyValue } from './GlobalType';
import { SiteArea } from './SiteArea';
import { Data } from './Table';

export interface Asset extends Data, CreatedUpdatedProps {
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
  connectionID: string;
  meterID: string;
  consumption: AbstractConsumption;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
  connected: boolean;
}

export interface AssetConsumption {
  assetID: string;
  values: Consumption[];
}

export enum AssetType {
  CO = 'CO',
  PR = 'PR',
  CO_PR = 'CO-PR',
}

export const AssetTypes: KeyValue[] = [
  { key: AssetType.CO, value: 'assets.consume' },
  { key: AssetType.PR, value: 'assets.produce' },
  { key: AssetType.CO_PR, value: 'assets.consume_and_produce' },
];

export enum AssetButtonAction {
  VIEW_ASSET = 'view_asset',
  EDIT_ASSET = 'edit_asset',
  CREATE_ASSET = 'create_asset',
  DELETE_ASSET = 'delete_asset',
  RETRIEVE_ASSET_CONSUMPTION = 'retrieve_asset_connection',
  CHECK_ASSET_CONNECTION = 'check_asset_connection',
}
