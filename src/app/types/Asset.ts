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
  assetType: string;
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
}

export interface AssetConsumption {
  assetID: string;
  values: Consumption[];
}

export const AssetTypes: KeyValue[] = [
  { key: 'CO', value: 'assets.consume' },
  { key: 'PR', value: 'assets.produce' },
];

export enum AssetButtonAction {
  VIEW_ASSET = 'view_asset',
  EDIT_ASSET = 'edit_asset',
  CREATE_ASSET = 'create_asset',
  DELETE_ASSET = 'delete_asset',
  RETRIEVE_ASSET_CONSUMPTION = 'retrieve_asset_connection',
  CHECK_ASSET_CONNECTION = 'check_asset_connection',
}
