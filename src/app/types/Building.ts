import { Address } from './Address';
import { SiteArea } from './SiteArea';
import { Data } from './Table';

export interface Building extends Data {
  id: string;
  name: string;
  siteAreaID: string;
  siteArea: SiteArea;
  address: Address;
  image: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export enum BuildingButtonAction {
  EDIT_SITE_AREAS = 'edit_site_areas',
  DISPLAY_SITE_AREAS = 'display_site_areas',
}

export enum BuildingImage {
  NO_IMAGE = 'assets/img/theme/no-logo.png',
}
