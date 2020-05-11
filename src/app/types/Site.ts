import { Address } from './Address';
import { Company } from './Company';
import { Data } from './Table';
import { SiteArea } from './SiteArea';
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

export enum SiteButtonAction {
  VIEW_SITE = 'view_site',
  EDIT_SITE = 'edit_site',
  CREATE_SITE = 'create_site',
  DELETE_SITE = 'delete_site',
  ASSIGN_USERS_TO_SITE = 'assign_users_to_site'
}

export enum SiteImage {
  NO_IMAGE = 'assets/img/theme/no-logo.png',
}
