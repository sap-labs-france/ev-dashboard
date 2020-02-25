import { Address } from './Address';
import { Data } from './Table';

export interface Building extends Data {
  id: string;
  name: string;
  address: Address;
  image: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export enum BuildingImage {
  NO_IMAGE = 'assets/img/theme/no-logo.png',
}
