import { KeyValue } from './GlobalType';
import { SiteArea } from './SiteArea';
import { Data } from './Table';

export interface Asset extends Data {
  id: string;
  name: string;
  siteAreaID: string;
  siteArea: SiteArea;
  assetType: string;
  coordinates: number[];
  image: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export const AssetTypes: KeyValue[] = [
  { key: 'CO', value: 'assets.consume' },
  { key: 'PR', value: 'assets.produce' },
];

export enum AssetButtonAction {
  EDIT_ASSETS = 'edit_assets',
  DISPLAY_ASSETS = 'display_assets',
}

export enum AssetImage {
  NO_IMAGE = 'assets/img/theme/no-logo.png',
}
