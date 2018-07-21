import { Charger } from './charger';
import { Company } from './company';
import { Site } from './site';
import { Address } from './commons';

export class SiteArea {
  id: String;
  name: String;
  image: String;
  accessControl: Boolean;
  siteID: string;
  site: Site;
  chargeBoxes: Charger[];
}
