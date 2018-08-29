import { Address } from './commons';
import { SiteArea } from './site-area';
import { Company } from './company';
import { User } from './user';

export interface Site {
  id: string;
  name: string;
  companyID: string;
  company: Company;
  siteAreas: SiteArea[];
  address: Address;
  image: string;
  images: Object[];
  gps: string;
  consumptionData: Object;
  occupationData: Object;
  userIDs: string[];
  users: User[];
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}
