import { Charger } from './charger';
import { Site } from './site';

export interface SiteArea {
  id: string;
  name: string;
  image: string;
  accessControl: boolean;
  siteID: string;
  site: Site;
  chargeBoxes: Charger[];
}
