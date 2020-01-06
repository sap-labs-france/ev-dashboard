import { Address } from './Address';
import { ChargingStation } from './ChargingStation';
import { Site } from './Site';
import { Data } from './Table';

export interface SiteArea extends Data {
  id: string;
  name: string;
  image: string;
  address: Address;
  maximumPower: number;
  accessControl: boolean;
  siteID: string;
  site: Site;
  chargeBoxes: ChargingStation[];
}
