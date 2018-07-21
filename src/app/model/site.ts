import { Address } from './commons';
import { SiteArea } from './site-area';
import { Company } from './company';
import { User } from './user';

export class Site {
  id: String;
  name: String;
  companyID: string;
  company: Company;
  siteAreas: SiteArea[];
  address: Address;
  image: String;
  images: Object[];
  gps: String;
  consumptionData: Object;
  occupationData: Object;
  userIDs: String[];
  users: User[];
  createdBy: String;
  createdOn: Date;
  lastChangedBy: String;
  lastChangedOn: Date;
}
