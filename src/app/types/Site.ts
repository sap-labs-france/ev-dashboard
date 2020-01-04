import { Address } from './Address';
import { Company } from './Company';
import { SiteArea } from './SiteArea';
import { Data } from './Table';
import { User } from './User';

export interface Site extends Data {
  id: string;
  name: string;
  companyID: string;
  company: Company;
  autoUserSiteAssignment: boolean;
  siteAreas: SiteArea[];
  address: Address;
  image: string;
  images: object[];
  gps: string;
  consumptionData: object;
  occupationData: object;
  userIDs: string[];
  users: User[];
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface UserSite extends Data {
  user: User;
  siteID: string;
  siteAdmin: boolean;
  siteOwner: boolean;
}

export interface SiteUser extends Data {
  site: Site;
  userID: string;
  siteAdmin: boolean;
  siteOwner: boolean;
}
